import { useCallback, useEffect, useRef, useState } from 'react';
import type { CloseOverlaysFn } from './controls';
import {
  classifyRequiredGlide,
  formatDistance,
  getDistanceLabelIntervalMeters,
  getRequiredGlideRatio,
  getWindAdjustedGlideThresholds,
  GLIDE_BAND_COLORS,
  type GlideBandColor,
  type GlideConditions,
} from '@/lib/glideMeasurement/calculations';
import {
  getGlideMeasurementConditions,
  setGlideMeasurementConditions,
} from '@/lib/localstorage/glideMeasurementStorage';
import { useGlideMeasurementMode } from '@/contexts/GlideMeasurementModeContext';

const LONG_PRESS_DURATION_MS = 2_000;
const ELEVATION_SAMPLE_SPACING_METERS = 100;
const MAX_ELEVATION_SAMPLES_PER_REQUEST = 512;
const MAX_ELEVATION_REQUESTS_PER_ROUTE = 16;

type MapPosition = google.maps.LatLngLiteral;

type MeasurementPoint = {
  id: string;
  position: MapPosition;
};

type ElevationSample = {
  position: MapPosition;
  elevationMeters: number;
  distanceFromLegStartMeters: number;
};

type ElevationLeg = {
  samples: ElevationSample[];
  distanceMeters: number;
  courseDegrees: number;
};

type ConditionsDialogMode = 'start' | 'edit';

const toMapPosition = (position: google.maps.LatLng): MapPosition => ({
  lat: position.lat(),
  lng: position.lng(),
});

const asLatLng = (position: MapPosition) => new google.maps.LatLng(position.lat, position.lng);

const requestElevationAlongPath = (
  elevationService: google.maps.ElevationService,
  path: MapPosition[],
  samples: number
) =>
  new Promise<google.maps.ElevationResult[]>((resolve, reject) => {
    elevationService.getElevationAlongPath({ path, samples }, (results, status) => {
      if (status === google.maps.ElevationStatus.OK && results) {
        resolve(results);
        return;
      }

      reject(new Error(`Google Maps Elevation API returned ${status}.`));
    });
  });

const sampleElevationLeg = async (
  elevationService: google.maps.ElevationService,
  origin: MapPosition,
  destination: MapPosition
): Promise<ElevationLeg> => {
  const spherical = google.maps.geometry.spherical;
  const originLatLng = asLatLng(origin);
  const destinationLatLng = asLatLng(destination);
  const distanceMeters = spherical.computeDistanceBetween(originLatLng, destinationLatLng);
  const courseDegrees = spherical.computeHeading(originLatLng, destinationLatLng);

  if (distanceMeters < 1) {
    return {
      samples: [],
      distanceMeters,
      courseDegrees,
    };
  }

  const requestedIntervals = Math.ceil(distanceMeters / ELEVATION_SAMPLE_SPACING_METERS);
  const maximumIntervals = MAX_ELEVATION_REQUESTS_PER_ROUTE * (MAX_ELEVATION_SAMPLES_PER_REQUEST - 1);
  const intervalCount = Math.min(requestedIntervals, maximumIntervals);
  const samples: ElevationSample[] = [];

  for (let intervalStart = 0; intervalStart < intervalCount; intervalStart += MAX_ELEVATION_SAMPLES_PER_REQUEST - 1) {
    const intervalsInRequest = Math.min(MAX_ELEVATION_SAMPLES_PER_REQUEST - 1, intervalCount - intervalStart);
    const startFraction = intervalStart / intervalCount;
    const endFraction = (intervalStart + intervalsInRequest) / intervalCount;
    const path = [
      toMapPosition(spherical.interpolate(originLatLng, destinationLatLng, startFraction)),
      toMapPosition(spherical.interpolate(originLatLng, destinationLatLng, endFraction)),
    ];
    const results = await requestElevationAlongPath(elevationService, path, intervalsInRequest + 1);
    const firstResultIndex = intervalStart === 0 ? 0 : 1;

    for (const [resultIndex, result] of results.slice(firstResultIndex).entries()) {
      if (!result.location) {
        throw new Error('Google Maps Elevation API returned a sample without a location.');
      }
      const indexInRequest = resultIndex + firstResultIndex;
      samples.push({
        position: toMapPosition(result.location),
        elevationMeters: result.elevation,
        distanceFromLegStartMeters: ((intervalStart + indexInRequest) / intervalCount) * distanceMeters,
      });
    }
  }

  return {
    samples,
    distanceMeters,
    courseDegrees,
  };
};

const findPositionAtDistance = (samples: ElevationSample[], distanceMeters: number): MapPosition | null => {
  if (samples.length === 0) return null;
  if (distanceMeters <= 0) return samples[0].position;
  if (distanceMeters >= samples[samples.length - 1].distanceFromLegStartMeters) {
    return samples[samples.length - 1].position;
  }

  const nextSampleIndex = samples.findIndex(sample => sample.distanceFromLegStartMeters >= distanceMeters);
  if (nextSampleIndex <= 0) return samples[0].position;

  const previousSample = samples[nextSampleIndex - 1];
  const nextSample = samples[nextSampleIndex];
  const span = nextSample.distanceFromLegStartMeters - previousSample.distanceFromLegStartMeters;
  const fraction = span === 0 ? 0 : (distanceMeters - previousSample.distanceFromLegStartMeters) / span;

  return toMapPosition(
    google.maps.geometry.spherical.interpolate(
      asLatLng(previousSample.position),
      asLatLng(nextSample.position),
      fraction
    )
  );
};

interface UseGlideMeasurementProps {
  mapInstance: google.maps.Map | null;
  closeOverlays: CloseOverlaysFn;
}

export const useGlideMeasurement = ({ mapInstance, closeOverlays }: UseGlideMeasurementProps) => {
  const { clearMeasurementRequestId, disarmMeasurement, isMeasurementArmed, setMeasurementActive } =
    useGlideMeasurementMode();
  const [points, setPoints] = useState<MeasurementPoint[]>([]);
  const [conditions, setConditions] = useState<GlideConditions>(() => getGlideMeasurementConditions());
  const [isConditionsDialogOpen, setIsConditionsDialogOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [measurementError, setMeasurementError] = useState<string | null>(null);

  const pointsRef = useRef(points);
  const isMeasuringRef = useRef(false);
  const isConditionsDialogOpenRef = useRef(false);
  const conditionsDialogModeRef = useRef<ConditionsDialogMode>('start');
  const pendingStartPositionRef = useRef<MapPosition | null>(null);
  const pointIdRef = useRef(0);
  const elevationRequestRef = useRef(0);
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressNextMapClickRef = useRef(false);
  const suppressNextPointClickRef = useRef(false);
  const suppressNextMapRightClickRef = useRef(false);
  const lastClearMeasurementRequestIdRef = useRef(clearMeasurementRequestId);
  const pointMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const routePolylinesRef = useRef<google.maps.Polyline[]>([]);
  const distanceMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const dragGuidePolylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  useEffect(() => {
    isConditionsDialogOpenRef.current = isConditionsDialogOpen;
  }, [isConditionsDialogOpen]);

  useEffect(() => {
    setMeasurementActive(points.length > 0);
  }, [points.length, setMeasurementActive]);

  useEffect(() => {
    return () => {
      setMeasurementActive(false);
    };
  }, [setMeasurementActive]);

  const clearPointMarkers = useCallback(() => {
    pointMarkersRef.current.forEach(marker => {
      marker.map = null;
    });
    pointMarkersRef.current = [];
  }, []);

  const clearRouteOverlays = useCallback(() => {
    routePolylinesRef.current.forEach(polyline => polyline.setMap(null));
    distanceMarkersRef.current.forEach(marker => {
      marker.map = null;
    });
    routePolylinesRef.current = [];
    distanceMarkersRef.current = [];
  }, []);

  const clearDragGuides = useCallback(() => {
    dragGuidePolylinesRef.current.forEach(polyline => polyline.setMap(null));
    dragGuidePolylinesRef.current = [];
  }, []);

  const drawDragGuides = useCallback(
    (pointIndex: number, position: MapPosition) => {
      clearDragGuides();
      if (!mapInstance) return;

      const adjacentPoints = [pointsRef.current[pointIndex - 1], pointsRef.current[pointIndex + 1]].filter(
        (point): point is MeasurementPoint => Boolean(point)
      );

      dragGuidePolylinesRef.current = adjacentPoints.map(
        adjacentPoint =>
          new google.maps.Polyline({
            clickable: false,
            icons: [
              {
                icon: {
                  path: 'M 0,-1 0,1',
                  strokeColor: '#111827',
                  strokeOpacity: 0.95,
                  strokeWeight: 2,
                },
                repeat: '12px',
              },
            ],
            map: mapInstance,
            path: [position, adjacentPoint.position],
            strokeOpacity: 0,
            zIndex: 350,
          })
      );
    },
    [clearDragGuides, mapInstance]
  );

  const cancelLongPress = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  const clearMeasurement = useCallback(() => {
    cancelLongPress();
    elevationRequestRef.current += 1;
    isMeasuringRef.current = false;
    setMeasurementActive(false);
    pendingStartPositionRef.current = null;
    clearPointMarkers();
    clearRouteOverlays();
    clearDragGuides();
    setPoints([]);
    setIsCalculating(false);
    setMeasurementError(null);
  }, [cancelLongPress, clearDragGuides, clearPointMarkers, clearRouteOverlays, setMeasurementActive]);

  useEffect(() => {
    if (clearMeasurementRequestId === lastClearMeasurementRequestIdRef.current) return;

    lastClearMeasurementRequestIdRef.current = clearMeasurementRequestId;
    clearMeasurement();
  }, [clearMeasurement, clearMeasurementRequestId]);

  const openConditionsDialog = useCallback(
    (position: MapPosition) => {
      if (isConditionsDialogOpenRef.current) return;

      closeOverlays();
      setConditions(getGlideMeasurementConditions());
      pendingStartPositionRef.current = position;
      conditionsDialogModeRef.current = 'start';
      isConditionsDialogOpenRef.current = true;
      setIsConditionsDialogOpen(true);
      setMeasurementError(null);
    },
    [closeOverlays]
  );

  const openRouteConditionsDialog = useCallback(() => {
    if (!isMeasuringRef.current || isConditionsDialogOpenRef.current) return;

    cancelLongPress();
    closeOverlays();
    pendingStartPositionRef.current = null;
    conditionsDialogModeRef.current = 'edit';
    suppressNextMapClickRef.current = true;
    window.setTimeout(() => {
      suppressNextMapClickRef.current = false;
    }, 0);
    isConditionsDialogOpenRef.current = true;
    setIsConditionsDialogOpen(true);
  }, [cancelLongPress, closeOverlays]);

  const startOrClearMeasurement = useCallback(
    (position: MapPosition) => {
      if (isMeasuringRef.current) {
        clearMeasurement();
        return;
      }

      openConditionsDialog(position);
    },
    [clearMeasurement, openConditionsDialog]
  );

  const armLongPress = useCallback(
    (position: MapPosition, source: 'map' | 'point') => {
      cancelLongPress();
      longPressTimeoutRef.current = setTimeout(() => {
        longPressTimeoutRef.current = null;
        if (source === 'map') {
          suppressNextMapClickRef.current = true;
        } else {
          suppressNextPointClickRef.current = true;
        }
        startOrClearMeasurement(position);
      }, LONG_PRESS_DURATION_MS);
    },
    [cancelLongPress, startOrClearMeasurement]
  );

  const removePoint = useCallback(
    (pointId: string) => {
      const remainingPoints = pointsRef.current.filter(point => point.id !== pointId);
      if (remainingPoints.length === 0) {
        clearMeasurement();
        return;
      }

      setPoints(remainingPoints);
      setMeasurementError(null);
    },
    [clearMeasurement]
  );

  const addPoint = useCallback((position: MapPosition) => {
    const point: MeasurementPoint = {
      id: `glide-measurement-${pointIdRef.current++}`,
      position,
    };
    const nextPoints = [...pointsRef.current, point];
    pointsRef.current = nextPoints;
    setPoints(nextPoints);
  }, []);

  const movePoint = useCallback((pointId: string, position: MapPosition) => {
    const movedPoints = pointsRef.current.map(point => (point.id === pointId ? { ...point, position } : point));
    pointsRef.current = movedPoints;
    setPoints(movedPoints);
    setMeasurementError(null);
  }, []);

  const handleMapClick = useCallback(
    (position: MapPosition) => {
      cancelLongPress();

      if (suppressNextMapClickRef.current) {
        suppressNextMapClickRef.current = false;
        return true;
      }

      if (isConditionsDialogOpenRef.current) {
        return true;
      }

      if (isMeasurementArmed) {
        disarmMeasurement();
        openConditionsDialog(position);
        return true;
      }

      if (!isMeasuringRef.current) {
        return false;
      }

      addPoint(position);
      return true;
    },
    [addPoint, cancelLongPress, disarmMeasurement, isMeasurementArmed, openConditionsDialog]
  );

  const handleApplyConditions = useCallback(
    (nextConditions: GlideConditions) => {
      if (conditionsDialogModeRef.current === 'edit' && isMeasuringRef.current) {
        const savedConditions = setGlideMeasurementConditions(nextConditions);
        setConditions(savedConditions);
        conditionsDialogModeRef.current = 'start';
        setIsConditionsDialogOpen(false);
        isConditionsDialogOpenRef.current = false;
        setMeasurementError(null);
        return;
      }

      const startPosition = pendingStartPositionRef.current;
      if (!startPosition) {
        setIsConditionsDialogOpen(false);
        isConditionsDialogOpenRef.current = false;
        return;
      }

      const savedConditions = setGlideMeasurementConditions(nextConditions);
      const firstPoint: MeasurementPoint = {
        id: `glide-measurement-${pointIdRef.current++}`,
        position: startPosition,
      };

      setConditions(savedConditions);
      pointsRef.current = [firstPoint];
      isMeasuringRef.current = true;
      setMeasurementActive(true);
      pendingStartPositionRef.current = null;
      conditionsDialogModeRef.current = 'start';
      isConditionsDialogOpenRef.current = false;
      setPoints([firstPoint]);
      setIsConditionsDialogOpen(false);
      setMeasurementError(null);
    },
    [setMeasurementActive]
  );

  const handleCancelConditions = useCallback(() => {
    pendingStartPositionRef.current = null;
    conditionsDialogModeRef.current = 'start';
    isConditionsDialogOpenRef.current = false;
    setIsConditionsDialogOpen(false);
  }, []);

  useEffect(() => {
    if (!mapInstance) return;

    const rightClickListener = mapInstance.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
      cancelLongPress();
      if (suppressNextMapRightClickRef.current) {
        suppressNextMapRightClickRef.current = false;
        return;
      }
      if (!event.latLng) return;
      startOrClearMeasurement(toMapPosition(event.latLng));
    });
    const mouseDownListener = mapInstance.addListener('mousedown', (event: google.maps.MapMouseEvent) => {
      if (!event.latLng || isConditionsDialogOpenRef.current) return;
      armLongPress(toMapPosition(event.latLng), 'map');
    });
    const mouseUpListener = mapInstance.addListener('mouseup', cancelLongPress);
    const dragStartListener = mapInstance.addListener('dragstart', cancelLongPress);
    const dragListener = mapInstance.addListener('drag', cancelLongPress);
    const mapElement = mapInstance.getDiv();
    mapElement.addEventListener('pointerup', cancelLongPress);
    mapElement.addEventListener('pointercancel', cancelLongPress);
    mapElement.addEventListener('pointermove', cancelLongPress);

    return () => {
      rightClickListener.remove();
      mouseDownListener.remove();
      mouseUpListener.remove();
      dragStartListener.remove();
      dragListener.remove();
      mapElement.removeEventListener('pointerup', cancelLongPress);
      mapElement.removeEventListener('pointercancel', cancelLongPress);
      mapElement.removeEventListener('pointermove', cancelLongPress);
      cancelLongPress();
    };
  }, [armLongPress, cancelLongPress, mapInstance, startOrClearMeasurement]);

  useEffect(() => {
    clearPointMarkers();
    if (!mapInstance) return;

    points.forEach((point, pointIndex) => {
      let hasDragged = false;
      const markerContent = document.createElement('div');
      markerContent.setAttribute('aria-hidden', 'true');
      markerContent.className =
        'size-6 cursor-grab rounded-full border-2 border-slate-950 bg-white p-0 shadow-md transition-transform hover:scale-125 active:cursor-grabbing focus-visible:scale-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';
      markerContent.style.translate = '0 50%';

      const marker = new google.maps.marker.AdvancedMarkerElement({
        content: markerContent,
        gmpClickable: true,
        gmpDraggable: true,
        map: mapInstance,
        position: point.position,
        title: 'Målepunkt. Dra for å flytte eller trykk for å fjerne.',
        zIndex: 10_000,
      });

      marker.addEventListener('gmp-click', () => {
        cancelLongPress();
        if (hasDragged) return;
        if (suppressNextPointClickRef.current) {
          suppressNextPointClickRef.current = false;
          return;
        }
        removePoint(point.id);
      });
      markerContent.addEventListener('contextmenu', event => {
        event.preventDefault();
        event.stopPropagation();
        suppressNextMapRightClickRef.current = true;
        window.setTimeout(() => {
          suppressNextMapRightClickRef.current = false;
        }, 0);
        clearMeasurement();
      });
      markerContent.addEventListener('pointerdown', () => {
        armLongPress(point.position, 'point');
      });
      markerContent.addEventListener('pointermove', cancelLongPress);
      markerContent.addEventListener('pointerup', cancelLongPress);
      markerContent.addEventListener('pointercancel', cancelLongPress);
      marker.addListener('dragstart', () => {
        hasDragged = true;
        cancelLongPress();
        drawDragGuides(pointIndex, point.position);
      });
      marker.addListener('drag', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          drawDragGuides(pointIndex, toMapPosition(event.latLng));
        }
      });
      marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        cancelLongPress();
        clearDragGuides();
        if (event.latLng) {
          movePoint(point.id, toMapPosition(event.latLng));
        }
        window.setTimeout(() => {
          hasDragged = false;
        }, 0);
      });

      pointMarkersRef.current.push(marker);
    });

    return clearPointMarkers;
  }, [
    armLongPress,
    cancelLongPress,
    clearDragGuides,
    clearMeasurement,
    clearPointMarkers,
    drawDragGuides,
    mapInstance,
    movePoint,
    points,
    removePoint,
  ]);

  useEffect(() => {
    const requestId = ++elevationRequestRef.current;
    clearRouteOverlays();

    if (!mapInstance || points.length < 2) {
      setIsCalculating(false);
      return;
    }

    const renderRoute = async () => {
      setIsCalculating(true);
      setMeasurementError(null);

      try {
        const elevationService = new google.maps.ElevationService();
        const elevationLegs: ElevationLeg[] = [];
        for (let pointIndex = 1; pointIndex < points.length; pointIndex += 1) {
          const elevationLeg = await sampleElevationLeg(
            elevationService,
            points[pointIndex - 1].position,
            points[pointIndex].position
          );
          if (elevationRequestRef.current !== requestId) return;
          elevationLegs.push(elevationLeg);
        }

        if (elevationRequestRef.current !== requestId) return;

        const routePolylines: google.maps.Polyline[] = [];
        const distanceMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
        const routeStartElevationMeters = elevationLegs.find(leg => leg.samples.length > 0)?.samples[0].elevationMeters;
        if (routeStartElevationMeters === undefined) {
          setIsCalculating(false);
          return;
        }

        let distanceBeforeLegMeters = 0;
        elevationLegs.forEach(leg => {
          if (leg.samples.length < 2) {
            distanceBeforeLegMeters += leg.distanceMeters;
            return;
          }

          const adjustedThresholds = getWindAdjustedGlideThresholds(conditions, leg.courseDegrees);
          let activeColor: GlideBandColor | null = null;
          let activePath: MapPosition[] = [];

          const addPolyline = () => {
            if (!activeColor || activePath.length < 2) return;
            const polyline = new google.maps.Polyline({
              clickable: true,
              map: mapInstance,
              path: activePath,
              strokeColor: GLIDE_BAND_COLORS[activeColor],
              strokeOpacity: 0.95,
              strokeWeight: 5,
              zIndex: 300,
            });
            polyline.addListener('click', (event: google.maps.MapMouseEvent) => {
              event.domEvent?.stopPropagation();
              openRouteConditionsDialog();
            });
            routePolylines.push(polyline);
          };

          for (let sampleIndex = 1; sampleIndex < leg.samples.length; sampleIndex += 1) {
            const previousSample = leg.samples[sampleIndex - 1];
            const sample = leg.samples[sampleIndex];
            const requiredGlideRatio = getRequiredGlideRatio(
              distanceBeforeLegMeters + sample.distanceFromLegStartMeters,
              routeStartElevationMeters,
              sample.elevationMeters
            );
            const color = classifyRequiredGlide(requiredGlideRatio, adjustedThresholds);

            if (activeColor === color) {
              activePath.push(sample.position);
              continue;
            }

            addPolyline();
            activeColor = color;
            activePath = [previousSample.position, sample.position];
          }

          addPolyline();
          distanceBeforeLegMeters += leg.distanceMeters;
        });

        const totalDistanceMeters = elevationLegs.reduce((total, leg) => total + leg.distanceMeters, 0);
        const labelIntervalMeters = getDistanceLabelIntervalMeters(totalDistanceMeters);

        for (
          let labelDistanceMeters = labelIntervalMeters;
          labelDistanceMeters < totalDistanceMeters;
          labelDistanceMeters += labelIntervalMeters
        ) {
          let distanceBeforeLegMeters = 0;
          const leg = elevationLegs.find(currentLeg => {
            const isWithinLeg = labelDistanceMeters <= distanceBeforeLegMeters + currentLeg.distanceMeters;
            if (!isWithinLeg) {
              distanceBeforeLegMeters += currentLeg.distanceMeters;
            }
            return isWithinLeg;
          });
          if (!leg) continue;

          const distanceInLegMeters = labelDistanceMeters - distanceBeforeLegMeters;
          const position = findPositionAtDistance(leg.samples, distanceInLegMeters);

          if (position) {
            const tickStart = toMapPosition(
              google.maps.geometry.spherical.computeOffset(asLatLng(position), 6, leg.courseDegrees + 90)
            );
            const tickEnd = toMapPosition(
              google.maps.geometry.spherical.computeOffset(asLatLng(position), 6, leg.courseDegrees - 90)
            );
            const tickLine = new google.maps.Polyline({
              clickable: false,
              map: mapInstance,
              path: [tickStart, tickEnd],
              strokeColor: '#111827',
              strokeOpacity: 0.85,
              strokeWeight: 2,
              zIndex: 400,
            });
            routePolylines.push(tickLine);

            const labelContent = document.createElement('span');
            labelContent.className =
              'pointer-events-none whitespace-nowrap rounded bg-white/90 px-1 py-0.5 text-[11px] font-semibold text-slate-900 shadow-sm';
            labelContent.textContent = formatDistance(labelDistanceMeters);
            distanceMarkers.push(
              new google.maps.marker.AdvancedMarkerElement({
                content: labelContent,
                map: mapInstance,
                position,
                zIndex: 400,
              })
            );
          }
        }

        const destinationPoint = points[points.length - 1];
        const destinationLabel = document.createElement('span');
        destinationLabel.className =
          'whitespace-nowrap rounded bg-white/95 px-1.5 py-0.5 text-xs font-bold text-slate-950 shadow-md';
        destinationLabel.textContent = formatDistance(totalDistanceMeters);
        // The marker anchors its content at bottom-center, so the left padding shifts the label 32px right
        // of the knob in screen pixels and the translate centers it vertically on the point.
        const destinationLabelContent = document.createElement('div');
        destinationLabelContent.className = 'pointer-events-none pl-16';
        destinationLabelContent.style.translate = '0 50%';
        destinationLabelContent.appendChild(destinationLabel);
        distanceMarkers.push(
          new google.maps.marker.AdvancedMarkerElement({
            content: destinationLabelContent,
            map: mapInstance,
            position: destinationPoint.position,
            zIndex: 500,
          })
        );

        routePolylinesRef.current = routePolylines;
        distanceMarkersRef.current = distanceMarkers;
        setIsCalculating(false);
      } catch (error) {
        if (elevationRequestRef.current !== requestId) return;

        console.error('Unable to render glide measurement route:', error);
        setIsCalculating(false);
        setMeasurementError('Kunne ikke hente terrenghøyder for målingen. Prøv på nytt om litt.');
      }
    };

    void renderRoute();
  }, [clearRouteOverlays, conditions, mapInstance, openRouteConditionsDialog, points]);

  useEffect(() => {
    return () => {
      cancelLongPress();
      elevationRequestRef.current += 1;
      clearDragGuides();
      clearPointMarkers();
      clearRouteOverlays();
    };
  }, [cancelLongPress, clearDragGuides, clearPointMarkers, clearRouteOverlays]);

  return {
    clearMeasurement,
    conditions,
    handleApplyConditions,
    handleCancelConditions,
    handleMapClick,
    isCalculating,
    isConditionsDialogOpen,
    isMeasurementArmed,
    isMeasuring: points.length > 0,
    measurementError,
  };
};

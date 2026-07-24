import { Cluster, Renderer } from '@googlemaps/markerclusterer';
import {
  createParaglidingMarkerElementWithDirection,
  createWeatherStationClusterElement,
  createWeatherStationClusterCircleElement,
  createLandingMarkerElement,
} from '../../shared/Markers';
import { ParaglidingLocationWithForecast } from '@/lib/supabase/types';
import { getDominantWind } from './util';

export class WeatherStationClusterRenderer implements Renderer {
  public render(cluster: Cluster) {
    const position = cluster.position;
    const markers = cluster.markers;

    // Calculate mean wind data from clustered markers
    const { windSpeed, windDirection, hasDirection } = getDominantWind(markers);

    // Directional groups get the wind arrow; direction-less groups get a circle
    // coloured by the strongest wind in the cluster.
    const markerElement = hasDirection
      ? createWeatherStationClusterElement(windSpeed, windDirection)
      : createWeatherStationClusterCircleElement(windSpeed);

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position,
      content: markerElement,
      zIndex: 2000 + cluster.count,
    });

    return marker;
  }
}

export class ParaglidingClusterRenderer implements Renderer {
  public render(cluster: Cluster) {
    const position = cluster.position;

    const markerElement = createParaglidingMarkerElementWithDirection();

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position,
      content: markerElement,
      zIndex: 1000 + cluster.count,
    });

    return marker;
  }
}

export class LandingClusterRenderer implements Renderer {
  public render(cluster: Cluster) {
    const position = cluster.position;

    // Create cluster element using landing marker element
    const markerElement = createLandingMarkerElement();

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position,
      content: markerElement,
      zIndex: 500 + cluster.count, // Lower z-index than paragliding markers
    });

    return marker;
  }
}

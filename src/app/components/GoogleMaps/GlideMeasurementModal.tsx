'use client';

import { useEffect, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import {
  AIRSPEED_MAX_MPS,
  AIRSPEED_MIN_MPS,
  GLIDE_THRESHOLD_MAX,
  GLIDE_THRESHOLD_MIN,
  normalizeDirectionDegrees,
  normalizeGlideConditions,
  WIND_SPEED_MAX_MPS,
  type GlideConditions,
} from '@/lib/glideMeasurement/calculations';

interface GlideMeasurementModalProps {
  isOpen: boolean;
  initialConditions: GlideConditions;
  onApply: (conditions: GlideConditions) => void;
  onCancel: () => void;
}

const DIRECTION_LABELS = ['N', 'NØ', 'Ø', 'SØ', 'S', 'SV', 'V', 'NV'];
const WIND_SPEED_WHEEL_VALUES = Array.from({ length: WIND_SPEED_MAX_MPS + 1 }, (_, speed) => speed);
const WIND_SPEED_ROW_HEIGHT_PX = 32;

const handleSize = { width: 21, height: 21, marginTop: -7 };

const clampWindSpeed = (speed: number) => Math.min(Math.max(Math.round(speed), 0), WIND_SPEED_MAX_MPS);

const PRECISE_DIRECTION_LABELS = [
  'N',
  'NNØ',
  'NØ',
  'ØNØ',
  'Ø',
  'ØSØ',
  'SØ',
  'SSØ',
  'S',
  'SSV',
  'SV',
  'VSV',
  'V',
  'VNV',
  'NV',
  'NNV',
];

const getDirectionLabel = (directionDegrees: number) => {
  const directionIndex =
    Math.round(normalizeDirectionDegrees(directionDegrees) / 22.5) % PRECISE_DIRECTION_LABELS.length;
  return PRECISE_DIRECTION_LABELS[directionIndex];
};

const WindSpeedWheel = ({ speedMps, onChange }: { speedMps: number; onChange: (speedMps: number) => void }) => {
  const dragRef = useRef<{
    startY: number;
    startSpeed: number;
    lastY: number;
    lastTime: number;
    velocity: number;
  } | null>(null);
  const momentumFrameRef = useRef<number | null>(null);

  const stopMomentum = () => {
    if (momentumFrameRef.current !== null) {
      cancelAnimationFrame(momentumFrameRef.current);
      momentumFrameRef.current = null;
    }
  };

  useEffect(() => stopMomentum, []);

  const startMomentum = (initialVelocity: number) => {
    stopMomentum();

    let velocity = initialVelocity;
    let carriedDistance = 0;
    let momentumSpeed = speedMps;

    const animate = () => {
      velocity *= 0.9;
      if (Math.abs(velocity) < 0.04) {
        momentumFrameRef.current = null;
        return;
      }

      carriedDistance += velocity * 16;
      const steps = Math.trunc(carriedDistance / WIND_SPEED_ROW_HEIGHT_PX);
      if (steps !== 0) {
        momentumSpeed = clampWindSpeed(momentumSpeed + steps);
        onChange(momentumSpeed);
        carriedDistance -= steps * WIND_SPEED_ROW_HEIGHT_PX;
      }

      momentumFrameRef.current = requestAnimationFrame(animate);
    };

    momentumFrameRef.current = requestAnimationFrame(animate);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    stopMomentum();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startY: event.clientY,
      startSpeed: speedMps,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocity: 0,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    const distance = drag.startY - event.clientY;
    onChange(clampWindSpeed(drag.startSpeed + distance / WIND_SPEED_ROW_HEIGHT_PX));

    const elapsed = Math.max(event.timeStamp - drag.lastTime, 1);
    drag.velocity = (drag.lastY - event.clientY) / elapsed;
    drag.lastY = event.clientY;
    drag.lastTime = event.timeStamp;
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const velocity = dragRef.current.velocity;
    dragRef.current = null;
    startMomentum(velocity);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    stopMomentum();
    onChange(clampWindSpeed(speedMps + (event.deltaY > 0 ? 1 : -1)));
  };

  return (
    <div
      aria-label='Vindstyrke i meter per sekund'
      aria-valuemax={WIND_SPEED_MAX_MPS}
      aria-valuemin={0}
      aria-valuenow={speedMps}
      className='pointer-events-auto relative h-28 w-24 cursor-ns-resize touch-none overflow-hidden rounded-full border-2 border-slate-700 bg-white shadow-inner select-none'
      role='spinbutton'
      tabIndex={0}
      onKeyDown={event => {
        event.stopPropagation();
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          onChange(clampWindSpeed(speedMps + 1));
        }
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          onChange(clampWindSpeed(speedMps - 1));
        }
      }}
      onPointerDown={event => {
        event.stopPropagation();
        handlePointerDown(event);
      }}
      onPointerMove={event => {
        event.stopPropagation();
        handlePointerMove(event);
      }}
      onPointerUp={event => {
        event.stopPropagation();
        handlePointerUp(event);
      }}
      onPointerCancel={event => {
        event.stopPropagation();
        handlePointerUp(event);
      }}
      onWheel={event => {
        event.stopPropagation();
        handleWheel(event);
      }}
    >
      <div className='pointer-events-none absolute inset-x-2 top-1/2 z-10 h-8 -translate-y-1/2 rounded-md border-y border-slate-300 bg-slate-100/80' />
      <div
        className='relative transition-transform duration-150 ease-out'
        style={{
          transform: `translateY(${40 - speedMps * WIND_SPEED_ROW_HEIGHT_PX}px)`,
        }}
      >
        {WIND_SPEED_WHEEL_VALUES.map(speed => (
          <div
            className={`relative flex h-8 items-center justify-center text-sm ${
              speed === speedMps ? 'font-bold text-slate-950' : 'text-slate-400'
            }`}
            key={speed}
          >
            <span className='inline-flex w-5 justify-center'>{speed}</span>
            {speed === speedMps && (
              <span className='absolute left-[calc(50%+0.625rem)] text-xs font-semibold uppercase'>m/s</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const GlideMeasurementModal = ({ isOpen, initialConditions, onApply, onCancel }: GlideMeasurementModalProps) => {
  const [glideThresholds, setGlideThresholds] = useState(initialConditions.glideThresholds);
  const [airspeedMps, setAirspeedMps] = useState(initialConditions.airspeedMps);
  const [windDirectionDegrees, setWindDirectionDegrees] = useState(initialConditions.wind.directionDegrees);
  const [windSpeedMps, setWindSpeedMps] = useState(initialConditions.wind.speedMps);
  const directionWheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setGlideThresholds(initialConditions.glideThresholds);
    setAirspeedMps(initialConditions.airspeedMps);
    setWindDirectionDegrees(initialConditions.wind.directionDegrees);
    setWindSpeedMps(initialConditions.wind.speedMps);
  }, [initialConditions, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const setDirectionFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = directionWheelRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    const direction = (Math.atan2(x, -y) * 180) / Math.PI;
    setWindDirectionDegrees(normalizeDirectionDegrees(direction));
  };

  const handleApply = () => {
    onApply(
      normalizeGlideConditions({
        glideThresholds,
        airspeedMps,
        wind: {
          directionDegrees: windDirectionDegrees,
          speedMps: windSpeedMps,
        },
      })
    );
  };

  const directionRadians = (windDirectionDegrees * Math.PI) / 180;
  const knobLeft = 50 + 40 * Math.sin(directionRadians);
  const knobTop = 50 - 40 * Math.cos(directionRadians);
  const thresholdToPercent = (threshold: number) =>
    ((threshold - GLIDE_THRESHOLD_MIN) / (GLIDE_THRESHOLD_MAX - GLIDE_THRESHOLD_MIN)) * 100;
  const [greenThreshold, yellowThreshold, redThreshold] = glideThresholds;
  const glideRailBackground = `linear-gradient(to right, #16a34a 0%, #16a34a ${thresholdToPercent(
    greenThreshold
  )}%, #eab308 ${thresholdToPercent(greenThreshold)}%, #eab308 ${thresholdToPercent(
    yellowThreshold
  )}%, #dc2626 ${thresholdToPercent(yellowThreshold)}%, #dc2626 ${thresholdToPercent(
    redThreshold
  )}%, #111827 ${thresholdToPercent(redThreshold)}%, #111827 100%)`;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3'
      onMouseDown={event => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        aria-labelledby='glide-measurement-dialog-title'
        aria-modal='true'
        className='max-h-[calc(100dvh-1.5rem)] w-fit min-w-[19rem] max-w-full overflow-y-auto rounded-3xl bg-slate-50 p-5 text-slate-950 shadow-2xl sm:p-6'
        role='dialog'
      >
        <header>
          <h2 className='text-2xl font-bold tracking-tight' id='glide-measurement-dialog-title'>
            Kan jeg skli dit?
          </h2>
        </header>

        <div className='mt-6'>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-slate-800'>
            <span>Glideforhold:</span>
            {[
              ['bg-green-600', glideThresholds[0]],
              ['bg-yellow-500', glideThresholds[1]],
              ['bg-red-600', glideThresholds[2]],
            ].map(([colorClass, threshold], index) => (
              <span className='inline-flex items-center gap-1' key={index}>
                <span className={`size-2.5 rounded-full ${colorClass}`} />
                {threshold}:1
              </span>
            ))}
          </div>
          <div className='mt-3 px-2'>
            <Slider
              allowCross={false}
              ariaLabelForHandle={['Grønn glidegrense', 'Gul glidegrense', 'Rød glidegrense']}
              className='cursor-pointer'
              dotStyle={{ borderColor: '#94a3b8' }}
              handleStyle={[
                { ...handleSize, borderColor: '#16a34a', backgroundColor: '#16a34a', cursor: 'pointer', opacity: 1 },
                { ...handleSize, borderColor: '#eab308', backgroundColor: '#eab308', cursor: 'pointer', opacity: 1 },
                { ...handleSize, borderColor: '#dc2626', backgroundColor: '#dc2626', cursor: 'pointer', opacity: 1 },
              ]}
              marks={{
                [GLIDE_THRESHOLD_MIN]: `${GLIDE_THRESHOLD_MIN}:1`,
                [GLIDE_THRESHOLD_MAX]: `${GLIDE_THRESHOLD_MAX}:1`,
              }}
              max={GLIDE_THRESHOLD_MAX}
              min={GLIDE_THRESHOLD_MIN}
              railStyle={{ background: glideRailBackground, height: 7 }}
              range
              step={1}
              trackStyle={[
                { background: 'transparent', height: 7 },
                { background: 'transparent', height: 7 },
              ]}
              value={glideThresholds}
              onChange={value => setGlideThresholds(value as [number, number, number])}
            />
          </div>
        </div>

        <div className='mt-7 border-t border-slate-200 pt-5'>
          <h3 className='mb-3 text-center font-semibold'>
            Vind: {windSpeedMps} m/s{windSpeedMps > 0 && ` fra ${getDirectionLabel(windDirectionDegrees)}`}
          </h3>
          <div className='flex justify-center'>
            <div
              aria-label={`Vind fra ${getDirectionLabel(windDirectionDegrees)}, ${Math.round(windDirectionDegrees)} grader`}
              aria-valuemax={359}
              aria-valuemin={0}
              aria-valuenow={Math.round(windDirectionDegrees)}
              className='relative size-52 cursor-pointer touch-none rounded-full border-[10px] border-slate-200 bg-linear-to-br from-white to-slate-100 shadow-inner outline-none focus-visible:ring-4 focus-visible:ring-blue-500'
              ref={directionWheelRef}
              role='slider'
              tabIndex={0}
              onKeyDown={event => {
                if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
                  event.preventDefault();
                  setWindDirectionDegrees(current => normalizeDirectionDegrees(current - 5));
                }
                if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
                  event.preventDefault();
                  setWindDirectionDegrees(current => normalizeDirectionDegrees(current + 5));
                }
              }}
              onPointerDown={event => {
                event.currentTarget.setPointerCapture(event.pointerId);
                setDirectionFromPointer(event);
              }}
              onPointerMove={event => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  setDirectionFromPointer(event);
                }
              }}
              onPointerUp={event => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
              }}
            >
              {DIRECTION_LABELS.map((label, index) => {
                const radians = (index * Math.PI) / 4;
                return (
                  <span
                    className='absolute -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-slate-500'
                    key={label}
                    style={{ left: `${50 + 43 * Math.sin(radians)}%`, top: `${50 - 43 * Math.cos(radians)}%` }}
                  >
                    {label}
                  </span>
                );
              })}
              <svg
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 z-10 size-full'
                viewBox='0 0 200 200'
              >
                <g transform={`rotate(${windDirectionDegrees} 100 100)`}>
                  <line stroke='#0f172a' strokeLinecap='round' strokeWidth='4' x1='100' x2='100' y1='18' y2='32' />
                  <path d='M 92 32 L 108 32 L 100 48 Z' fill='#0f172a' />
                </g>
              </svg>
              <span
                aria-hidden='true'
                className='pointer-events-none absolute z-20 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-950 bg-white shadow-sm'
                style={{ left: `${knobLeft}%`, top: `${knobTop}%` }}
              />
              <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                <WindSpeedWheel speedMps={windSpeedMps} onChange={setWindSpeedMps} />
              </div>
            </div>
          </div>
        </div>

        <footer className='mt-7 flex items-center justify-end gap-3 border-t border-slate-200 pt-5'>
          <div className='min-w-0 flex-1 text-sm'>
            <label className='block' htmlFor='glide-airspeed'>
              <span className='font-semibold'>Flyfart: {airspeedMps.toFixed(1)} m/s</span>
              <input
                className='glide-airspeed-slider mt-1 block w-full cursor-pointer accent-blue-600'
                id='glide-airspeed'
                max={AIRSPEED_MAX_MPS}
                min={AIRSPEED_MIN_MPS}
                step='0.5'
                type='range'
                value={airspeedMps}
                onChange={event => setAirspeedMps(Number(event.target.value))}
              />
            </label>
          </div>
          <button
            className='cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
            type='button'
            onClick={onCancel}
          >
            Avbryt
          </button>
          <button
            className='cursor-pointer rounded-lg bg-blue-700 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
            type='button'
            onClick={handleApply}
          >
            Bruk
          </button>
        </footer>
      </section>
    </div>
  );
};

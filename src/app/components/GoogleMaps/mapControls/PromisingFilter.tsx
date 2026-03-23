'use client';

import React, { FC, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { useOnboardingPulse } from '@/lib/hooks/useOnboardingPulse';
import { setOnboardingInteractionTrue } from '@/lib/localstorage/onboardingStorage';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { ButtonAccept, ButtonNeutral } from '@/app/components/shared';
import {
  clampPromisingFilterGustMax,
  clampPromisingFilterWindRange,
  DEFAULT_PROMISING_GUST_MAX,
  DEFAULT_PROMISING_WIND_RANGE,
  PROMISING_WIND_SLIDER_MAX,
} from '@/lib/utils/alert-rules';

export type WeatherCondition = 'clearsky_day' | 'fair_day' | 'partlycloudy_day' | 'cloudy';

export const WEATHER_CONDITIONS: WeatherCondition[] = ['clearsky_day', 'fair_day', 'partlycloudy_day', 'cloudy'];

const WEATHER_CONDITION_DESCRIPTION_NB: Record<WeatherCondition, string> = {
  clearsky_day: 'klarvær',
  fair_day: 'lettskyet',
  partlycloudy_day: 'delvis skyet',
  cloudy: 'skyet',
};

const GUST_MIN_GAP = 0.5;
const PROMISING_WIND_MAX_HANDLE_MAX = PROMISING_WIND_SLIDER_MAX - GUST_MIN_GAP;

export type PromisingFilterState = {
  selectedDay: number;
  selectedTimeRange: [number, number];
  minPromisingHours: number;
  selectedWeatherConditions: WeatherCondition[];
  windRange: [number, number];
  gustMax: number;
};

interface PromisingFilterProps {
  isExpanded: boolean;
  onFilterChange: (filter: PromisingFilterState | null) => void;
  setIsExpanded: (isExpanded: boolean) => void;
  initialFilter: PromisingFilterState | null;
  closeOverlays: (options?: { keep?: string }) => void;
}

const PromisingFilter: FC<PromisingFilterProps> = ({
  isExpanded,
  onFilterChange,
  setIsExpanded,
  initialFilter,
  closeOverlays: onCloseOverlays,
}) => {
  const isMobile = useIsMobile();
  const shouldPulse = useOnboardingPulse('PromisingFilter');
  const currentHour = useMemo(() => new Date().getHours(), []);
  const [selectedDay, setSelectedDay] = useState(initialFilter?.selectedDay ?? 0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<[number, number]>(
    initialFilter?.selectedTimeRange ?? [currentHour + 1, Math.min(24, currentHour + 7)]
  );
  const [minPromisingHours, setMinPromisingHours] = useState(initialFilter?.minPromisingHours ?? 3);
  const [selectedWeatherConditions, setSelectedWeatherConditions] = useState<WeatherCondition[]>(
    initialFilter?.selectedWeatherConditions ?? []
  );
  const [windRange, setWindRange] = useState<[number, number]>(
    clampPromisingFilterWindRange(initialFilter?.windRange ?? DEFAULT_PROMISING_WIND_RANGE)
  );
  const [gustMax, setGustMax] = useState(
    Math.max(
      clampPromisingFilterWindRange(initialFilter?.windRange ?? DEFAULT_PROMISING_WIND_RANGE)[1],
      clampPromisingFilterGustMax(initialFilter?.gustMax ?? DEFAULT_PROMISING_GUST_MAX)
    )
  );
  const [isFilterActive, setIsFilterActive] = useState(!!initialFilter);
  const [helpOpen, setHelpOpen] = useState(false);

  const dayLabels = useMemo(() => {
    const now = new Date();
    const inTwoDays = new Date(now);
    inTwoDays.setDate(now.getDate() + 2);
    const weekday = inTwoDays.toLocaleDateString('nb-NO', { weekday: 'long' });
    return ['I dag', 'I morgen', weekday.charAt(0).toUpperCase() + weekday.slice(1)];
  }, []);

  const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

  const normalizeWindAndGust = (
    nextWindRange: [number, number],
    nextGustMax: number
  ): { wind: [number, number]; gust: number } => {
    const [rawMin, rawMax] = clampPromisingFilterWindRange(nextWindRange);
    const windMin = Math.min(rawMin, PROMISING_WIND_MAX_HANDLE_MAX);
    const windMax = Math.min(Math.max(rawMax, windMin), PROMISING_WIND_MAX_HANDLE_MAX);
    const gustFloor = windMax + GUST_MIN_GAP;
    const gust = Math.min(PROMISING_WIND_SLIDER_MAX, Math.max(gustFloor, clampPromisingFilterGustMax(nextGustMax)));
    return { wind: [windMin, windMax], gust };
  };

  const helpSummaryText = useMemo(() => {
    const {
      wind: [wMin, wMax],
      gust,
    } = normalizeWindAndGust(windRange, gustMax);
    const minWindStr = wMin.toFixed(1);
    const maxWindStr = wMax.toFixed(1);
    const gustStr = gust.toFixed(1);

    const dayPhrase =
      selectedDay === 0 ? 'i dag' : selectedDay === 1 ? 'i morgen' : `på ${dayLabels[selectedDay].toLowerCase()}`;

    const windSentence =
      wMin > 0
        ? `Det skal heller ikke blåse mindre enn ${minWindStr} m/s eller mer enn ${maxWindStr} (${gustStr}) m/s`
        : `Det skal heller ikke blåse mer enn ${maxWindStr} (${gustStr}) m/s`;

    const weatherPhrase =
      selectedWeatherConditions.length === 0 || selectedWeatherConditions.length === WEATHER_CONDITIONS.length
        ? 'ikke regne'
        : 'være ' + selectedWeatherConditions.map(c => WEATHER_CONDITION_DESCRIPTION_NB[c]).join(' eller ');

    return `Der vindretningen er riktig i minst ${minPromisingHours} timer i strekk ${dayPhrase} fra klokken ${formatHour(selectedTimeRange[0])}-${formatHour(selectedTimeRange[1])}. ${windSentence} og ${weatherPhrase}.`;
  }, [windRange, gustMax, selectedDay, dayLabels, minPromisingHours, selectedTimeRange, selectedWeatherConditions]);

  const windAndGustSliderValue = useMemo<[number, number, number]>(() => {
    const {
      wind: [wMin, wMax],
      gust,
    } = normalizeWindAndGust(windRange, gustMax);
    return [wMin, wMax, gust];
  }, [windRange, gustMax]);

  const handleApply = () => {
    const { wind: clampedWind, gust: clampedGust } = normalizeWindAndGust(windRange, gustMax);
    setWindRange(clampedWind);
    setGustMax(clampedGust);
    onFilterChange({
      selectedDay,
      selectedTimeRange,
      minPromisingHours,
      selectedWeatherConditions,
      windRange: clampedWind,
      gustMax: clampedGust,
    });
    setIsFilterActive(true);
    setIsExpanded(false);
  };

  const handleReset = () => {
    onFilterChange(null);
    setIsFilterActive(false);
    setIsExpanded(false);
    setSelectedDay(0);
    setSelectedTimeRange([6, 18]);
    setSelectedWeatherConditions([]);
    setWindRange([...DEFAULT_PROMISING_WIND_RANGE]);
    setGustMax(DEFAULT_PROMISING_GUST_MAX);
  };

  useEffect(() => {
    if (initialFilter) return;
    if (selectedDay === 0) {
      setSelectedTimeRange([currentHour + 1, Math.min(24, currentHour + 7)]);
    } else {
      setSelectedTimeRange([12, 18]);
    }
  }, [selectedDay, currentHour, initialFilter]);

  useEffect(() => {
    if (!isExpanded) {
      setSelectedDay(initialFilter?.selectedDay ?? 0);
      setSelectedTimeRange(initialFilter?.selectedTimeRange ?? [currentHour + 1, Math.min(24, currentHour + 7)]);
      setMinPromisingHours(initialFilter?.minPromisingHours ?? 3);
      setSelectedWeatherConditions(initialFilter?.selectedWeatherConditions ?? []);
      const normalized = normalizeWindAndGust(
        initialFilter?.windRange ?? DEFAULT_PROMISING_WIND_RANGE,
        initialFilter?.gustMax ?? DEFAULT_PROMISING_GUST_MAX
      );
      setWindRange(normalized.wind);
      setGustMax(normalized.gust);
    }
  }, [isExpanded, initialFilter, currentHour]);

  // Track when control is expanded
  useEffect(() => {
    if (isExpanded) {
      setOnboardingInteractionTrue('PromisingFilter');
    } else {
      setHelpOpen(false);
    }
  }, [isExpanded]);

  return (
    <div className='pointer-events-none absolute inset-0 z-10'>
      <button
        onClick={() => {
          if (!isExpanded) {
            onCloseOverlays({ keep: 'promisingfilter' });
          }
          setIsExpanded(!isExpanded);
        }}
        className={`pointer-events-auto absolute top-3 right-3 flex size-11 cursor-pointer select-none items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)]/90 p-1 shadow-[var(--shadow-md)] backdrop-blur-md ${shouldPulse ? 'onboarding-pulse' : ''}`}
      >
        <div className='relative'>
          <Image src='/weather-icons/clearsky_day.svg' alt='Filter promising sites' width={32} height={32} />
          {isFilterActive && (
            <Image
              src='/weather-icons/checkbox.svg'
              alt='Filter active'
              width={32}
              height={32}
              className='absolute inset-0 opacity-70'
            />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className='pointer-events-auto absolute top-[3.75rem] right-3 max-h-[calc(100%-4.5rem)] w-72 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--background)]/90 shadow-[var(--shadow-md)] sm:w-80'>
          <div className='p-4'>
            <div className='mb-4'>
              <div className='flex items-start justify-between gap-2 mb-2'>
                <h3 className='font-bold flex-1 min-w-0 leading-tight'>Vis starter med lovende vær:</h3>
                <button
                  type='button'
                  onClick={() => setHelpOpen(v => !v)}
                  aria-expanded={helpOpen}
                  aria-label='Forklaring av filteret'
                  className='shrink-0 -mt-0.5 p-0.5 rounded-md border border-transparent text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--background)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border)] cursor-pointer'
                >
                  <QuestionMarkCircleIcon className='w-5 h-5' aria-hidden />
                </button>
              </div>
              {helpOpen && <p className='text-sm text-[var(--foreground)]/80 mb-3 leading-snug'>{helpSummaryText}</p>}
              <div className='flex w-full bg-[var(--border)] p-1 rounded-lg'>
                {dayLabels.map((label, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => setSelectedDay(index)}
                    className={`flex-1 py-1.5 px-3 text-sm font-medium cursor-pointer ${
                      index === 0 ? 'rounded-l-md' : ''
                    } ${index === dayLabels.length - 1 ? 'rounded-r-md' : ''} ${
                      index > 0 ? 'border-l border-[var(--background)]/20' : ''
                    } ${
                      selectedDay === index
                        ? 'bg-[var(--background)] shadow-[var(--shadow-sm)]'
                        : !isMobile
                          ? 'hover:shadow-[var(--shadow-sm)] hover:bg-[var(--background)]/50'
                          : ''
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className='mb-4'>
              <h3 className='font-bold mb-2'>
                {formatHour(selectedTimeRange[0])} - {formatHour(selectedTimeRange[1])}
              </h3>
              <div className='p-2'>
                <Slider
                  range
                  min={selectedDay === 0 ? currentHour : 0}
                  max={24}
                  defaultValue={[selectedDay === 0 ? currentHour + 1 : 0, Math.min(24, currentHour + 7)]}
                  value={selectedTimeRange}
                  onChange={value => setSelectedTimeRange(value as [number, number])}
                  marks={(() => {
                    const marks: Record<number, string> = {};
                    if (selectedDay === 0) {
                      // For today, only show marks from current hour onwards
                      for (let i = Math.ceil(currentHour / 6) * 6; i <= 24; i += 6) {
                        if (i >= currentHour) {
                          marks[i] = formatHour(i);
                        }
                      }
                      // Always show the current hour mark
                      marks[currentHour] = formatHour(currentHour);
                    } else {
                      // For other days, show standard marks
                      marks[0] = '00:00';
                      marks[6] = '06:00';
                      marks[12] = '12:00';
                      marks[18] = '18:00';
                      marks[24] = '24:00';
                    }
                    return marks;
                  })()}
                  step={1}
                />
              </div>
            </div>

            <div className='mb-2'>
              <h3 className='font-bold mb-2'>Minst {minPromisingHours} timer i strekk</h3>
              <div className='p-2 flex items-center'>
                <button
                  onClick={() => setMinPromisingHours(prev => Math.max(1, prev - 1))}
                  className='w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-lg'
                >
                  -
                </button>
                <div className='flex-grow px-4'>
                  <Slider
                    min={1}
                    max={6}
                    value={minPromisingHours}
                    onChange={value => setMinPromisingHours(value as number)}
                    step={1}
                  />
                </div>
                <button
                  onClick={() => setMinPromisingHours(prev => Math.min(6, prev + 1))}
                  className='w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-lg'
                >
                  +
                </button>
              </div>
            </div>

            <div className='mb-4'>
              <h3 className='font-bold mb-2'>
                Vind: {windAndGustSliderValue[0].toFixed(1)} – {windAndGustSliderValue[1].toFixed(1)} (
                {windAndGustSliderValue[2].toFixed(1)}) m/s
              </h3>
              <div className='p-2'>
                <Slider
                  range
                  count={2}
                  allowCross={false}
                  pushable={GUST_MIN_GAP}
                  min={0}
                  max={PROMISING_WIND_SLIDER_MAX}
                  step={0.5}
                  value={windAndGustSliderValue}
                  onChange={value => {
                    const [nextMinRaw, nextMaxRaw, nextGustRaw] = value as number[];
                    const normalized = normalizeWindAndGust([nextMinRaw, nextMaxRaw], nextGustRaw);
                    setWindRange(normalized.wind);
                    setGustMax(normalized.gust);
                  }}
                  handleStyle={[{}, {}, { borderColor: '#f59e0b', backgroundColor: '#f59e0b' }]}
                  marks={{
                    0: '0',
                    5: '5',
                    10: '10',
                    15: '15',
                  }}
                />
              </div>
            </div>

            <div className='mb-2'>
              <div className='flex gap-2'>
                {WEATHER_CONDITIONS.map(condition => (
                  <button
                    key={condition}
                    type='button'
                    onClick={() => {
                      setSelectedWeatherConditions(prev =>
                        prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
                      );
                    }}
                    className='relative flex-1 h-12 bg-[var(--background)]/50 backdrop-blur-md border border-[var(--border)] rounded-lg p-1 shadow-[var(--shadow-sm)] flex items-center justify-center cursor-pointer select-none hover:bg-[var(--background)]/70 hover:shadow-[var(--shadow-md)] hover:scale-105 transition-all duration-200'
                  >
                    <Image src={`/weather-icons/${condition}.svg`} alt={condition} width={32} height={32} />
                    {selectedWeatherConditions.includes(condition) && (
                      <Image
                        src='/weather-icons/checkbox.svg'
                        alt='Selected'
                        width={32}
                        height={32}
                        className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-70'
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className='flex gap-2'>
              <ButtonNeutral onClick={handleReset} title='Tilbakestill' className='flex-1' isMobile={isMobile} />
              <ButtonAccept onClick={handleApply} title='Bruk' className='flex-1' isMobile={isMobile} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromisingFilter;

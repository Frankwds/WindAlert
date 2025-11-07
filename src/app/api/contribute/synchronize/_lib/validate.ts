/**
 * Validation functions for flightlog.org HTML processing
 * All error messages are in Norwegian
 */

import { ParaglidingLocation } from '@/lib/supabase/types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate that coordinates can be extracted
 */
export function validateCoordinates(latitude: number, longitude: number): void {
  if (latitude === 0 || longitude === 0) {
    throw new ValidationError('Kunne ikke finne koordinater på starten');
  }

  // Additional coordinate validation
  if (latitude < -90 || latitude > 90) {
    throw new ValidationError(`Ugyldig breddegrad: ${latitude}. Må være mellom -90 og 90 grader`);
  }

  if (longitude < -180 || longitude > 180) {
    throw new ValidationError(`Ugyldig lengdegrad: ${longitude}. Må være mellom -180 og 180 grader`);
  }
}

/**
 * Validate that altitude can be extracted
 */
export function validateAltitude(altitude: number): void {
  if (altitude < 0) {
    throw new ValidationError(`Ugyldig høyde: ${altitude}. Høyde kan ikke være et negativt tall`);
  }

  if (altitude > 10000) {
    throw new ValidationError(
      `Ugyldig høyde: ${altitude}. Høyde ser ut til å være for høy. Må være mellom 0 og 10000 moh.`
    );
  }
}

/**
 * Validate that the HTML response is not empty
 */
export function validateHtmlContent(html: string): void {
  if (!html || html.trim().length === 0) {
    throw new ValidationError(
      'Mottok tom HTML-respons fra flightlog.org. Sjekk at du har skrevet inn riktig flightlog ID'
    );
  }

  if (html.length < 100) {
    throw new ValidationError(
      'HTML-responsen ser ut til å være for kort eller ufullstendig. Sjekk at du har skrevet inn riktig flightlog ID'
    );
  }
}

/**
 * Validate that the flightlog_id is valid
 */
export function validateFlightlogId(flightlog_id: string): void {
  if (!flightlog_id || flightlog_id.trim().length === 0) {
    throw new ValidationError('Flightlog ID kan ikke være tomt. Sjekk at du har skrevet inn riktig flightlog ID');
  }

  if (!/^\d+$/.test(flightlog_id)) {
    throw new ValidationError(
      `Ugyldig flightlog ID: ${flightlog_id}. Må være et tall. Sjekk at du har skrevet inn riktig flightlog ID`
    );
  }
}

/**
 * Validate the location data returned from processHTML
 */
export function validateLocationData(
  locationData: Omit<
    ParaglidingLocation,
    'id' | 'created_at' | 'updated_at' | 'landing_latitude' | 'landing_longitude' | 'landing_altitude' | 'is_main'
  >
): void {
  // Validate flightlog_id
  if (!locationData.flightlog_id || locationData.flightlog_id.trim().length === 0) {
    throw new ValidationError('Dette er nok en feil på windlord, venligst meld ifra på mail.');
  }

  // if the whole locationData object is empty, throw an error
  if (
    Object.values(locationData).every(
      value => value === null || value === undefined || value === '' || value === false || value === 0
    )
  ) {
    throw new ValidationError('Kunne ikke finne starten, venligst sjekk at du har skrevet en gyldig flightlog ID');
  }

  // Validate name
  if (!locationData.name || locationData.name.trim().length === 0) {
    throw new ValidationError(
      'Kunne ikke finne navn på starten, venligst sjekk at navn er satt korrekt på flightlog.org'
    );
  }

  // Validate coordinates
  validateCoordinates(locationData.latitude, locationData.longitude);

  // Validate altitude
  validateAltitude(locationData.altitude);

  // Validate country
  if (!locationData.country || locationData.country.trim().length === 0) {
    throw new ValidationError(
      'Land ble ikke funnet for den aktuelle starten, venligst sjekk at land er satt korrekt på flightlog.org'
    );
  }

  // Validate description
  if (!locationData.description || locationData.description.trim().length === 0) {
    throw new ValidationError(
      'Kunne ikke finne beskrivelse på starten, venligst sjekk at beskrivelse er satt korrekt på flightlog.org'
    );
  }
}

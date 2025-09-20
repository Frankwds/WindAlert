import { Cluster, Renderer } from "@googlemaps/markerclusterer";
import { createParaglidingMarkerElementWithDirection, createWeatherStationClusterElement } from "../Markers";
import { ParaglidingLocationWithForecast } from "@/lib/supabase/types";
import { getDominantWind } from "./util";

export class WeatherStationClusterRenderer implements Renderer {
  public render(cluster: Cluster) {
    const position = cluster.position;
    const markers = cluster.markers;

    // Calculate mean wind data from clustered markers
    const { windSpeed, windDirection } = getDominantWind(markers);

    // Create cluster element with mean wind data (no text, just arrow)
    const markerElement = createWeatherStationClusterElement(windSpeed, windDirection);

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

    const clusterLocationData: ParaglidingLocationWithForecast = {
      id: 'cluster',
      name: 'Cluster',
      latitude: position.lat(),
      longitude: position.lng(),
      altitude: 0,
      flightlog_id: 'cluster',
      is_main: false,
      n: false,
      ne: false,
      e: false,
      se: false,
      s: false,
      sw: false,
      w: false,
      nw: false,
    };

    const markerElement = createParaglidingMarkerElementWithDirection(clusterLocationData);

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position,
      content: markerElement,
      zIndex: 1000 + cluster.count,
    });

    return marker;
  }
}

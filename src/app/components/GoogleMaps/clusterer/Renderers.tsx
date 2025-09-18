import { Cluster, Renderer } from "@googlemaps/markerclusterer";
import { createParaglidingMarkerElementWithDirection, createWeatherStationWindMarkerElement } from "../Markers";
import { ParaglidingMarkerData } from "@/lib/supabase/types";

export class WeatherStationClusterRenderer implements Renderer {
  public render(cluster: Cluster) {
    const position = cluster.position;


    const markerElement = createWeatherStationWindMarkerElement([]);

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position,
      content: markerElement,
      zIndex: 1000 + cluster.count,
    });

    return marker;
  }
}

export class ParaglidingClusterRenderer implements Renderer {
  public render(cluster: Cluster) {
    const position = cluster.position;

    const clusterLocationData: ParaglidingMarkerData = {
      id: 'cluster',
      name: 'Cluster',
      latitude: position.lat(),
      longitude: position.lng(),
      altitude: 0,
      flightlog_id: 'cluster',
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

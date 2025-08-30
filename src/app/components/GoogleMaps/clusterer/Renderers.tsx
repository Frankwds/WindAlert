import { Cluster, Renderer } from "@googlemaps/markerclusterer";
import { createParaglidingMarkerElementWithDirection, createWeatherStationMarkerElement } from "../Markers";
import { ParaglidingMarkerData } from "@/lib/supabase/types";

export class WeatherStationClusterRenderer implements Renderer {
  public render(cluster: Cluster) {
    const position = cluster.position;

    const markerElement = document.createElement('div');
    markerElement.appendChild(createWeatherStationMarkerElement());

    // Make clusters slightly larger to distinguish them from individual markers
    // markerElement.style.transform = 'scale(1.2)';

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

    // Create a dummy location object with all wind directions set to true
    // to render a full circle for clusters.
    const clusterLocationData: ParaglidingMarkerData = {
      id: 'cluster',
      name: 'Cluster',
      latitude: position.lat(),
      longitude: position.lng(),
      altitude: 0,
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

import { Cluster, Renderer } from "@googlemaps/markerclusterer";
import { createParaglidingMarkerElement, createWeatherStationMarkerElement } from "../Markers";

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

    const markerElement = document.createElement('div');
    markerElement.appendChild(createParaglidingMarkerElement());

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
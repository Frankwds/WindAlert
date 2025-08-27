import { Renderer } from '@googlemaps/markerclusterer';
import { Cluster } from '@googlemaps/markerclusterer';
import { paraglidingMarkerHTML } from './sharedMarkerStyles';

export class ParaglidingClusterRenderer implements Renderer {
  public render(cluster: Cluster) {
    const position = cluster.position;

    const markerElement = document.createElement('div');
    markerElement.innerHTML = paraglidingMarkerHTML;

    // Make clusters slightly larger to distinguish them from individual markers
    markerElement.style.transform = 'scale(1.2)';

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position,
      content: markerElement,
      zIndex: 1000 + cluster.count, // higher zIndex for larger clusters
    });

    return marker;
  }
}

import { Renderer } from '@googlemaps/markerclusterer';
import { Cluster } from '@googlemaps/markerclusterer';

export class CustomRenderer implements Renderer {
  public render(cluster: Cluster) {
    const count = cluster.count;
    const position = cluster.position;
    const firstMarker = cluster.markers[0];

    // Default style
    let backgroundColor = '#6c757d'; // grey

    if (firstMarker) {
      const markerElement = firstMarker.content as HTMLElement;
      const style = (markerElement.firstChild as HTMLElement).style;
      backgroundColor = style.background;
    }

    const clusterMarkerElement = document.createElement('div');
    clusterMarkerElement.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${backgroundColor};
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        transition: transform 0.2s ease;
      ">
        ${count}
      </div>
    `;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position,
      content: clusterMarkerElement,
      zIndex: 1000 + count, // higher zIndex for larger clusters
    });

    return marker;
  }
}

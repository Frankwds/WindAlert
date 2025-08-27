import { Renderer } from '@googlemaps/markerclusterer';
import { Cluster } from '@googlemaps/markerclusterer';

export class CustomRenderer implements Renderer {
  public render(cluster: Cluster) {
    const count = cluster.count;
    const position = cluster.position;

    // Change color based on cluster size
    let color = '#6c757d'; // grey
    if (count > 10) {
      color = '#f8f9fa'; // light grey
    }
    if (count > 100) {
      color = '#e9ecef'; // lighter grey
    }

    const markerElement = document.createElement('div');
    markerElement.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #212529;
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
      content: markerElement,
      zIndex: 1000 + count, // higher zIndex for larger clusters
    });

    return marker;
  }
}

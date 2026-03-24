import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';

/** DOM node + unmount for InfoWindow content rendered with `react-dom/client`. */
export function createInfoWindowReactContent(node: ReactElement) {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(node);
  return {
    container,
    dispose: () => {
      root.unmount();
    },
  };
}

import { useEffect } from 'react';

export const useInfoWindowStyles = () => {
  useEffect(() => {
    const applyStyles = () => {
      // Remove any existing style element
      const existingStyle = document.getElementById('google-maps-infowindow-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      const styleElement = document.createElement('style');
      styleElement.id = 'google-maps-infowindow-styles';

      styleElement.textContent = `
        /* Google Maps InfoWindow Custom Styling */
        .gm-style-iw {
          background-color: var(--background) !important;
          border-radius: 8px !important;
          box-shadow: var(--shadow-lg) !important;
          border: 1px solid var(--border) !important;
          max-width: 400px !important;
          min-width: 300px !important;
        }
        
        /* InfoWindow arrow/tail */
        .gm-style .gm-style-iw-tc::after {
          background-color: var(--background) !important;
          border-left: 1px solid var(--border) !important;
          border-top: 1px solid var(--border) !important;
        }
        
        /* InfoWindow content area */
        .gm-style-iw-d {
          color: var(--foreground) !important;
          font-family: var(--font-geist-sans), system-ui, sans-serif !important;
          line-height: 1.6 !important;
          margin-top: -15x !important; /* Pull content up into header area */
        }
        
        /* InfoWindow scrollbar styling */
        .gm-style .gm-style-iw-d::-webkit-scrollbar-track,
        .gm-style .gm-style-iw-d::-webkit-scrollbar-track-piece {
          background-color: var(--background) !important;
          border-radius: 4px !important;
        }
        
        .gm-style .gm-style-iw-d::-webkit-scrollbar-thumb {
          background-color: var(--muted) !important;
          border-radius: 4px !important;
          border: 1px solid transparent !important;
          background-clip: padding-box !important;
        }
        
        .gm-style .gm-style-iw-d::-webkit-scrollbar-thumb:hover {
          background-color: var(--foreground) !important;
        }
        
        /* Close button styling */
        .gm-ui-hover-effect {
          background-color: var(--background) !important;
          border-radius: 50% !important;
          box-shadow: var(--shadow-md) !important;
          border: 1px solid var(--border) !important;
          width: 32px !important;
          height: 32px !important;
          top: 8px !important; /* Adjusted for merged layout */
          right: 8px !important; /* Adjusted for merged layout */
          transition: all 0.2s ease !important;
          position: absolute !important;
          z-index: 1000 !important;
        }
        
        .gm-ui-hover-effect:hover {
          background-color: var(--muted) !important;
          box-shadow: var(--shadow-hover) !important;
          transform: scale(1.1) !important;
        }
        
        /* Close button span with SVG mask - Google Maps uses an SVG mask for the X */
        .gm-ui-hover-effect span {
          background-color: var(--foreground) !important;
          mask-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%205%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012z%22/%3E%3C/svg%3E") !important;
          -webkit-mask-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%205%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012z%22/%3E%3C/svg%3E") !important;
          width: 16px !important;
          height: 16px !important;
          margin: 8px !important;
          display: block !important;
          pointer-events: none !important;
        }
        
        /* InfoWindow footer area (if present) */
        .gm-style-iw-b {
          background-color: var(--border) !important;
          border-radius: 0 0 8px 8px !important;
          padding: 8px 16px !important;
          border-top: 1px solid var(--border) !important;
          font-size: 0.875rem !important;
          color: var(--muted) !important;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .gm-style-iw {
            max-width: 90vw !important;
            min-width: 280px !important;
          }
        }
      `;

      document.head.appendChild(styleElement);
    };

    // Apply styles immediately
    applyStyles();

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          // Small delay to ensure theme variables are updated
          setTimeout(applyStyles, 50);
        }
      });
    });

    // Start observing the document for theme changes
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => {
      observer.disconnect();
      const existingStyle = document.getElementById('google-maps-infowindow-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);
};

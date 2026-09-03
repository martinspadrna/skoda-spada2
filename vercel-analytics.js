// Vercel Web Analytics initialization
// This script loads the Vercel Analytics tracking code

(function() {
  'use strict';
  
  // Initialize the analytics queue
  window.va = window.va || function () { 
    (window.vaq = window.vaq || []).push(arguments); 
  };
  
  // Determine the script source (production vs development)
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' ||
                window.location.hostname.includes('vercel.app');
  
  // Check if script is already loaded
  const scriptSrc = '/_vercel/insights/script.js';
  if (document.head.querySelector(`script[src*="${scriptSrc}"]`)) {
    return;
  }
  
  // Create and inject the analytics script
  const script = document.createElement('script');
  script.src = scriptSrc;
  script.defer = true;
  script.setAttribute('data-sdkn', '@vercel/analytics');
  script.setAttribute('data-sdkv', '2.0.1');
  
  script.onerror = function() {
    if (isDev) {
      console.log('[Vercel Web Analytics] Analytics script could not be loaded. This is expected in local development.');
    }
  };
  
  document.head.appendChild(script);
})();

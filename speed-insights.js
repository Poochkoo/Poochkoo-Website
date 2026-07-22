/**
 * Vercel Speed Insights - Web Vitals Tracking
 * 
 * This script initializes Vercel Speed Insights for tracking Core Web Vitals
 * and performance metrics on this static website.
 * 
 * Documentation: https://vercel.com/docs/speed-insights/quickstart
 */

(function() {
  'use strict';
  
  // Initialize Speed Insights queue
  window.si = window.si || function() {
    (window.siq = window.siq || []).push(arguments);
  };
  
  // Load the Vercel Speed Insights script
  // This will be automatically configured by Vercel when deployed
  if (typeof window !== 'undefined') {
    var script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/speed-insights/script.js';
    
    // Add error handling
    script.onerror = function() {
      console.warn('Vercel Speed Insights: Script failed to load. Make sure Speed Insights is enabled in your Vercel dashboard.');
    };
    
    // Append to document head
    if (document.head) {
      document.head.appendChild(script);
    } else {
      // If head is not available yet, wait for DOMContentLoaded
      document.addEventListener('DOMContentLoaded', function() {
        document.head.appendChild(script);
      });
    }
  }
})();

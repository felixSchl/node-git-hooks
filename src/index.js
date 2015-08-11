import install from './install';

/**
 * Install source maps.
 */

try {
  require('source-map-support').install();
} catch(e) {}

install();

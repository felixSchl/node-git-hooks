import install from './install';
import git from './git';

/**
 * Install source maps.
 */

try {
  require('source-map-support').install();
} catch(e) {}

// install();
git.find()
  .then(console.log.bind(console, 'found'))

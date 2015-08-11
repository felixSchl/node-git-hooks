import path from 'path';
import _ from 'lodash';
import fs from 'fs';
import Promise from 'bluebird';

/**
 * Promisify modules to avoid callbacks or
 * working with thunks.
 */

Promise.promisifyAll(fs);

/**
 * Find nearest ancestor's `.git` directory.
 */
function find() {
  return (function _find(dir) {
    return fs.statAsync(path.resolve(dir, '.git'))
      .then(stats => {
        if (stats.isDirectory()) {
          return Promise.resolve(dir);
        } else {
          const err = new Error();
          err.code = 'ENOENT';
          return Promise.reject(err);
        }
      })
      .catch(
        e => e.code === 'ENOENT'
      , __ => {
        const next = _.initial(dir.split(path.sep)).join(path.sep)
        return (next && next != '')
          ? _find(next)
          : Promise.reject(new Error('No repository at path'));
      });
  })(process.cwd());
}

export default { find: find };

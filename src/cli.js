import { docopt } from 'docopt';
import _ from 'lodash';
import install from './install';
import git from './git';
import co from 'co';

const debug = require('debug')('git-hooks');

/**
 * Require `regenerator` runtime as a
 * polyfill for ES6 generator functions.
 */

import 'regenerator/runtime';

/**
 * Provide bluebird as a `Promise` polyfill.
 * Note: `tj/co` relies on the global Promise.
 */

import Promise from 'bluebird'
global.Promise = global.Promise || Promise;

/**
 * Install source maps.
 */

try {
  require('source-map-support').install();
} catch(e) {}


let r = s => _.map(
  s.split('\n')
, x => x.replace('  | ', '')).join('\n');

/**
 * Main entry point
 */

const args = docopt(r(
  `
  | Usage:
  |   git-hooks install
  `
), { argv: _.take(_.drop(process.argv, 2), 1) });

const router = {
  /**
  * `git-hooks install`
  */
  install: () => [r(
  `
  | Install git hooks in the nearest git repository.
  |
  | Usage:
  |   git-hooks install
  `),
  args => {
    Promise.resolve(co(function*() {
      const directory = yield git.find();
      yield install(directory);
    }))
    .catch(e => { throw e; });
  }]
};

/**
 * Kick-Off!
 */
if (_.has(router, process.argv[2])) {
  const [ doc, fun ] = router[process.argv[2]]()
      , args = docopt(doc);
  fun(args);
} else {
  process.stderr.write(
    `Command \`${ process.argv[2] }\` not recognized\n`);
  process.exit(1);
}

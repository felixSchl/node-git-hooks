import { docopt } from 'docopt';
import _ from 'lodash';
import install from './install';
import git from './git';
import Hooks from './hooks';
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
, x => x.replace('  | ', '').replace('  |', '')).join('\n');

/**
 * Main entry point
 */

const args = docopt(r(
  `
  | Usage:
  |   git-hooks install
  |   git-hooks run
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
      const directory = yield git.getGitRepoRoot();
      yield install(directory);
    }))
    .catch(e => { throw e; });
  }],

  /**
   * `git-hooks run`
   */
  run: () => [r(
  `
  | Run a git hook, where \`hookname\` can be one of the following:
  |
  |   o ${ _.keys(Hooks).join('\n  o ') }
  |
  | Note: This command is invoked by the actual git commit hooks,
  |       but can also be used for testing hooks.
  |
  | Usage:
  |   git-hooks run <hookname> [<args>...]
  `
  ), args => {
    if (_.has(Hooks, args['<hookname>']) === false) {
      console.error(
        `\`${ args['<hookname>'] }\` is not a valid hookname. Try one of:`);
      _.each(_.keys(Hooks), hook => console.error('  o ', hook));
    }
  }],
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

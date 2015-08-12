import { docopt } from 'docopt';
import _ from 'lodash';
import install from './install';
import git from './git';
import Hooks from './hooks';
import Bluebird from 'bluebird';

const debug = require('debug')('git-hooks');

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
  |   git-hooks install [--force]
  |
  | Options:
  |   -f, --force  Force the install, may result in data loss.
  `),
  args => {
    Bluebird.coroutine(function*() {
      const directory = yield git.getGitRepoRoot();
      yield install(directory, args['--force']);
    })()
    .catch(e => { throw e; });
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

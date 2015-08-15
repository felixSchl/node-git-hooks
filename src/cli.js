import { docopt } from 'docopt';
import _ from 'lodash';
import Hooks from './hooks';
import Bluebird from 'bluebird';
import woody from 'woody';

const go = f => Bluebird.coroutine(f)();

/**
 * Application-wide logger
 */

const logger = woody
  .bracketed()
  .to(woody.console)
  .context('git-hooks');

/**
 * Debug logger
 */

const debug = woody
  .debug()
  .context('git-hooks');


/**
 * Install source maps.
 */

if (process.env.NODE_ENV !== 'production') {
  require('source-map-support').install();
}

let r = s => _.map(
  s.split('\n')
, x => x.replace('  | ', '').replace('  |', '')).join('\n');

/**
 * Main entry point
 */

const args = docopt(r(
  `
  | Welcome to \`node-git-hooks\`.
  |
  | There are several commands available, in order to
  | get help for each command, run \`git-hooks <command> --help\`.
  |
  | Usage:
  |   git-hooks (i|install) [--help]
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
  |   git-hooks (i|install) [--force]
  |
  | Options:
  |   -f, --force  Force the install, may result in data loss.
  `),
  args => {
    const install = require('./install')
        , git = require('./git');
    go(function*() {
      yield install(
        yield git.getGitRepoRoot()
      , args['--force']);
    });
  }],
};

/**
 * Abbreviations
 */

router['i'] = router['install'];

/**
 * Kick-Off!
 */

if (_.has(router, process.argv[2])) {
  const [ doc, fun ] = router[process.argv[2]]();
  fun(docopt(doc));
} else {
  process.stderr.write(
    `Command \`${ process.argv[2] }\` not recognized\n`);
  process.exit(1);
}

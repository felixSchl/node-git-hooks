import Hooks from './hooks';
import path from 'path';
import fs from 'fs';
import co from 'co';
import _ from 'lodash';
import mkdirp from 'mkdirp';

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
 * Promisify modules to avoid callbacks or
 * working with thunks.
 */

Promise.promisifyAll(fs);
const mkdirpAsync = Promise.promisify(mkdirp);

/**
 * Install git hook wrappers.
 *
 * Each of these files will be invoked and a
 * generic hook-handler will be invoked in node
 * with the hook name and it's arguments.
 */
export default function install() {

  const dotGitDir = path.resolve(__dirname, '..', '.git');
  co(function*() {

    // Ensure `.git` exists and is valid
    const dotGitStats = yield fs.statAsync(dotGitDir);
    if (dotGitStats.isDirectory() === false) {
      throw new Error(
        `${ dotGitDir } exists but is not a directory`);
    }

    // Ensure `.git/hooks` exists
    const gitHooksDir = path.resolve(dotGitDir, 'hooks');
    yield mkdirpAsync(gitHooksDir);

    // Write hook files
    yield Promise.props(_.foldl(
      Hooks
    , (acc, hook) => {
        const injectLine = `node .git/hooks/run-hook.js "${ hook }" "$@"`;
        acc[hook] = co(function*() {
          const filepath = path.resolve(gitHooksDir, hook);
          const contents = yield fs.readFileAsync(filepath)
              .then(_.method('toString', 'utf-8'))
              .catch(e => e.code === 'ENOENT', _ => '')
              .then(code => {
                // Naiivly see if `${injectLine}` already exists in file,
                // then only append if it does not.
                const lines = code.split('\n');
                return (_.any(code.split('\n'), line => line === injectLine)
                  ? lines
                  : lines.concat([ injectLine ])
                ).join('\n');
              });
          yield fs.writeFileAsync(filepath, contents);
          yield fs.chmodAsync(filepath, '755');
        });
        return acc;
    }
    , {}));
  })
    .catch(e => {
      console.error('Failed to install `.git/hooks`:');
      console.error(e.message);
      console.error(e.stack);
      throw e;
    });
}


import Hooks from './hooks';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import kopeer from 'kopeer';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import Bluebird from 'bluebird';
import { AlreadyInstalledError } from './errors';

const debug = require('debug')('git-hooks');

/**
 * Promisify modules to avoid callbacks or
 * working with thunks.
 */

Bluebird.promisifyAll(fs);
const mkdirpAsync = Bluebird.promisify(mkdirp);
const rimrafAsync = Bluebird.promisify(rimraf);
const existsAsync = path => new Promise((resolve) => fs.exists(path, resolve));

/**
 * Install git hook wrappers.
 *
 * Each of these files will be invoked and a
 * generic hook-handler will be invoked in node
 * with the hook name and it's arguments.
 *
 * @param {Filepath} directory
 * The checkout directory to install the hooks for.
 *
 * @returns {Promise.<Unit>}
 */
export default function install(directory, force=false) {

  debug(`Running install in directory \`${ directory }\``);

  return Bluebird.coroutine(function*() {

    // Back up `.git/hooks` if it exists
    const gitHooksDir = path.resolve(directory, 'hooks')
        , gitHooksBackup = path.resolve(directory, 'hooks.bak');

    if(yield existsAsync(gitHooksDir)) {
      debug('`.git/hooks` directory exists');
      if(yield existsAsync(gitHooksBackup)) {
        debug('`.git/hooks.bak` directory exists');
        if (force) {
          debug('Removing `.git/hooks.bak`...');
          debug('Removing `.git/hooks`...');
          yield Promise.all(
                [ rimrafAsync(gitHooksBackup)
                , rimrafAsync(gitHooksDir) ]);
        } else {
          throw new AlreadyInstalledError();
        }
      } else {
        debug('`.git/hooks.bak` does not exit');
        debug('Copying `.git/hooks` to `.git/hooks.bak`...');
        yield kopeer.directory(gitHooksDir, gitHooksBackup);
        debug('Removing `.git/hooks`...');
        yield rimrafAsync(gitHooksDir);
      }
    }

    // Ensure `.git/hooks` exists
    debug(`Running mkdirp for \`${ gitHooksDir }\``);
    yield mkdirpAsync(gitHooksDir);

    // Write hook files
    debug(`Writing hook files...`);
    yield Promise.all(_.map(Hooks, Bluebird.coroutine(function*(hook) {
      const filepath = path.resolve(gitHooksDir, hook);
      const script =
      [ '#!/usr/bin/env bash'
      , ''
      , `git-hooks run "${ hook }" "$@"` ].join('\n');

      debug(`Writing hook \`${ hook }\``);
      yield fs.writeFileAsync(filepath, script);

      debug(`Chmoding hook file \`${ hook }\``);
      yield fs.chmodAsync(filepath, '755');
    })));
  })()
    .catch(e => {
      console.error('Failed to install `.git/hooks`:');
      console.error(e.toString());
      throw e;
    });
}


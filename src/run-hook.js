import _ from 'lodash';
import path from 'path';
import git from './git';
import yaml from 'js-yaml';
import fs from 'fs';
import { exec, spawn } from 'child_process';
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
 * Promisify modules
 */

Promise.promisifyAll(fs);

/**
 * Run a hook with the given arguments
 */

export default function run(hook, args) {
  return Promise.resolve(co(function*() {
    const root = path.resolve(yield git.getGitRepoRoot(), '..');
    const config = yaml.safeLoad(
      yield fs.readFileAsync(
        path.resolve(root, '.githooks.yml')));
    if (_.has(config, hook)) {
      _.foldl(
        config[hook]
      , (acc, cmd) => acc.then(() => new Promise((resolve, reject) => {
          /**
           * XXX Solve this Trauerspiel
           */
          const child = spawn(cmd, []);
          child.on('stderr', data => console.error(data.toString('utf-8')));
          child.on('stdout', data => console.log(data.toString('utf-8')));
          child.on('error', reject);
          child.on('close', resolve);
        }))
      , Promise.resolve({}));
    }
  }));
}

import _ from 'lodash';
import path from 'path';
import git from './git';
import yaml from 'js-yaml';
import fs from 'fs';
import { exec, spawn } from 'child_process';
import co from 'co';
import temp from 'temp';
import shellescape from 'shell-escape';
import chalk from 'chalk';

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
Promise.promisifyAll(temp);

/**
 * Enable automatic clean up for `temp`.
 */

temp.track();

/**
 * Run a hook with the given arguments
 */

export default function run(hook, args) {
  return Promise.resolve(co(function*() {
    const root = path.resolve(yield git.getGitRepoRoot(), '..');
    const config = yaml.safeLoad(
      yield fs.readFileAsync(
        path.resolve(root, '.githooks.yml')));

      /**
       * Assemble the script to run
       */

      debug('Assembling script...');
      const header =
      [ '#!/usr/bin/env bash'
      , 'set -eo pipefail'
      ].join('\n');
      const script = _.foldl(config[hook], (acc, cmd) =>
        (acc + [ ``
               , `echo $ ${ shellescape([chalk.green(cmd)]) }`
               , cmd
               , ``
               ].join('\n'))
      , header);
      debug(script);

      /**
       * Create a temporary file to execute
       */

      debug('Creating temporary file...');
      const info = yield temp.openAsync('git-hooks');
      debug(info.path);
      yield fs.writeFileAsync(info.path, script);
      yield fs.chmodAsync(info.path, '755');

      /**
       * Execute the script
       */

      debug('Running script...');
      yield new Promise((resolve, reject) => {
        const child = spawn('bash', ['--login', info.path]);
        child.stderr.on('data', data => console.error(data.toString('utf-8')));
        child.stdout.on('data', data => console.log(data.toString('utf-8')));
        child.on('error', reject);
        child.on('close', resolve);
      })
  }))
    .catch(e => {
      console.log(e);
      throw e;
    });
}

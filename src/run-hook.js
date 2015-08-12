import _ from 'lodash';
import path from 'path';
import git from './git';
import yaml from 'js-yaml';
import fs from 'fs';
import { exec, spawn } from 'child_process';
import temp from 'temp';
import shellescape from 'shell-escape';
import chalk from 'chalk';
import Bluebird from 'bluebird';

const debug = require('debug')('git-hooks');

/**
 * Promisify modules
 */

Bluebird.promisifyAll(fs);
Bluebird.promisifyAll(temp);

/**
 * Enable automatic clean up for `temp`.
 */

temp.track();

/**
 * Run a hook with the given arguments
 */

export default function run(hook, args) {
  return Bluebird.coroutine(function*() {
    const root = path.resolve(yield git.getGitRepoRoot(), '..');

    /**
     * Load YAML configuration file
     */

    const config = yaml.safeLoad(
      yield fs.readFileAsync(
        path.resolve(root, '.githooks.yml')));

    /**
     * Assemble the script to run
     */

    debug('Assembling script...');
    const echo = msg =>
      `echo $ ${ shellescape([chalk.green(msg)]) }`
    const script =
      [ '#!/usr/bin/env bash'
      , 'set -eo pipefail'
      , ''
      , echo(`Running hook \`${ hook }\`...`)
      , ''
      ].concat(
        _.foldl(config[hook], (acc, cmd) =>
          acc.concat([ '', echo(cmd), cmd, '' ])
        , [])).join('\n');

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
  })();
}

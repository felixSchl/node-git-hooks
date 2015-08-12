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
import mkdirp from 'mkdirp';

const debug = require('debug')('git-hooks');

/**
 * Promisify modules
 */

Bluebird.promisifyAll(fs);
Bluebird.promisifyAll(temp);
const mkdirpAsync = Bluebird.promisify(mkdirp);

/**
 * Enable automatic clean up for `temp`.
 */

temp.track();

/**
 * Run a hook with the given arguments
 */

export default function run(hook, args) {
  return Bluebird.coroutine(function*() {
    const dotGitDir = yield git.getGitRepoRoot()
        , hooksDir = path.resolve(dotGitDir, 'hooks')
        , cacheDir = path.resolve(hooksDir, '.cache')
        , cachePath = path.resolve(cacheDir, hook)
        , root = path.resolve(dotGitDir, '..')
        , yamlPath = path.resolve(root, '.githooks.yml');

    /**
     * Load YAML configuration file
     */

    const config = yaml.safeLoad(
      yield fs.readFileAsync(yamlPath));

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
     * Create a cache file to execute
     */

    debug('Creating cache directory');
    yield mkdirpAsync(cacheDir);

    debug('Writign script file');
    yield fs.writeFileAsync(cachePath, script);

    debug('Making script file executable');
    yield fs.chmodAsync(cachePath, '755');

    /**
     * Execute the script
     */

    debug('Running script...');
    yield new Promise((resolve, reject) => {
      const child = spawn('bash', ['--login', cachePath]);
      child.stderr.on('data', data => console.error(data.toString('utf-8')));
      child.stdout.on('data', data => console.log(data.toString('utf-8')));
      child.on('error', reject);
      child.on('close', resolve);
    })
  })();
}

import _ from 'lodash';
import Promise from 'bluebird';
import { exec } from 'child_process';

const chomp = (text) =>
  text.replace(/(\n|\r)+$/, '');

export default {
  getGitRepoRoot: () => {
    return new Promise((resolve, reject) => {
      exec('git rev-parse --git-dir', (err, stdout, stderr) => {
        if (err) {
          reject(err);
        } else {
          resolve(chomp(stdout));
        }
      });
    });
  }
};

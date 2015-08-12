/**
 * Enforce Tim Pope's advice on commit messages.
 * http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html
 */

'use strict';

var fs = require('fs')
  , path = require('path')
  , chalk = require('chalk');

var file = path.resolve(process.cwd(), process.argv[2])
  , lines = fs.readFileSync(file).toString('utf-8').split('\n')
  , lead = chalk.gray('> ')
  , err = console.error.bind(console)
  , repeat = function(pattern, count) {
      if (count < 1) { return ''; }
      var result = '';
      while (count > 1) {
        if (count & 1) { result += pattern; }
        count >>= 1;
        pattern += pattern;
      }
      return result + pattern;
    };

/**
 * Run a pragmatic, uncomprehensive check in an effort to enforce Tim Pope's
 * vision.
 */

if (lines.length && lines[0].length) {

  /**
   * Validate first line is less than 50 characters long.
   */

  if (lines[0].length > 50) {
    err(chalk.red('Error: The commit message is too long:'));
    err(lead + lines[0].substr(0, 50) + chalk.red(lines[0].substr(50)));
    err(lead + repeat(' ', 50) + repeat('^', lines[0].length - 50));
    err('Please keep the line under 50 characters.');
    process.exit(1);
  }

  /**
   * Validate the first line starts with an upper-case character.
   */

  if (lines[0][0] === lines[0][0].toLowerCase()) {
    err(chalk.red(
      'Error: The first letter of the commit message should be uppercase:'));
    err(lead + lines[0]);
    err(lead + '^');
    err('Please ensure the first word is capitalized');
    process.exit(1);
  }

  /**
   * Validate there is a blank line between the message and the description.
   */

  if (lines.length > 1) {
    if (lines[1].replace(/\s/g, '').length) {
      err(chalk.red(
        'Error: Second line should be empty:'));
      err(lead + lines[0]);
      err(lead + lines[1]);
      err(lead + repeat('^', lines[1].length));
      err('Please ensure the second line is empty');
      process.exit(1);
    }
  }

  /**
   * Validate all description lines are less than 72 characters long;
   */

  for(var i = 2; i < lines.length; i++) {
    var line = lines[i];
    if (line.length > 72) {
      err(chalk.red('This line exceeds 72 characters:'));
      err(lead + line.substr(0, 72) + chalk.red(line.substr(72)));
      err(lead + repeat(' ', 72) + repeat('^', line.length - 72));
      process.exit(1);
    }
  }
}

'use strict';

const fs = require('fs');
const findUp = require('findup-sync');
const path = require('path');
const debug = require('debug')('mocha:config');

const CONFIG_FILES = [
  '.mocharc.js',
  '.mocharc.yaml',
  '.mocharc.yml',
  '.mocharc.json'
];

exports.loadConfig = cwd => {
  const filepath = findUp(CONFIG_FILES, {cwd});
  let config = {};
  if (filepath) {
    debug(`found config file at ${filepath}`);
    const ext = path.extname(filepath);
    if (/\.ya?ml/.test(ext)) {
      config = require('js-yaml').safeLoad(fs.readFileSync(filepath, 'utf8'));
    } else if (ext === '.json') {
      const stripJsonComments = require('strip-json-comments');
      config = JSON.parse(stripJsonComments(fs.readFileSync(filepath, 'utf8')));
    } else {
      config = require(filepath);
    }
  }

  debug('pre-yargs config:', config);
  return config;
};

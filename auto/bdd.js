'use strict';

const Mocha = require('../lib/mocha');

module.exports = function setup(opts) {
  opts = opts || {};
  opts.ui = opts.ui || 'bdd';

  const mocha = new Mocha(opts);
  const ctx = {};

  process.on('beforeExit', function() {
    mocha.run(process.exit);
  });

  mocha.suite.emit('pre-require', ctx, null, mocha);

  return ctx;
};

'use strict';

var Console = require('./console');
var create = require('lodash.create');

function Spec(runner) {
  Console.call(this, runner);
  this.indent = 0;
}

Spec.prototype = create(Console, {
  stream: process.stdout,
  write: function write(str) {
    Console.write.call('%s%s', this.indent, str);
  },
  get indent() {
    return new Array(this._indent).join(' ');
  },
  set indent(value) {
    this._indent = value;
  },
  handlers: {
    start: function start() {
      this.write();
    },

    suite: function suite(suite) {
      this._indents++;
      this.write(this.color.suite(suite.title));
    },

    'suite end': function suiteEnd() {
      if (--this.indents === 1) {
        this.write();
      }
    },

    pending: function pending(test) {
      this.write(this.color.pending('  - %s'), test.title);
    }


  }
});

module.exports = Spec;

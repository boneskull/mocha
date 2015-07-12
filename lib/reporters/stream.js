'use strict';

var create = require('lodash.create');
var Base = require('./base');

function Stream(runner) {
  Base.call(this, runner);
}

Stream.prototype = create(Base.prototype, {

  write: function write() {
    return this._write.apply(this, arguments);
  },

  _write: function _write() {
    this.stream.write.apply(null, arguments);
  }

});

module.exports = Stream;

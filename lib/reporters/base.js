'use strict';

var each = require('lodash.foreach');
var create = require('lodash.create');
var moment = require('moment');
var events = require('events');
var defaults = require('lodash.defaults');

var EventEmitter = events.EventEmitter;

function Base(runner) {
  if (!runner) {
    throw new Error('invalid parameters');
  }

  defaults(this.handlers, Base.handlers);

  this._resetStats();
  this._resetFailures();
  this._listen(runner);
}

Base.STATS = [
  'suites',
  'tests',
  'passes',
  'pending',
  'failures'
];

Base.prototype = create(EventEmitter.prototype, {
  _resetStats: function _resetStats() {
    return each(Base.STATS, function(prop) {
      this.stats[prop] = 0;
    }, this);
  },
  _resetFailures: function _resetFailures() {
    return (this.failures = []);
  },
  _listen: function _listen(runner) {
    var activeHandlers;

    if (this.runner) {
      _.each(this._activeHandlers, function(boundHandler, event) {
        runner.removeListener(event, boundHandler);
      });
    }

    this.runner = runner;
    activeHandlers = this._activeHandlers = {};

    _.each(this.handlers, function(handler, event) {
      var boundHandler = handler.bind(this);
      activeHandlers[event] = boundHandler;
      runner.on(event, boundHandler);
    }, this);

    this.emit('listening', runner, activeHandlers);
  },
  summary: function summary() {
    return {
      stats: this.stats,
      failures: this.failures.map(function(failure) {
        return {
          error: failure.err,
          title: failure.fullTitle()
        };
      })
    };
  }
});

Base.handlers = {
  start: function() {
    var stats = this.stats;
    stats.start = moment();
    this.emit('start');
  },

  suite: function(suite) {
    var stats = this.stats;
    stats.suites = stats.suites || 0;
    suite.root || stats.suites++;
    this.emit('suite', suite);
  },

  'test end': function(test) {
    var stats = this.stats;
    stats.tests = stats.tests || 0;
    stats.tests++;
    this.emit('test end', test);
  },

  pass: function(test) {
    var slowSpeed = test.slow();
    var mediumSpeed = slowSpeed / 2;
    var stats = this.stats;
    stats.passes = stats.passes || 0;

    if (test.duration > slowSpeed) {
      test.speed = 'slow';
    } else if (test.duration > mediumSpeed) {
      test.speed = 'medium';
    } else {
      test.speed = 'fast';
    }

    stats.passes++;
    this.emit('pass', test);
  },

  fail: function(test, err) {
    var stats = this.stats;
    var failures = this.failures;
    stats.failures = stats.failures || 0;
    stats.failures++;
    test.err = err;
    failures.push(test);
    this.emit('fail', test, err);
  },

  end: function() {
    var stats = this.stats;
    stats.end = moment();
    stats.duration = stats.end.diff(stats.start);
    this.emit('end', stats);
  },

  pending: function(test) {
    var stats = this.stats;
    stats.pending++;
    this.emit('pending', test);
  }
};

module.exports = Base;

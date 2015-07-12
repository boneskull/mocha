'use strict';

var Base = require('../../lib/reporters/base');
var sinon = require('sinon');

describe('reporters/Base', function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create('Base');
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('constructor', function() {
    beforeEach(function() {
      sandbox.stub(Base.prototype, '_resetStats');
      sandbox.stub(Base.prototype, '_resetFailures');
      sandbox.stub(Base.prototype, '_listen');
    });

    it('should throw if no runner passed', function() {
      (function() {
        return new Base();
      }).should.throw('invalid parameters');
    });
  });
});

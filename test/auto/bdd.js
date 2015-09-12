'use strict';

var mocha = require('../../auto/bdd')({
  reporter: 'spec'
});
var describe = mocha.describe;
var it = mocha.it;
var assert = require('assert');

describe('nodeability', function() {
  it('should make this assertion', function() {
    assert(true);
  });
});

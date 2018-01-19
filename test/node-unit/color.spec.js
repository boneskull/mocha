'use strict';

var assert = require('assert');
var childProcess = require('child_process');
var path = require('path');

describe('Mocha', function () {
  var FORCE_COLOR;

  this.timeout(4000);

  before(function () {
    // avoid forcing the hand of `supports-color`
    FORCE_COLOR = process.env.FORCE_COLOR;
    delete process.env.FORCE_COLOR;
  });

  after(function () {
    process.env.FORCE_COLOR = FORCE_COLOR;
  });

  it('should not output colors to pipe', function (done) {
    var command = [path.join('bin', 'mocha'), '--grep', 'missing-test'];

    childProcess.execFile(
      process.execPath,
      command,
      function (err, stdout, stderr) {
        if (err) {
          return done(err);
        }

        assert(stdout.indexOf('[90m') === -1);

        done();
      }
    );
  });
});

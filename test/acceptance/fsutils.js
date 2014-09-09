var fsutils = require('../../lib/fsutils');

describe('lib/fsutils', function () {
  describe('lookupFiles', function () {
    var fs = require('fs');

    beforeEach(function () {
      fs.writeFileSync('/tmp/mocha-utils.js', 'yippy skippy ying yang yow');
      fs.symlinkSync('/tmp/mocha-utils.js', '/tmp/mocha-utils-link.js');
    });

    it('should not choke on symlinks', function () {
      fsutils.lookupFiles('/tmp', ['js'], false)
        .should.containEql('/tmp/mocha-utils-link.js')
        .and.containEql('/tmp/mocha-utils.js')
        .and.have.lengthOf(2);
      fs.existsSync('/tmp/mocha-utils-link.js').should.be.true;
      fs.rename('/tmp/mocha-utils.js', '/tmp/bob');
      fs.existsSync('/tmp/mocha-utils-link.js').should.be.true;
      fsutils.lookupFiles('/tmp', ['js'], false).should.eql([]);
    });

    afterEach(function () {
      ['/tmp/mocha-utils.js', '/tmp/mocha-utils-link.js', '/tmp/bob'].forEach(function (path) {
        try {
          fs.unlinkSync(path);
        }
        catch (ignored) {
        }
      });
    });
  });

});

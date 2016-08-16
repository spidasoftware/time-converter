var assert = require('assert'),
    toTime = require('../lib/to-time')


describe('toTime', function() {
  describe('convert', function() {
    it('should return one entry per code combination', function() {

      var time = toTime([ '226', 'E', '1', 42.58999999999999, '' ]);

      assert.equal(-1, time.indexOf("42.5899999"), "should not have too many decimal places");

    });
  });
});

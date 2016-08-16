var assert = require('assert'),
    combine = require('../lib/combine'),
    fs = require('fs');

var allTimeEntries = JSON.parse(fs.readFileSync("./test/combine-fixture.json"));

describe('combine', function() {
  describe('time', function() {
    it('should return one entry per code combination', function() {

      assert.equal(26, combine(allTimeEntries).length);

    });
  });
});

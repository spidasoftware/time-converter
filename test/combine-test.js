var assert = require('assert'),
    combine = require('../lib/combine'),
    _ = require('lodash'),
    fs = require('fs');

var allTimeEntries = JSON.parse(fs.readFileSync("./test/combine-fixture.json"));

describe('combine', function() {
  describe('time', function() {
    it('should return one entry per code combination', function() {

      var combined = combine(allTimeEntries);

      console.log(combined);

      assert.equal(26, combined.length, "should have correct number of entries");

    });
  });
});

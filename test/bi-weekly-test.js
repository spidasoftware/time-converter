var assert = require('assert'),
    biWeekly = require('../lib/bi-weekly'),
    toTime = require('../lib/to-time'),
    _ = require('lodash'),
    fs = require('fs');

var report0 = fs.readFileSync("./test/bi-weekly-fixture1.txt").toString();
var report1 = fs.readFileSync("./test/bi-weekly-fixture2.txt").toString();

describe('bi-weekly', function() {
  describe('summation', function() {
    it('should combine the weekly reports correctly', function() {

      let allLines = biWeekly(report0, report1)

      assert.ok(!_.find(allLines, function(entry){
        return entry[3]>10 && entry[2]=="2";
      }), "should not have anything over 10")
      assert.ok(!_.find(allLines, function(entry){ return entry[3]>80}), "should not have anything over 80")

    });
  });
});

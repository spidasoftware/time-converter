var assert = require('assert'),
    Combine = require('../lib/combine'),
    _ = require('lodash'),
    fs = require('fs');

var allTimeEntries = JSON.parse(fs.readFileSync("./test/combine-fixture.json"));

describe('combine', function() {
  describe('time', function() {
    it('should return one entry per code combination', function() {

      var employeeIdMap = {}
      _.each(allTimeEntries, function(timeEntry){
        employeeIdMap[timeEntry.day_entry.user_id]=timeEntry.day_entry.user_id
      })

      var taskIdMap = {}
      taskIdMap[allTimeEntries[0].day_entry.task_id]="V"
      taskIdMap[allTimeEntries[1].day_entry.task_id]="S"
      taskIdMap[allTimeEntries[2].day_entry.task_id]="H"

      var combine = new Combine(employeeIdMap, taskIdMap)
      var combined = combine.process(allTimeEntries);

      assert.equal(46, combined.length, "should have correct number of entries");
      assert.ok(!_.find(combined, function(entry){entry[3]>40}), "should not have anything over 40")

    });
  });
});

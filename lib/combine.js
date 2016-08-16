var _ = require('lodash'),
    fs = require('fs');

var employeeIdMap = JSON.parse(fs.readFileSync("./employeeIdMap.json"));
var taskIdMap = JSON.parse(fs.readFileSync("./taskIdMap.json"));

module.exports = function(allTimeEntries, allUsers){

  allUsers = allUsers || [];

  return _.reduce(allTimeEntries, function(summedEntries, timeEntry){

    if (!timeEntry.day_entry.is_closed) {
      console.error("" + allUsers[timeEntry.day_entry.user_id] + " has unapproved time")
    }

    var employeeId = employeeIdMap[timeEntry.day_entry.user_id];

    if (employeeId) {
      var taskId = taskIdMap[timeEntry.day_entry.task_id] || "1";

      var lineToWrite = _.find(summedEntries, function(summedEntry){
        return summedEntry[0]==employeeId && summedEntry[2]==taskId
      });

      if(lineToWrite){
        lineToWrite[3]+=timeEntry.day_entry.hours
      }else{
        var lineToWrite = [employeeId];

        lineToWrite.push("E"); //D or E
        lineToWrite.push(taskId);
        lineToWrite.push(timeEntry.day_entry.hours) //hours
        lineToWrite.push("") //Amount

        summedEntries.push(lineToWrite);
      }
    }
    return summedEntries;

  }, []);
}

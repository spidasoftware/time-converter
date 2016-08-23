var _ = require('lodash');

function Combine(employeeIdMap, taskIdMap) {
  this.employeeIdMap = employeeIdMap;
  this.taskIdMap = taskIdMap;
  this.regular = 80;
}

Combine.prototype.process = function process(allTimeEntries, allUsers){

  allUsers = allUsers || [];
  let self = this;

  return _.reduce(allTimeEntries, function(summedEntries, timeEntry){

    if (!timeEntry.day_entry.is_closed) {
      console.error("" + allUsers[timeEntry.day_entry.user_id] + " has unapproved time")
    }

    var employeeId = self.employeeIdMap[timeEntry.day_entry.user_id];

    if (employeeId) {
      var taskId = self.taskIdMap[timeEntry.day_entry.task_id] || "1";

      var lineToWrite = _.find(summedEntries, function(summedEntry){
        return summedEntry[0]==employeeId && summedEntry[2]==taskId
      });

      if(lineToWrite){
        let overtime = (lineToWrite[3]+timeEntry.day_entry.hours)-self.regular;

        if(overtime>0){
          var overtimeLine = _.find(summedEntries, function(summedEntry){
            return summedEntry[0]==employeeId && summedEntry[2]=="2"
          });
          lineToWrite[3]=self.regular;
          if(overtimeLine){
            overtimeLine[3]+=overtime
          }else{
            summedEntries.push([employeeId, "E", "2", overtime, ""]);
          }

        }else{
          lineToWrite[3]+=timeEntry.day_entry.hours;
        }
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
};

module.exports = Combine;

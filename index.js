var _ = require('lodash');
var dateFormat = require('dateformat');
var Harvest = require('harvest');
var fs = require('fs');
var async = require('async');
require('datejs');

var harvest = new Harvest({
  subdomain: process.env.HARVEST_SUBDOMAIN,
  email: process.env.HARVEST_EMAIL,
  password: process.env.HARVEST_PASSWORD
})

var employeeIdMap = JSON.parse(fs.readFileSync("employeeIdMap.json"));
var taskIdMap = JSON.parse(fs.readFileSync("taskIdMap.json"));

var TimeTracking = harvest.TimeTracking;
var Reports = harvest.Reports;
var People = harvest.People;
var ExpenseCategories = harvest.ExpenseCategories;

var curr = new Date; // get current date
var first = curr.getDate() - curr.getDay() - 6; // First day is the day of the month - the day of the week
var last = first + 6; // last day is the first day + 6

//Can run report on monday/tuesday
var firstday = dateFormat(Date.last().monday(), "yyyymmdd");
if (Date.today().is().tuesday()) {
  firstday = dateFormat(Date.last().monday().add(-7).days(), "yyyymmdd");
}
var lastday = dateFormat(Date.last().sunday(), "yyyymmdd");

console.log(firstday + " " + lastday)

var allTimeEntries = [];
var allExpenses = [];
var allUsers = [];

var entriesByUser = function(person, callback) {

  //Comment back in to see the users id and meail
  //console.log(person.user.email+": "+person.user.id)
  allUsers[person.user.id] = person.user.email

  Reports.timeEntriesByUser({
    user_id: person.user.id,
    from: firstday,
    to: lastday
  }, function(err, timeEntires) {
    //Handel any error
    if (err && err.status == "404") {
      console.error(JSON.stringify(err));
    } else if (err) {
      throw new Error(err);
    }

    //Next get any expenses the user may have
    Reports.expensesByUser({
      user_id: person.user.id,
      from: firstday,
      to: lastday
    }, function(err, expenses) {
      if (timeEntires.length > 0) {
        allTimeEntries = allTimeEntries.concat(timeEntires);
      }
      if (expenses.length > 0) {
        allExpenses = allExpenses.concat(expenses);
      }
      callback();
    });
  });
}

var expensesByDate = function(callback) {

}

ExpenseCategories.list({}, function(err, expenseCategories) {

  People.list({
    active: true
  }, function(err, people) {
    //Get all the time then process them to the TIME0002 format

    async.each(people, entriesByUser, function(err) {
      if (err) {
        console.error("error");
      } else {
        //Process them into the format with the tab seperated:
        //Employee Number, Override Department Number, D or E, Earning or Deduction Code, Override Rate, Hours, Amount
        _.each(allTimeEntries, function(timeEntry) {

          if (!timeEntry.day_entry.is_closed) {
            console.error("" + allUsers[timeEntry.day_entry.user_id] + " has unapproved time")
          }
          var employeeId = employeeIdMap[timeEntry.day_entry.user_id];

          if (employeeId) {

            var lineToWrite = [employeeId];
            lineToWrite.push("") //Override Department Number

            var taskId = taskIdMap[timeEntry.day_entry.task_id];
            lineToWrite.push("E"); //D or E
            if (taskId) {
              lineToWrite.push(taskId);
            } else {
              lineToWrite.push("1");
            }
            lineToWrite.push("") //Override Rate
            lineToWrite.push(timeEntry.day_entry.hours) //hours
            lineToWrite.push("") //Amount
            fs.appendFileSync('reports/TIME0002-' + firstday + "-" + lastday + '.txt', lineToWrite.join("\t") + "\n");
          }
        })

        _.each(allExpenses, function(expense) {
          if (!expense.expense.is_closed) {
            console.error("" + allUsers[expense.expense.user_id] + " has unapproved expense")
          }
          var employeeId = employeeIdMap[expense.expense.user_id];

          if (employeeId) {

            var lineToWrite = [employeeId];
            lineToWrite.push("") //Override Department Number
            var reimbursible = _.find(expenseCategories, function(expenseCategory){
              return expenseCategory.expense_category.name.indexOf("Reimbursable")>=0
            });
            if(reimbursible){
              lineToWrite.push("D"); //D or E
              lineToWrite.push("R1");
              lineToWrite.push("") //Override Rate
              lineToWrite.push("") //hours
              lineToWrite.push(expense.expense.total_cost) //Amount
              fs.appendFileSync('reports/TIME0002-' + firstday + "-" + lastday + '.txt', lineToWrite.join("\t") + "\n");
            }
          }
        });
      }
    });
  });
});

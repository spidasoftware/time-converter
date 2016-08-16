var _ = require('lodash');
var dateFormat = require('dateformat');
var Harvest = require('harvest');
var fs = require('fs');
var async = require('async');
require('datejs');

var combine = require('./lib/combine');

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

var firstday

if (Date.today().is().monday()) {
  firstday = dateFormat(Date.last().monday(), "yyyymmdd");
}else{
  firstday = dateFormat(Date.last().monday().add(-21).days(), "yyyymmdd");
}
var lastday = dateFormat(Date.last().sunday(), "yyyymmdd");

console.log(firstday + " " + lastday)

var allTimeEntries = [];
var allExpenses = [];
var allUsers = [];

var entriesByUser = function(person, callback) {

  //Comment back in to see the users id and meail
  // console.log(person.user.email+": "+person.user.id)
  allUsers[person.user.id] = person.user.email

  Reports.timeEntriesByUser({
    user_id: person.user.id,
    from: firstday,
    to: lastday
  }, function(err, timeEntires) {
    //Handel any error
    if (err && (err.status || err.message)) {
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

var convertArraytoTIME = function(lineArray){
  var line = "";
  //Employee number is the first 6 characters
  line += ("      " + lineArray[0]).slice(-6);
  //The fields we do not use and are the next 44 characters
  line += new Array(45).join( " " );
  line += lineArray[1]; //D or E
  line += ("  " + lineArray[2]).slice(-2); //Earn Code
  line += new Array(10).join( " " ); // Rate
  line += ("        " + lineArray[3]).slice(-8); //Hours
  line += new Array(13).join( " " ); // Next 5 date fields
  line += ("        " + lineArray[4]).slice(-9); //Amount
  return line;
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
        //Process them into the format with the specific space seperated:
        //Employee Number, Override Department Number, D or E, Earning or Deduction Code, Override Rate, Hours, Amount
        _.each(combine(allTimeEntries, allUsers), function(timeEntry) {
            fs.appendFileSync('reports/TIME0002-' + firstday + "-" + lastday + '.txt', convertArraytoTIME(timeEntry) + "\n");
        })

        //Process all the expenses that were retrieved
        _.each(allExpenses, function(expense) {
          if (!expense.expense.is_closed) {
            console.error("" + allUsers[expense.expense.user_id] + " has unapproved expense")
          }
          var employeeId = employeeIdMap[expense.expense.user_id];

          if (employeeId) {

            var lineToWrite = [employeeId];
            var reimbursible = _.find(expenseCategories, function(expenseCategory){
              return expenseCategory.expense_category.name.indexOf("Reimbursable")>=0 && expenseCategory.expense_category.id==expense.expense.expense_category_id
            });
            if(reimbursible){
              lineToWrite.push("D"); //D or E
              lineToWrite.push("R1");
              lineToWrite.push("") //hours
              lineToWrite.push(expense.expense.total_cost) //Amount
              fs.appendFileSync('reports/TIME0002-' + firstday + "-" + lastday + '.txt', convertArraytoTIME(lineToWrite) + "\n");
            }
          }
        });
      }
    });
  });
});

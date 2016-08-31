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

var TimeTracking = harvest.TimeTracking;
var Reports = harvest.Reports;
var People = harvest.People;
var ExpenseCategories = harvest.ExpenseCategories;

var home = process.env.HOME || process.env.USERPROFILE;
var employeeIdMap = JSON.parse(fs.readFileSync(home+"/.timeConvert/employeeIdMap.json"));
var taskIdMap = JSON.parse(fs.readFileSync(home+"/.timeConvert/taskIdMap.json"));
var emailConfig = JSON.parse(fs.readFileSync(home+"/.timeConvert/emailConfig.json"));

var toTime = require('./lib/to-time');
var mail = require('./lib/mail');

var Combine = require('./lib/combine');
var Reimburse = require('./lib/reimburse');
var combine = new Combine(employeeIdMap, taskIdMap);
var reimbuse = new Reimburse(employeeIdMap);

var curr = new Date; // get current date
var first = curr.getDate() - curr.getDay() - 6; // First day is the day of the month - the day of the week
var last = first + 6; // last day is the first day + 6

var firstday

if (Date.today().is().monday()) {
  firstday = dateFormat(Date.last().monday().add(-7).days(), "yyyymmdd");
}else{
  firstday = dateFormat(Date.last().monday().add(-14).days(), "yyyymmdd");
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
        let report = 'reports/TIME0002-' + firstday + "-" + lastday + '.txt';

        fs.writeFileSync(report,"");

        _.each(combine.process(allTimeEntries, allUsers), function(timeEntry) {
            fs.appendFileSync(report, toTime(timeEntry) + "\n");
        })

        //Process all the expenses that were retrieved
        _.each(reimbuse.process(allExpenses, expenseCategories, allUsers), function(expense) {
            fs.appendFileSync(report, toTime(expense) + "\n");
        });

        mail(emailConfig, report);
      }
    });
  });
});

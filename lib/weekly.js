//Queries the weekly time and writes it to a report

var Harvest = require('harvest');
var fs = require('fs');
var async = require('async');
var _ = require('lodash');

var harvest = new Harvest({
    subdomain: process.env.HARVEST_SUBDOMAIN,
    email: process.env.HARVEST_EMAIL,
    password: process.env.HARVEST_PASSWORD
});

var home = process.env.HOME || process.env.USERPROFILE;
var employeeIdMap = JSON.parse(fs.readFileSync(home + "/.timeConvert/employeeIdMap.json"));
var taskIdMap = JSON.parse(fs.readFileSync(home + "/.timeConvert/taskIdMap.json"));

var TimeTracking = harvest.TimeTracking;
var Reports = harvest.Reports;
var People = harvest.People;
var ExpenseCategories = harvest.ExpenseCategories;

var Combine = require('./combine');
var Reimburse = require('./reimburse');
var combine = new Combine(employeeIdMap, taskIdMap);
var reimbuse = new Reimburse(employeeIdMap);


module.exports = function(fromDate, toDate, report, weeklyCallback) {

    var allTimeEntries = [];
    var allExpenses = [];
    var allUsers = [];

    console.log("from "+fromDate + " to "+toDate)

    var entriesByUser = function(person, callback) {

        //Comment back in to see the users id and meail
        // console.log(person.user.email+": "+person.user.id)
        allUsers[person.user.id] = person.user.email

        Reports.timeEntriesByUser({
            user_id: person.user.id,
            from: ""+fromDate,
            to: ""+toDate
        }, function(err, timeEntires) {
            //Handle any error
            if (err && (err.status || err.message)) {
                console.error(JSON.stringify(err));
            } else if (err) {
                throw new Error(err);
            }

            //Next get any expenses the user may have
            Reports.expensesByUser({
                user_id: person.user.id,
                from: fromDate,
                to: toDate
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

                    fs.writeFileSync(report, "");

                    _.each(combine.process(allTimeEntries, allUsers), function(timeEntry) {
                        fs.appendFileSync(report, timeEntry.join(',') + ";");
                    })

                    //Process all the expenses that were retrieved
                    _.each(reimbuse.process(allExpenses, expenseCategories, allUsers), function(expense) {
                        fs.appendFileSync(report, expense.join(',') + ";");
                    });

                    weeklyCallback();
                }
            });
        });
    });
}

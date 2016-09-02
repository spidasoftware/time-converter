require('datejs');
var _ = require('lodash');
var async = require('async');
var dateFormat = require('dateformat');
var weekly = require('./lib/weekly');
var biWeekly = require('./lib/bi-weekly');
var toTime = require('./lib/to-time');
var fs = require('fs');

var home = process.env.HOME || process.env.USERPROFILE;

var emailConfig = JSON.parse(fs.readFileSync(home+"/.timeConvert/emailConfig.json"));
var mail = require('./lib/mail');

var curr = new Date; // get current date
var first = curr.getDate() - curr.getDay() - 6; // First day is the day of the month - the day of the week
var last = first + 6; // last day is the first day + 6

var firstday
var middleStart

if (Date.today().is().monday()) {
  firstday = dateFormat(Date.last().monday().add(-7).days(), "yyyymmdd");
  middleStart = dateFormat(Date.last().monday(), "yyyymmdd");
}else{
  firstday = dateFormat(Date.last().monday().add(-14).days(), "yyyymmdd");
  middleStart = dateFormat(Date.last().monday().add(-7).days(), "yyyymmdd");
}

var middleEnd = dateFormat(Date.last().sunday().add(-7).days(), "yyyymmdd");
var lastday = dateFormat(Date.last().sunday(), "yyyymmdd");

console.log("from: "+firstday + " to: " + middleEnd+" and from: "+middleStart + " to: " + lastday)

var getReport = function(dates){
  return 'reports/TIME0002-' + dates[0] + "-" + dates[1] + '.txt';
}
var week1 = [firstday, middleEnd];
var week2 = [middleStart, lastday];

weekly(week1[0], week1[1], getReport(week1), function(){
  weekly(week2[0], week2[1], getReport(week2), function(){

    var report0 = fs.readFileSync(getReport(week1)).toString();
    var report1 = fs.readFileSync(getReport(week2)).toString();

    var completeReport = "./reports/TIME0002.txt";
    var allLines = biWeekly(report0, report1);

    fs.writeFileSync(completeReport, "");
    _.each(_.sortBy(allLines, function(l){return Number(l[0])} ), function(line){
      fs.appendFileSync(completeReport, toTime(line) + "\n");
    });

    mail(emailConfig, completeReport);
  });
});

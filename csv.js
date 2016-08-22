//Converter Class
var Converter = require("csvtojson").Converter,
  _ = require('lodash'),
  fs = require('fs'),
  toTime = require('./lib/to-time');

var converter = new Converter({});

converter.fromFile("./reports/time2.csv",function(err,results){


  var timeEntries = _.reduce(results, function(converted, timeEntry){
      if(timeEntry["Regular Hours"]){
        converted.push([timeEntry["PAYCHEX ID"],"E", "1" , timeEntry["Regular Hours"], ""]);
      }
      if(timeEntry["Over Time"]){
        converted.push([timeEntry["PAYCHEX ID"],"E", "2",timeEntry["Over Time"], ""]);
      }
      if(timeEntry.Vacation){
        converted.push([timeEntry["PAYCHEX ID"],"E", "V",timeEntry.Vacation, ""]);
      }
      if(timeEntry.Sick){
        converted.push([timeEntry["PAYCHEX ID"],"E", "S",timeEntry.Sick, ""]);
      }
      if(timeEntry.Holiday){
        converted.push([timeEntry["PAYCHEX ID"],"E", "H",timeEntry.Holiday, ""]);
      }
      return converted;
  }, []);

  timeEntries= _.sortBy(timeEntries, function(te) { return te[0]; });

  console.log(JSON.stringify(timeEntries));

  let report = 'reports/TIME0002.txt';

  fs.writeFileSync(report,"");

  _.each(timeEntries, function(timeEntry) {
      fs.appendFileSync(report, toTime(timeEntry) + "\n");
  })

});

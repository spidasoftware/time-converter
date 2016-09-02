// Takes the two time reports and makes one bi-weekly
var fs = require('fs');
var _ = require('lodash');
var toTime = require('./to-time');

module.exports  = function(report0, report1){
  var allLines = [];

  report0 = report0.split(";");
  report1 = report1.split(";");

  _.each(report0, function(line){
    allLines.push(line.split(","));
  })
  _.each(report1, function(line){
    allLines.push(line.split(","));
  })

  allLines = _.reduce(allLines, function(summedLines, line){
    if(line.length>1){
      var existingLine = _.find(summedLines, function(summedLine){
        return summedLine[0]==line[0] && summedLine[2]==line[2] && line[4]==''
      });
      if(existingLine){
        existingLine[3]=Number(line[3])+Number(existingLine[3]);
      }else{
        summedLines.push(line);
      }
    }
    return summedLines;
  },[])

  return allLines
}

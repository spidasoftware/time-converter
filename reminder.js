
var fs = require('fs');
var nodemailer = require('nodemailer');

var home = process.env.HOME || process.env.USERPROFILE;

var config = JSON.parse(fs.readFileSync(home+"/.timeConvert/emailConfig.json"));

var transporter = nodemailer.createTransport(config.transport);

let mailOptions = config.mailOptions;
mailOptions.text = fs.readFileSync("./reminder.txt");

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
  if(error){
    return console.log(error);
  }
  console.log('Message sent: ' + info.response);
});

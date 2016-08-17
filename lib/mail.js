var nodemailer = require('nodemailer');


module.exports = function(config, report){
  // create reusable transporter object using the default SMTP transport
  var transporter = nodemailer.createTransport(config.transport);

  let mailOptions = config.mailOptions
  mailOptions["attachments"]=  {
        filename: 'TIME0002.txt',
        path: report
    }
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
}

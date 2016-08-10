//dependencies
//mailgun dependencies (for sending email)
var api_key = 'key-269b7fb26417a2db2ed962f649f133f4'; //put in env variables
var domain = 'sandbox5e28cabe569643f190094b4cd80b922a.mailgun.org'; //put in env variables
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain}); 

var apiObj = {};

apiObj.sendEmailToAdmin = function(req) {
    //used on the /contact route
    var data = {
      from: '' + req.user.email + " <" + req.user.email + ">",
      to: 'wang3790@umn.edu',
      subject: "" + req.body.subject,
      text: '' + req.body.body
    };
    mailgun.messages().send(data, function (err, body) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(body);
        }
    });
};

apiObj.sendEmailsToRecipients = function(req) {
    //for use on the members page
    //sends email to all email addresses that were toggled on the members page
    //since there are multiple instances of the same field ("email"), those fields will come in as an array
    //however, if only one person is selected, req.body.emails won't be an array
    //luckily, mailgun is nice enough to send emails regardless of getting an array or not
    var data = {
      from: '' + req.user.name + " <" + req.user.email + ">",
      to: '' + req.body.emails,
      subject: "" + req.body.subject,
      text: '' + req.body.body
    };
    mailgun.messages().send(data, function (err, body) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(body);
        }
    });
};

module.exports = apiObj;
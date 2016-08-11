//dependencies
var async = require("async");
var fs = require("fs");
////mailgun dependencies (for sending email)
var api_key = 'key-269b7fb26417a2db2ed962f649f133f4'; //put in env variables
var domain = 'sandbox5e28cabe569643f190094b4cd80b922a.mailgun.org'; //put in env variables
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain}); 
////cloudinary dependencies (for uploading images)
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dfu1otwky', 
  api_key: '489538762858983', 
  api_secret: 'rsQ4_S2GMaV_6cMcYDbRCHTlta0' 
});

//models


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

apiObj.uploadImage = function(req, callback) {
    var upload = {};
    if (req.file || req.files) {
        if (req.files) {
            req.file = req.files[0];
        }
        else {
            async.series([
                //save file in cloudinary
                function(callback) {
                    cloudinary.uploader.upload(req.file.path, function(result) { 
                        //console.log(result.url);
                        upload = result;
                        callback(null);
                    });
                },
                //delete file from hard drive
                function(callback) {
                    var path = req.file.path;
                    fs.unlink(path, function(err) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                            console.log("file deleted from hard drive");
                            callback(null);
                        }
                    });
                }
            ], function(err) {
                if (err) {
                    console.log(err);
                }
                else {
                    //return the new upload
                    console.log(upload);
                    callback(upload);
                }
            });
        }
    }
    else {
        upload.error = "No file";
        callback(upload);
    }
};

module.exports = apiObj;
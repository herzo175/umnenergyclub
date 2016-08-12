//dependencies
var async = require("async");
var fs = require("fs");
////mailgun dependencies (for sending email)
var api_key = process.env.MAILGUNAPIKEY; //environment variables are usually used to save secret keys. Create one in the command line with export VARNAME="key"
var domain = 'sandbox5e28cabe569643f190094b4cd80b922a.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain}); //set up mailgun
////cloudinary dependencies (for uploading images)
var cloudinary = require('cloudinary'); 
cloudinary.config({ //set up cloudinary with api keys
  cloud_name: 'dfu1otwky', 
  api_key: process.env.CLOUDINARYAPIKEY, 
  api_secret: process.env.CLOUDINARYAPISECRET
});
//note: environment variables must also be saved onto heroku

//models

//Save all api functions inside an object we can export called apiObj
var apiObj = {};

apiObj.sendEmailToAdmin = function(req) {
    //used on the /contact route
    var data = { //set up mailgun object
      from: '' + req.body.email + " <" + req.body.email + ">", //it is important that we format the sender's email info like this
      to: /*"herzo175@umn.edu"*/ 'wang3790@umn.edu', //send to admin
      subject: "" + req.body.subject,
      text: '' + req.body.body
    };
    mailgun.messages().send(data, function (err, body) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(body); //debugging readout
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
      to: '' + req.body.emails, //this is either an array or a single email depending on how many emails were selected on the members page
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

//this function uploads an image to Cloudinary and returns an object containing the upload data through a callback
//we can't just return the object since node runs asyncronously. We have to specify a callback function to let the program know when the function is done running
//on the upload post route, this function is accessed by calling apis.uploadImage(req, function(upload) { to get the upload object sent through the callback
apiObj.uploadImage = function(req, callback) {
    //we need to declare an upload object first
    //this upload object will either have the data from the upload or an error message telling us that the form was submitted without any files
    var upload = {};
    if (req.file || req.files) {
        //this makes sure that we only work with one file
        if (req.files) {
            req.file = req.files[0];
        }
        else {
            async.series([
                //save file in cloudinary
                function(callback) {
                    //api function call
                    cloudinary.uploader.upload(req.file.path, function(result) { 
                        //console.log(result.url);
                        //set the upload object equal to the data returned by the api
                        upload = result;
                        //then, run callback(null) so async can allow the next function to run in the array of functions
                        callback(null);
                    });
                },
                //delete file from hard drive
                //this saves space and performance. The function runs after the file has been uploaded to the cloud
                function(callback) {
                    var path = req.file.path;
                    //this requires the file system module of node
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
                    //return the new upload via callback
                    console.log(upload);
                    callback(upload);
                }
            });
        }
    }
    else {
        //if there isn't a file, send the upload object with the field error
        upload.error = "No file";
        callback(upload);
    }
};

//finally, export the apiObj object containing all the functions
module.exports = apiObj;
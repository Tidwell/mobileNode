/*
Creates the basic http and socket servers
Uses util classes to handle those requests

http requests are routed through util/httpUtil.js
socket requests are routed through util/socketUtil.js
*/


//add our require paths to the require array
require.paths.unshift('util/');
require.paths.unshift('controllers/');

//assignments/loading
var 
    //node.js libraries
    http = require('http')
  , fs = require('fs')
  , sys = require('sys')
  , server
  , url = require('url')
  //module libraries
  , log = require('logging')
  
  //custom objects  
  , httpUtil = require('httpUtil.js')

//path to where all the front-end code lives (html/css/js)
//relative to the root dir, without leading or trailing /
var clientFolderPath = 'client';

//create the http server
var server = http.createServer(function(req, res){
	//when we get a HTTP request
  //get the requested system path
	var systemPath = httpUtil.getSystemPathFromRequest({
    clientFolderPath: clientFolderPath, 
    req: req
  });
  var mime = httpUtil.mimeType(url.parse(req.url).pathname);
  var encoding = (mime == 'text/html') ? "utf8" : null;
  //see if there is a controller
  var viewVars;
  var controllerPath = 'controllers'+url.parse(req.url).href+'.js';
  fs.readFile(controllerPath, "utf8", function(err, data) {
    if (err) {
      //try to grab the file
      fs.readFile(systemPath, encoding, function(err, data) {
        if (err) {
          //send the client a 404 response
          httpUtil.send404(res);
          return;
        }
        //else, we can send back the file that maps to the requested url    
        httpUtil.sendFile({res: res, data: data, path: systemPath, mime: mime, viewVars: viewVars});
      });
    }
    else {
      //else we have a controller
      var templateObject = {
        httpUtil: httpUtil,
        systemPath: systemPath,
        encoding: encoding,
        mime: mime,
        res: res,
        render: function(viewVars) {
          var renderer = this;
          //try to grab the file
          fs.readFile(this.systemPath, this.encoding, function(err, data) {
            if (err) {
              //send the client a 404 response
              renderer.httpUtil.send404(res);
              return;
            }
            //else, we can send back the file that maps to the requested url    
            renderer.httpUtil.sendFile({res: renderer.res, data: data, path: renderer.systemPath, mime: renderer.mime, viewVars: viewVars});
          });
        }
      }
      var controller = require(url.parse(req.url).href.replace('/','')+'.js');
      controller.init(templateObject);
    }
  });
});

//listen
server.listen(8080);
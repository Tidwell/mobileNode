/*
Helper functions for http responses
*/

require.paths.unshift('lib/jazz/lib');

//assignments/loading
var 
    //node.js libraries
    url = require('url')
  , sys = require('sys')
    //module libraries
  , log = require('logging')
  , jazz = require("jazz")


//sends a 404 message
//@arg response object
exports.send404 = function(res){
  res.writeHead(404);
  res.write('404');
  res.end();
}

/*gets the actual system file path based on a request object
 *@arg obj.
 *         req                resquest object
 *         clientFolderPath   path to the client-side code relative to the root dir, without leading or trailing /
*/
exports.getSystemPathFromRequest = function(obj){
  var   req = obj.req
      , clientFolderPath = obj.clientFolderPath
      
  var baseRequestPath = intendedFilePath(url.parse(req.url).pathname);
  //set the full path from the system root
  //        util root/..up/..up/client folder/requested file path
  var mime = exports.mimeType(baseRequestPath);
  var internal = (mime == 'text/html') ? '/html' : '';
  var path = __dirname + '/../../' + clientFolderPath + internal+ baseRequestPath;

  //replace shared includes with the shared directory
  var path = path.replace('shared/', '../shared/');
  return path;
}


function intendedFilePath(path) {
  //if the last character is a slash
	if (path.charAt(path.length-1) == '/') {
    //if it is a directory
    if (path.length > 1) {
      //we append index.html
      path += 'index.html';
    }
    else {
      //requesting the root url
      path = '/index.html';
    }
  }
  return path;
}

/*sends a file over http
 *@arg obj.
 *         res    response object
 *         path   path to the file to send
 *         data   the data contained in the file at the path
*/
exports.sendFile = function(obj){
  var   res = obj.res
      , path = obj.path
      , data = obj.data
      , viewVars = obj.viewVars
      
  //write the header 200 OK
	res.writeHead(200,{'Content-Type': exports.mimeType(path)})
  //if viewVariables came in from the template
  if (viewVars) {
    //run them through jazz
    var template = jazz.compile(data);
    template.eval(viewVars, function(data) { 
      //write the document as the data, using utf8-encoding
      res.write(data, 'utf8');
      //done with this HTTP request
      res.end();
    });
    return;
  }
  //otherwise we can just write out the data
  res.write(data, 'utf8');
  //done with this HTTP request
  res.end();
}

//helper for determining mime-type
//mappings of file extensions to mime types
var mimeMappings = {
    js: 'text/javascript'
  , html: 'text/html'
  , css: 'text/CSS'
  , _default: 'text/plain'
}
//@arg any path to a file (formatted as .extension)
exports.mimeType = function(path) {
  //get the file extension
  var extension = path.split('.');
  extension = extension[extension.length-1];
	//if a matching mimetype exists, return it otherwise return the default
  var mimeType = mimeMappings[extension];
  return (mimeType) ? mimeType : mimeMappings._default;
}

var request = require('request'),
    jsdom = require('jsdom'),
    sys = require('sys'),
    url = require('url'),
    log = require('logging'),
    querystring = require('querystring')
    
var cache = {};
  
exports.init = function(template) {
  var path = querystring.parse(url.parse(template.req.url).query).postUrl;
  var domain = url.parse(path);
  if (domain.hostname != 'aarontidwell.com') {
    template.render({
      error: 'Invalid Post',
      meta: {}
    });
    return;
  }
  if (cache[path]) {
    template.render(cache[path]);
    //done
    return;
  };
  request({uri:path}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var window = jsdom.jsdom(body).createWindow();
      jsdom.jQueryify(window, '../../client/js/jquery.js', function (window, jquery) {
        // jQuery is now loaded on the jsdom window 
        var contentEls = jquery(jquery('#content div')[0]);
        var content = {
          title: contentEls.find('h2').html(),
          body: contentEls.find('.entry-content').html(),
          meta: {
            author: contentEls.find('.entry-meta .fn.n').html(),
            date: contentEls.find('.entry-meta .published').html()
          }
        };
        cache[path] = content;
        template.render(content);
      });
    }
  });
}
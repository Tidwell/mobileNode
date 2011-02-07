require.paths.unshift('lib');

var  rss = require('node-rss')
   , log = require('logging')

var cache = {};

exports.init = function(template) {
  var feedUrl = 'http://aarontidwell.com/wordpress/feed/';
  
  if (cache[feedUrl]) {
    template.render({articles: cache[feedUrl]});
    return;
  }
  
  //else
  rss.parseURL(feedUrl, function(feed) {
    cache[feedUrl] = feed;
    template.render({articles: feed});
  });
}
  
  
  
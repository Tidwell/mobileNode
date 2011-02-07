require.paths.unshift('lib');

var    FlickrAPI = require('flickrnode/lib/flickr').FlickrAPI
     , flickr = new FlickrAPI('4ff7619fe188ab4a38026097a99061e9')
     , sys = require('sys')
     , log = require('logging')

exports.init = function(template) {
  // Search for photos with a tag of 'badgers'
  flickr.photos.search({tags:'badger'},  function(error, results) {
    template.render({photos: results.photo, error: error});
  });
}
  
  
  
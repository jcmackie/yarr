// Load libraries used to fetch the metadata
// First to search google sama!
// https://www.npmjs.com/package/google
const google = require('google');


function getTvEpisodeMetadata(parsedList){
  parsedList.forEach(episode => {
    console.log(`Found tv show ${episode.showName} with episode number ${episode.episode}`);
    console.log(`Searching Google`);
    // Call the searchGoogle function and supply a 'callback' function which will get called when the search completes
    // Did I mention I hate javascript?
    searchGoogle(episode.showName, firstResultUrl => { console.log(firstResultUrl)} );
  });
}



function searchGoogle(query, callback){
    // 'callback' is the function that will be called when the async Google promise completes
    // I hate javascript
    google.resultsPerPage = 10
    
    google(query + "site:www.thetvdb.com", function (err, res){
      if (err) console.error(err)
      
      /*
      for (var i = 0; i < res.links.length; ++i) {
        var link = res.links[i];
        console.log(link.title + ' - ' + link.href)
        console.log(link.description + "\n")
      }
      */
      
      // A regex to find the 'base' address of the searched for series in the tvdb
      let tvdbRegex = /(https:\/\/www\.thetvdb\.com\/series\/[\w-]+\/).*/gm;
      // Apply our tvdbRegex and pick the first group [1]
      let firstResultUrl = tvdbRegex.exec(res.links[0].href)[1]
  
      callback && callback(firstResultUrl)
    })
}

exports.getTvEpisodeMetadata = getTvEpisodeMetadata

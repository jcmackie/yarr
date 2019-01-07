// Load libraries used to fetch the metadata
// First to search google sama!
// https://www.npmjs.com/package/google
const google = require('google');

// Next get our local module used to scrap theTVDB
const theTVDB = require('./theTvDb')


function getTvEpisodeMetadata(tvShowName, episode){
  // The 'google' module works via callback, but I have wrapped it in a Promise
  searchGoogle(tvShowName)
    .then( result => theTVDB.getTvEpisodeMetadata(result))
    .then( result => console.log(result))
    .catch( failure => console.error(failure))
}


function searchGoogle(query){
  // OMG promises. I need to learn to wrap my head around Promises and Callbacks before I can tackle async/await
  return new Promise((resolve, reject) => {
    // I hate javascript
    google.resultsPerPage = 1
    
    // Search Google and wait for the results
    google(query + "site:www.thetvdb.com", function (err, res){
      if (err) {
        reject(err)
      }
      else if (res.links.length == 0) {
        reject("No results found for query: " + query)
      }
      else {
        // A regex to find the 'base' address of the searched for series in the tvdb
        let tvdbRegex = /(https:\/\/www\.thetvdb\.com\/series\/[\w-]+\/).*/gm;
        // Apply our tvdbRegex and pick the first group [1]
        let firstResultUrl = tvdbRegex.exec(res.links[0].href)[1]

        // Resolve our promise with the url of the first result
        resolve(firstResultUrl)
      }
    })
  })
}

exports.getTvEpisodeMetadata = getTvEpisodeMetadata

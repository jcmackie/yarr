// Load libraries used to fetch the metadata
// First to search google sama!
// https://www.npmjs.com/package/google-it
const googleIt = require('google-it');

// Next get our local module used to scrap theTVDB
const theTVDB = require('./theTvDb')


function getTvEpisodeMetadata(tvShowName, season, episode){
  return new Promise((resolve, reject) => {
    // The 'google' module works via callback, but I have wrapped it in a Promise
    searchGoogle(tvShowName)
      .then( result => theTVDB.getTvEpisodeMetadata(result, season, episode))
      .then( result => {
        resolve(result)
      })
      .catch( failure => console.error(failure))
  })
}


function searchGoogle(query){
  // OMG promises. I need to learn to wrap my head around Promises and Callbacks before I can tackle async/await
  return new Promise((resolve, reject) => {
    // I hate javascript
    query = query + "site:www.thetvdb.com"
    
    // Search Google and wait for the results
    googleIt({'query': query, 'limit': 1})
      .then(results => {
        if (results.length == 0) {
          reject("No results found for query: " + query)
        } else {
          // A regex to find the 'base' address of the searched for series in the tvdb
          let tvdbRegex = /(https:\/\/www\.thetvdb\.com\/series\/[\w-]+\/).*/gm;

          // Apply our tvdbRegex and pick the first group [1]
          let firstResultUrl = tvdbRegex.exec(results[0].link)[1]
  
          // We know that we don't want the base URL, but the 'all' seasons url
          firstResultUrl = firstResultUrl + 'seasons/all'
  
          // Resolve our promise with the url of the first result
          resolve(firstResultUrl)
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}

exports.getTvEpisodeMetadata = getTvEpisodeMetadata

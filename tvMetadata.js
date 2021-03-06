/*
Yarr is an Electron program used to try and rename files using metadata
scrapped from the internet.
Copyright (C) 2020  James Mackie

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

// Load libraries used to fetch the metadata
// First to search google sama!
// https://www.npmjs.com/package/google-it
const googleIt = require('google-it')

// Next get our local module used to scrap theTVDB
const theTVDB = require('./theTvDb')

/*
  We want to return an object called 'tvShowMetadata' that provides all the episode data for a tv show
  for every eason of that show.
  {
    'S02E05': "I like big butts",
    ...
  }

*/

function getShowMetadata (showName) {
  return new Promise((resolve, reject) => {
    // The 'google' module works via callback, but I have wrapped it in a Promise
    searchGoogle(showName)
      .then(tvShowMetadataURL => theTVDB.getMetadataFromSource(tvShowMetadataURL))
      .then(tvShowMetadata => {
        resolve(tvShowMetadata)
      })
      .catch(failure => {
        // If we failed because there were no results, let's try again but without the first word
        // in the query. This is a dumb heuristic based on the fact that I've noticed a lot
        // of groups like to prepend their files with their name
        // I know there will be a much better way to do this, but I am just trying to get it working.
        console.error('Failed to get result from google (first pass): ' + failure)
        if (failure.startsWith('No results found for query')) {
          const choppedShowName = showName.substr(13)
          console.log('Trying one more time minus one word from the start: ' + choppedShowName)
          searchGoogle(choppedShowName)
            .then(tvShowMetadataURL => theTVDB.getMetadataFromSource(tvShowMetadataURL))
            .then(tvShowMetadata => {
              resolve(tvShowMetadata)
            })
            .catch(failure => {
              console.error(failure)
            })
        }
      })
  })
}

function searchGoogle (query) {
  // OMG promises. I need to learn to wrap my head around Promises and Callbacks before I can tackle async/await
  return new Promise((resolve, reject) => {
    // I hate javascript
    query = query + ' site:www.thetvdb.com/series'

    // Search Google and wait for the results
    googleIt({ query: query, limit: 1 })
      .then(results => {
        if (results.length === 0) {
          reject('No results found for query: ' + query)
        } else {
          // A regex to find the 'base' address of the searched for series in the tvdb
          const tvdbRegex = /(https:\/\/(www\.)?thetvdb\.com\/series\/[\w-]+).*/gm

          // Find the first link that matches our Regex and then pick the first group [1]
          let parsedResultLink = tvdbRegex.exec(results[0].link)[1]

          // We know that we don't want the base URL, but the 'all' seasons url
          parsedResultLink = parsedResultLink + '/allseasons/official'

          // Resolve our promise with the url of the first result
          resolve(parsedResultLink)
        }
      })
      .catch(err => {
        console.error('Error performing Google search: ' + err)
        reject(err)
      })
  })
}

exports.getShowMetadata = getShowMetadata

const JSSoup = require('jssoup').default;
const r2 = require("r2");

function getTvEpisodeMetadata(url, season, episode) {
  return new Promise((resolve, reject) => {
    // Some kind of weird bug with R2 and certain web pages:
    // https://github.com/mikeal/r2/issues/45
    r2(url).response
    // First wait for the R2 reponse promise to resolve,
    .then( result => {
      // R2 response and helper functions just return promises, to be used with await
      return result.text()
    }, fail => {
      console.error(fail)
      reject(fail)
    })
    // and then take the response text and convert into JSSoup
    .then( responseText => {
      let metaDataSoup = new JSSoup(responseText)
      episodeTitle = processSoup(metaDataSoup, season, episode)
      resolve(episodeTitle)
    })
  })
}

function processSoup(soup, season, episode) {
  //let season_details = soup.find(string='Season ' + season).parent.next_sibling.next_sibling
  episode_id = 'S' + season + 'E' + episode
  let episode_details = soup.find(name='span', undefined, string=episode_id).nextElement.nextElement.text.trim()
  return episode_details
}

exports.getTvEpisodeMetadata = getTvEpisodeMetadata
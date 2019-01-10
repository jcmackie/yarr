const JSSoup = require('jssoup').default;
const r2 = require("r2");

function getTvEpisodeMetadata(url) {
  return new Promise((resolve, reject) => {
    // Some kind of weird bug with R2 and certain web pages:
    // https://github.com/mikeal/r2/issues/45
    r2(url).response.then( result => {
      console.log("we got a result")
      resolve(result.text())
    }, fail => {
      console.error(fail)
      reject(fail)
    })
  })
}


exports.getTvEpisodeMetadata = getTvEpisodeMetadata
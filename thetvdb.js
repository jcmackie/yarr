const JSSoup = require('jssoup').default;
const r2 = require("r2");

function getEpisodeMetaData(parsedEpisode, url){
    console.log(`Getting episode metadata: TV show URL ${url}, season ${parsedEpisode.season} with episode number ${parsedEpisode.episode}`);

}

exports.getEpisodeMetaData = getEpisodeMetaData
// Load the FS module to interact with the file system
const fs = require('fs');
// Load the shell module from electron so that we can open files
const {shell} = require('electron');

// Load our tvMetadata library
const tvMetadata = require('./tvMetadata');

function setupDragSpot(){
  var holder = document.getElementById('drag-file');

  holder.ondragover = () => {
      return false;
  };

  holder.ondragleave = () => {
      return false;
  };

  holder.ondragend = () => {
      return false;
  };

  holder.ondrop = (e) => {
      e.preventDefault();

      // Our list of file names
      var fileList = [];

      for (let f of e.dataTransfer.files) {
          fileList.push(f.name);
      }

      displayShowList(fileList);
      return false;
  };
}

function displayShowList(fileList){
  // parse the fileList into a object keyed by tvshows, and sub-objects which contain metadata and episode lists
  let parsedShowList = parseFilenames(fileList);

  console.log(parsedShowList)

  //Dynamically add <ul> tags to the file-list div
  document.getElementById('show-list').innerHTML = `<ul id="display-shows"></ul>`;
  for (let tvShow in parsedShowList) {
    document.getElementById('display-shows').innerHTML += `<li><span class="fa fa-tv"></span> ${tvShow}<ul id="display-episodes: ${tvShow}"></ul></li>`;
    for (let episode of parsedShowList[tvShow]['episodeList']){
        document.getElementById("display-episodes: " + tvShow).innerHTML += `<li><span class="fa fa-file"></span> ${episode.filename}(<span class="fa fa-list-alt"> Season ${episode.season} <span class="fa fa-hashtag"> Episode ${episode.episode})</li>`
    }
  }

  tvMetadata.getTvEpisodeMetadata(parsedShowList)

}

function parseFilenames(file_list){
  // We will pack the parsed file list into a list of objects
  var parsedList = {};
  
  for (let file of file_list) {
    console.log(file);
    // First get the episode details
    
    parsedEpisode = parseEpisode(file)

    tvShowWithWhitespace = parseShowName(file)

    // Make sure there is an object in the parsedList that contains our tv show
    if (!(tvShowWithWhitespace in parsedList)){
        parsedList[tvShowWithWhitespace] = {'episodeList': []}
    }

    // Populate the episodeList for this tv show
    let parsedFile = {'filename': file, 'season': parsedEpisode['season'],  'episode': parsedEpisode['episode']}

    parsedList[tvShowWithWhitespace]['episodeList'].push(parsedFile);
  }
  return parsedList;
}

function parseEpisode(fileName){
    // The regex we use to try and find the episode number details
    let episodeRegex = 'S(\\d{1,2})E(\\d{1,2})';

    let episodeMatch = fileName.match(episodeRegex);
    if (episodeMatch == null) {
      console.error(`No episode details found for: ${file}`);
      return null
    }
    let parsedEpisode = {'season': parseInt(episodeMatch[1]), 'episode': parseInt(episodeMatch[2])}
    return parsedEpisode
}

function parseShowName(fileName){
    // The regex we use to try and find the episode number details
    // We use this to separate the showname from the episode details which usually follow it
    let episodeRegex = 'S(\\d{1,2})E(\\d{1,2})';

    // There's probably much better ways of doing this, but it's what I came up with when doodling
    // around with Javascripts regex functions. Better to get something down and iterate.
    let episodematch = fileName.match(episodeRegex)
    let tvShow = fileName.slice(0, episodematch['index'])

    // Remove any non alphanumeric characters
    let tvShowWithWhitespace = tvShow.replace(/[\W_]+/g, " ");

    return tvShowWithWhitespace

}
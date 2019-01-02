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

      displayFileList(fileList);
      return false;
  };
}

function displayFileList(fileList){
  // parse the fileList into a list of tvshows and episodes
  let parsedShowList = parseFilenames(fileList);

  //Dynamically add <ul> tags to the file-list div
  document.getElementById('file-list').innerHTML = `<ul id="display-files"></ul>`;
  for (let p of parsedShowList) {
      document.getElementById('display-files').innerHTML += `<li><span class="fa fa-file"></span> ${p.filename}<ul><li><span class="fa fa-tv"></span> ${p.showName}</li><li><span class="fa fa-hashtag"> ${p.episode}</li></ul></li>`;
  }

  tvMetadata.getTvEpisodeMetadata(parsedShowList)

}

function parseFilenames(file_list){
  // We will pack the parsed file list into a list of objects
  var parsedList = [];
  // The regex we use to try and find the episode number details
  var episodeRegex = 'S\\d{1,2}E\\d{1,2}';
  for (let file of file_list) {
    console.log(file);
    let episodeMatch = file.match(episodeRegex);
    if (episodeMatch == null) {
      console.log(`No episode details found for: ${file}`);
      continue;
    }
    // Then we try to find the show name, which usually comes before the episode number
    // Get the string preceeding the episode number
    let tvShow = file.slice(0,episodeMatch['index']);
    // Remove any non alphanumeric characters
    let tvShowWithWhitespace = tvShow.replace(/[\W_]+/g, " ");

    // Combine them into an object
    let parsedFile = {'filename': file, 'showName': tvShowWithWhitespace, 'episode': episodeMatch[0]}

    parsedList.push(parsedFile);
  }
  return parsedList;
}

// Load the FS module to interact with the file system
const fs = require('fs');
// Load the shell module from electron so that we can open files
const {shell} = require('electron');

// Load our tvMetadata library
const tvMetadata = require('./tvMetadata.js');

// Load our file parser library
const fileParser = require('./parseFiles.js');

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
  let parsedShowList = fileParser.parseFilenames(fileList);

  console.log(parsedShowList)

  //Dynamically add <ul> tags to the file-list div
  document.getElementById('show-list').innerHTML = `<ul id="display-shows"></ul>`;
  for (let parsedShow in parsedShowList) {
    document.getElementById('display-shows').innerHTML += 
      `<li><span class="fa fa-tv"></span>Show Name: ${parsedShow}<ul id="display-episodes: ${parsedShow}"></ul></li>`;
    for (let parsedEpisode of parsedShowList[parsedShow]['episodeList']){
      document.getElementById("display-episodes: " + parsedShow).innerHTML += 
        `
        <li>
          <span class="fa fa-list-alt"> Season ${parsedEpisode.season}</span> 
          <span class="fa fa-hashtag"> Episode ${parsedEpisode.episode}</span>
          <span class="fa fa-tag" id="episode-name"> Name ...</span>
        </li>
        <li><span class="fa fa-file"></span>Old filename: ${parsedEpisode.filename}</li>
        <li><span class="fa fa-file"></span>New filename: ...</li>
        `
      
    }
  }
  
  // Gather the show metadata via a google lookup, then scrapping theTVDB website
  for (let parsedShow in parsedShowList) {
    for (let parsedEpisode of parsedShowList[parsedShow]['episodeList']){
      tvMetadata.getTvEpisodeMetadata(parsedShow, parsedEpisode.season, parsedEpisode.episode)
        .then(results => {
          document.getElementById("display-episodes: " + parsedShow).querySelector("#episode-name").innerHTML = "Name " + results
        })
    }
  }
  

}


if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}
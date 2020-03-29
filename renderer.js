// Load our file manipulation library
const changeFiles = require('./changeFiles.js');

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

      // Our list of files to parse and search for. A list of objects, containing the file name and the file location
      var fileList = [];

      for (let f of e.dataTransfer.files) {
        let fileItem = {
          "name": f.name,
          "path": f.path
        }
        fileList.push(fileItem);
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
        <li><span class="fa fa-file">File: ${parsedEpisode.filename}</span>
          <ul>
            <li>
              <span class="fa fa-list-alt"> Season ${parsedEpisode.season}</span> 
              <span class="fa fa-hashtag"> Episode ${parsedEpisode.episode}</span>
              <span class="fa fa-tag" id="episode-name"> Name: ...</span>
            </li>
            <li><span class="fa fa-file" id="new-filename">New filename: ...</span></li>
            <li><button id="rename-button"><i class="fa fa-wrench"></i><span style="color:darkgrey;"> Rename file</span></button></li>
          </ul>
        </li>
        `
      
    }
  }
  
  // Gather the show metadata via a google lookup, then scrapping theTVDB website
  for (let parsedShow in parsedShowList) {
    for (let parsedEpisode of parsedShowList[parsedShow]['episodeList']){
      tvMetadata.getTvEpisodeMetadata(parsedShow, parsedEpisode.season, parsedEpisode.episode)
        .then(results => {
          document.getElementById("display-episodes: " + parsedShow).querySelector("#episode-name").innerHTML = "Name: " + results.episode_name

          // Display the new file name we will rename it to, and sanitize for filename suitability
          newFilename = changeFiles.sanitizeFilename(results.show_name) + " "
            + results.episode_id + " - "
            + changeFiles.sanitizeFilename(results.episode_name) + "."
            + parsedEpisode.ext
          document.getElementById("display-episodes: " + parsedShow).querySelector("#new-filename").innerHTML = "New filename: " + newFilename

          // Now let's change the button so that it actually calls the renameFile function when clicked
          // Also, the addEventListener function has to be a reference or an anonymous function declaration.
          // You cannot use 'renameFile(oldFile, newFile) as the parameter because JS will execute it straight away.
          document.getElementById("display-episodes: " + parsedShow).querySelector("#rename-button")
            .addEventListener('click', function(){ changeFiles.renameFile(parsedEpisode.path, newFilename) });
          document.getElementById("display-episodes: " + parsedShow).querySelector("#rename-button").querySelector("span").style = "color:black"

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
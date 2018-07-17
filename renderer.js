// Load the FS module to interact with the file system
const fs = require('fs');
// Load the shell module from electron so that we can open files
const {shell} = require('electron');

// open a folder and list its contents
function readFolder(path) {
  fs.readdir(path, (err, files) => {
      'use strict';
      //if an error is thrown when reading the directory, we throw it. Otherwise we continue
      if (err) throw  err;

      //Dynamically add <ol> tags to the div
      document.getElementById('listed-files').innerHTML = `<ol id="display-files"></ol>`;

      // loop through the list of files
      for (let file of files) {
        fs.stat(path+file,(err,stats)=>{
          if(err) throw err;
          /**
          * When you double click on a folder or file, we need to obtain the path and name so that we can use it to take action.
          * The easiest way to obtain the path and name for each file and folder, is to store that information in the element itself, as an ID.
          * This is possible since we cannot have two files with the same name in a folder.
          * theID variable below is created by concatenating the path with file name and a / at the end.
          * As indicated earlier, we must have the / at the end of the path.
          */
          let theID = `${path}${file}/`;
          /**
          * Check whether the file is a directory or not
          */
          if(stats.isDirectory()){
              /**
               * Add an ondblclick event to each item.
               * With folders, call this same function (recursion) to read the contents of the folder.
               *
               */
              document.getElementById('display-files').innerHTML += `<li id=${theID} ondblclick="readFolder(this.id)"><i class="fa fa-folder-open"></i> ${file}</li>`;
          }
          else {
            /**
             * Add an ondblclick event to each item.
             * If its a file, call the openFile function to open the file with the default app.
             *
             */
            document.getElementById('display-files').innerHTML += `<li id=${theID} ondblclick="openFile(this.id)"><i class="fa fa-file"></i> ${file}</li>`;
          }
        });
      }
  });
}

//open the file with the default application
function openFile(path) {
    shell.openItem(path);
}


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

      //Dynamically add <ul> tags to the file-list div
      document.getElementById('file-list').innerHTML = `<ul id="display-files"></ul>`;

      // Our list of file names
      var file_list = [];

      for (let f of e.dataTransfer.files) {
          document.getElementById('display-files').innerHTML += `<li><span class="fa fa-file"></span> ${f.name}</li>`;
          file_list.push(f.name);
      }
      parseFilenames(file_list);

      return false;
  };
}

function parseFilenames(file_list){
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

    console.log(`Found tv show ${tvShowWithWhitespace} with episode number ${episodeMatch[0]}`);
  }
}

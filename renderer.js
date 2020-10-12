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

// Load our file manipulation library
const changeFiles = require('./changeFiles.js')

// Load our tvMetadata library
const tvMetadata = require('./tvMetadata.js')

// Load our file parser library
const fileParser = require('./parseFiles.js')

// eslint-disable-next-line no-unused-vars
function setupDragSpot () {
  var holder = document.getElementById('drag-file')

  holder.ondragover = () => {
    return false
  }

  holder.ondragleave = () => {
    return false
  }

  holder.ondragend = () => {
    return false
  }

  holder.ondrop = (e) => {
    e.preventDefault()

    // Our list of files to parse and search for. A list of objects, containing the file name and the file location
    var fileList = []

    for (const f of e.dataTransfer.files) {
      const fileItem = {
        name: f.name,
        path: f.path
      }
      fileList.push(fileItem)
    }

    displayShowList(fileList)
    return false
  }
}

function displayShowList (fileList) {
  // parse the fileList into a object keyed by tvshows, and sub-objects which contain metadata and episode lists
  const parsedShowList = fileParser.parseFilenames(fileList)

  // Dynamically add <ul> tags to the file-list div
  document.getElementById('show-list').innerHTML = '<ul id="display-shows"></ul>'
  for (const parsedShow in parsedShowList) {
    document.getElementById('display-shows').innerHTML +=
      `
      <li id="display-shows: ${parsedShow}">
        <span class="fa fa-tv"></span>Show Name: ${parsedShow}
        <button id="rename-all-button"><i class="fa fa-wrench"></i><span style="color:darkgrey;"> Rename all files</span></button>
        <ul id="display-episodes: ${parsedShow}">
        </ul>
      </li>
      `

    for (const parsedEpisode of parsedShowList[parsedShow].episodeList) {
      document.getElementById('display-episodes: ' + parsedShow).innerHTML +=
        `
        <li id="episode-file: ${parsedEpisode.filename}"><span class="fa fa-file">File: ${parsedEpisode.filename}</span>
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
  for (const parsedShow in parsedShowList) {
    tvMetadata.getShowMetadata(parsedShow)
      .then(showMetadata => {
        for (const parsedEpisode of parsedShowList[parsedShow].episodeList) {
          // Go through the placeholder created above and fill in the episode info as we get it
          document
            .getElementById('episode-file: ' + parsedEpisode.filename)
            .querySelector('#episode-name').innerHTML = 'Name: ' + showMetadata[parsedEpisode.episodeId]

          // Display the new file name we will rename it to, and sanitize for filename suitability
          parsedEpisode.newFilename = changeFiles.sanitizeFilename(showMetadata.showName) + ' ' +
            parsedEpisode.episodeId + ' - ' +
            changeFiles.sanitizeFilename(showMetadata[parsedEpisode.episodeId]) + '.' +
            parsedEpisode.ext

          document
            .getElementById('episode-file: ' + parsedEpisode.filename)
            .querySelector('#new-filename').innerHTML = 'New filename: ' + parsedEpisode.newFilename

          // Now let's change the button so that it actually calls the renameFile function when clicked
          // Also, the addEventListener function has to be a reference or an anonymous function declaration.
          // You cannot use 'renameFile(oldFile, newFile) as the parameter because JS will execute it straight away.
          document
            .getElementById('episode-file: ' + parsedEpisode.filename)
            .querySelector('#rename-button')
            .addEventListener('click', function () {
              changeFiles.renameFile(parsedEpisode.path, parsedEpisode.newFilename)
            })
          document
            .getElementById('episode-file: ' + parsedEpisode.filename)
            .querySelector('#rename-button')
            .querySelector('span').style = 'color:black'
        }
        return parsedShowList
      })
      .then(parsedShowList => {
        // Let's iterate through all the parsed shows, and then update their 'Rename All Files' button to
        // look active, and also do something when clicked
        for (const [parsedShowName, parsedShowDetails] of Object.entries(parsedShowList)) {
          // Let's make the "Rename all files" button look ready and attach an action to the button click
          document
            .getElementById('display-shows: ' + parsedShowName)
            .querySelector('#rename-all-button')
            .querySelector('span').style = 'color:black'

          document
            .getElementById('display-shows: ' + parsedShowName)
            .querySelector('#rename-all-button')
            .addEventListener('click', function () {
              // We are going to be super lazy here and just loop through all the parsed episodes
              // rather than passing dicts to the 'renameFile' function. I want to keep that function simple.
              for (const parsedEpisode of parsedShowDetails.episodeList) {
                changeFiles.renameFile(parsedEpisode.path, parsedEpisode.newFilename)
              }
            })
        }
      })
  }
}

if (typeof (String.prototype.trim) === 'undefined') {
  // eslint-disable-next-line no-extend-native
  String.prototype.trim = function () {
    return String(this).replace(/^\s+|\s+$/g, '')
  }
}

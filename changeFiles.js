// Load the FS module to interact with the file system
const fs = require('fs');

// Load the path module so that we can make informed choices about paths and such
const path = require('path');

// Load the shell module from electron so that we can open files
const {shell} = require('electron');


function renameFile(oldFilePath, newFilename) {
    //test
    newFilename = "boop.txt"

    // We're going to assume for now that the renamed files go in the same directory
    newFilePath = path.join(path.dirname(oldFilePath), newFilename)

    // Do the rename
    fs.rename(oldFilePath, newFilePath, function(err) {
        if ( err ) console.log('ERROR: ' + err);
    });
}


// For the sake of being safe with filenames let's convert all non-alphanumeric,
// non-space, non-hypen, non-underscore characters to empty string. However for certain
// character we want an explicit conversion, the 'convertMap' holds the mapping for those
// cases
function sanitizeFilename(filename) {
    console.log(filename)
    convertMap = {
        "×": "x",
        ":": "-",
        " ": " ",
        "-": "-"
    }
    newFilename = filename.replace(/[\W]+/g, function(replaceChar){
        // if our convertMap has an option use it, otherwise empty string
        return convertMap[replaceChar] === undefined ? "" : convertMap[replaceChar]
        } )
    console.log(newFilename)
    return newFilename
}

exports.renameFile = renameFile
exports.sanitizeFilename = sanitizeFilename
// Load the FS module to interact with the file system
const fs = require('fs');
// Load the shell module from electron so that we can open files
const {shell} = require('electron');


function renameFile(oldFile, newFile) {
    fs.rename(oldFile, newFile, function(err) {
        if ( err ) console.log('ERROR: ' + err);
    });
}

exports.renameFile = renameFile
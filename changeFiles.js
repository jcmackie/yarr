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

// Load the FS module to interact with the file system
const fs = require('fs')

// Load the path module so that we can make informed choices about paths and such
const path = require('path')

// Load the shell module from electron so that we can open files
const {shell} = require('electron')

function renameFile (oldFilePath, newFilename) {
  // We're going to assume for now that the renamed files go in the same directory
  let newFilePath = path.join(path.dirname(oldFilePath), newFilename)

  // Do the rename
  fs.rename(oldFilePath, newFilePath, function (err) {
    if (err) console.log('ERROR: ' + err)
  })
}

// For the sake of being safe with filenames we want to sanitize any data we've been given
// from the internet. We'll do this in a few passes:
// First pass is to convert or remove any HTML encoded entities that we received.
// Second pass to convert or remove any  non-alphanumeric, non-space, non-hypen, non-underscore 
// characters.
// For certain characters or entities we want an explicit conversion, the 'convertMap's holds
// the mapping for those cases.
function sanitizeFilename (filename) {
  const entityConvertMap = {
    '&times;': 'x',
    '&hellip;': '...',
    '&amp;': '&',
    '&#039;': '\'',
    '&apos;': '\''
  }

  const characterConvertMap = {
    ':': '-'
  }

  const newFilename = filename
    // First pass
    .replace(/&#*\w+;/g, function (replaceEntity) {
    // if our convert map has an option use it, otherwise hyphen
      return entityConvertMap[replaceEntity] === undefined ? '-' : entityConvertMap[replaceEntity]
    })
    // Second pass
    .replace(/[^\w -.,]{1}/g, function (replaceChar) {
      // if our convert map has an option use it, otherwise a litteral space
      return characterConvertMap[replaceChar] === undefined ? ' ' : characterConvertMap[replaceChar]
    })

  return newFilename
}

exports.renameFile = renameFile
exports.sanitizeFilename = sanitizeFilename

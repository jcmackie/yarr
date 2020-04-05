/* 
Return a object with details that have been parsed from the filename.
The structure looks like this:
{
  'TecchanHouse Terrace House Boys x Girls next door': {
    'episodeList': [
      { 
        'filename': '[TecchanHouse]_Terrace.House.Boys.x.Girls.next.door.S08E11.Week98.720p.mkv',
        'ext': 'mkv',
        'season': 8,
        'episode': 11
      }
      ...
    ]
  },
  ...
}
*/

// The regex we use to find epside details
const episodeRegex = 'S(\\d{1,2})\\s*E(\\d{1,2})';


function parseFilenames(file_list){
    // We will pack the parsed file list into a list of objects
    var parsedList = {};
    
    for (let file of file_list) {
      // First get the episode details
      
      parsedEpisode = parseEpisode(file.name)
  
      tvShowWithWhitespace = parseShowName(file.name)
  
      // Make sure there is an object in the parsedList that contains our tv show
      if (!(tvShowWithWhitespace in parsedList)){
          parsedList[tvShowWithWhitespace] = {'episodeList': []}
      }
  
      // Populate the information for this file
      let parsedFile = {
        'filename': file.name,
        'path': file.path,
        // Just a dumb way of trying to find the extension of the file (we need to preserve that)
        'ext': file.name.substring(file.name.lastIndexOf('.') + 1),
        'season': parsedEpisode['season'],
        'episode': parsedEpisode['episode']
      }
  
      parsedList[tvShowWithWhitespace]['episodeList'].push(parsedFile);
    }
    return parsedList;
  }
  
  function parseEpisode(fileName){
      let episodeMatch = fileName.match(episodeRegex);
      if (episodeMatch == null) {
        console.error(`No episode details (season number or episode number) found for: ${fileName}`);
        return null
      }

      let parsedEpisode = {'season': episodeMatch[1].padStart(2,'0'), 'episode': episodeMatch[2].padStart(2,'0')}
      return parsedEpisode
  }
  
  function parseShowName(fileName){
      // There's probably much better ways of doing this, but it's what I came up with when doodling
      // around with Javascripts regex functions. Better to get something down and iterate.

      // We use the episodeRegex to find the episode details in the file name, and the use everything before that.
      let episodematch = fileName.match(episodeRegex)
      let tvShow = fileName.slice(0, episodematch['index'])
  
      // Remove any non alphanumeric characters
      let tvShowWithWhitespace = tvShow.replace(/[\W_]+/g, " ");
  
      return tvShowWithWhitespace.trim()
  
  }

exports.parseFilenames = parseFilenames
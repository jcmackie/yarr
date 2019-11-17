/* 
Return a object with details that have been parsed from the filename.
The structure looks like this:
{
  'TecchanHouse Terrace House Boys x Girls next door': {
    'episodeList': [
      { 
        'filename': '[TecchanHouse]_Terrace.House.Boys.x.Girls.next.door.S08E11.Week98.720p.mkv',
        'season': 8,
        'episode': 11
      }
      ...
    ]
  },
  ...
}
*/
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
      let parsedEpisode = {'season': episodeMatch[1].padStart(2,'0'), 'episode': episodeMatch[2].padStart(2,'0')}
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

exports.parseFilenames = parseFilenames
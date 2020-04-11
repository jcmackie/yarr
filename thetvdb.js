const JSSoup = require('jssoup').default
const r2 = require('r2')

function getMetadataFromSource (tvShowMetadataURL) {
  return new Promise((resolve, reject) => {
    // Some kind of weird bug with R2 and certain web pages:
    // https://github.com/mikeal/r2/issues/45
    r2(tvShowMetadataURL).response
      // First wait for the R2 reponse promise to resolve,
      .then(response => {
        // R2 response and helper functions just return promises, to be used with await
        // R2.response.text() is a promise that returns the response body. We return it so
        // that we can attach a new callback handler via a '.then()' call.
        return response.text()
      }, fail => {
        console.error(fail)
        reject(fail)
      })
      // and then take the response text and convert into JSSoup
      .then(responseText => {
        // console.log("My response text: " + responseText)
        const metaDataSoup = new JSSoup(responseText)
        const episodeInfo = processSoup(metaDataSoup)
        resolve(episodeInfo)
      })
  })
}

function processSoup (soup) {
  // We need to find all the listed episodes in the response text and return it as a dict of
  // episode ids and names
  // We are using a simple dict for now, but if we need to get more metadata per episode we
  // may have to use a list of dicts.
  const episodes = {}

  const episodeSoup = soup.findAll('span', undefined, /S(\d{1,2})E(\d{1,2})/)
  if (episodeSoup.length === 0) return null

  // Iterate through our matched SoupTags and extract the episodeId and name, add them to the dict.
  for (const episode of episodeSoup) {
    const episodeId = episode.text.trim()
    const episodeName = episode.nextElement.nextElement.text.trim()
    episodes[episodeId] = episodeName
  }

  // Now we pull the exact show name from the page
  const showName = soup.find('div', 'crumbs').nextElement.nextElement.nextElement.nextElement.nextElement.nextElement.nextElement.text.trim()
  // Add it to the dict under a special key
  episodes.showName = showName

  return episodes
}

exports.getMetadataFromSource = getMetadataFromSource

// JSSoup doesn't support regex matching on the text,
// so we are going to provide that functionality by overriding
// the function (if we can). Extremely experimental. We'll be copying the whole of the
// SoupStrainer class, and overwriting the findAll function of JSSoup
JSSoup.prototype.findAll = function (name=undefined, attrs=undefined, string=undefined) {
  var results = [];
  var strainer = new SoupStrainer2(name, attrs, string);

  var descendants = this.descendants;
  for (var i = 0; i < descendants.length; ++i) {
    if (descendants[i] instanceof JSSoup.__proto__) {
      var tag = strainer.match(descendants[i]);
      if (tag) {
        results.push(tag);
      }
    }
  }

  return results;
}

class SoupStrainer2 {
  constructor(name, attrs, string) {
    if (typeof attrs == 'string') {
      attrs = {class: [attrs]};
    } else if (Array.isArray(attrs)) {
      attrs = {class: attrs};
    } else if (attrs && attrs.class && typeof attrs.class == 'string') {
      attrs.class = [attrs.class];
    }
    if (attrs && attrs.class) {
      for (var i = 0; i < attrs.class.length; ++i) {
        attrs.class[i] = attrs.class[i].trim();
      }
    }
    this.name = name;
    this.attrs = attrs;
    this.string = string;
  }

  match(tag) {
    // match string
    if (this.name == undefined && this.attrs == undefined) {
      if (this.string && tag.string) {
        if (this._matchName(tag.string, this.string)) {
          return tag.string;
        } else {
          return null;
        }
      }
      return tag;
    }
    // match tag name
    var match = this._matchName(tag.name, this.name);
    if (!match) return null;
    // match string
    match = this._matchName(tag.string, this.string);
    if (!match) return null;
    // match attributes
    if (typeof this.attrs == 'object') {
      if (!this._isEmptyObject(this.attrs)) {
        var props = Object.getOwnPropertyNames(this.attrs);
        var found = false;
        for (var i = 0; i < props.length; ++i) {
          if (props[i] in tag.attrs && this._matchAttrs(props[i], tag.attrs[props[i]], this.attrs[props[i]])) {
            found = true;
            break;
          }
        }
        if (!found) return null;
      }
    }
    return tag;
  }

  _matchName(tagItem, name) {
    // if name is undefined or empty, then we'll treat it as a wildcard and return true
    if (name == undefined || name == null) return true;
    // if tagItem is undefined or null, and name is not then we'll treat it as not matching
    if (tagItem == undefined || tagItem == null) return false;
    // if name is an array, then tag match any item in this array is a match.
    if (Array.isArray(name)) {
      for (var i = 0; i < name.length; ++i) {
        var match = this._matchName(tagItem, name[i]);
        if (match) return true;
      }
      return false;
    }
    // if name is a RegExp see if the tag item matches it
    if (name instanceof RegExp) {
      return tagItem.toString().match(name)
    }
    return tagItem == name;
  }

  _matchAttrs(name, candidateAttrs, attrs) {
    if (typeof candidateAttrs == 'string') {
      if (name == 'class') {
        candidateAttrs = candidateAttrs.replace(/\s\s+/g, ' ').trim().split(' ');
      } else {
        candidateAttrs = [candidateAttrs];
      }
    }
    if (typeof attrs == 'string') {
      attrs = [attrs];
    }
    for (var i = 0; i < attrs.length; ++i) {
      if (candidateAttrs.indexOf(attrs[i]) < 0)
        return false;
    }
    return true;
  }

  _isEmptyObject(obj) {
    return Object.keys(obj).length == 0;
  }
}
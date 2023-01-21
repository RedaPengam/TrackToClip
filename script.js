// -------------------- appli credentials --------------------

const CLIENT_ID = "5d19249ba10a493da4b918e3333e42a8";
const CLIENT_SECRET = "3d3ca65cf99b4368afd08881d5d243ca";

/** Function to get an authorization token for spotify api calls.
 * @returns {string} token - The authorization token.
 */
async function fetchToken() {
  
  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Authorization' : 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await result.json();
  return data.access_token;
};

// -------------------- api calls --------------------

/** Function to generate the playlist uri from its url.
 * @returns {string} uri - The playlist uri.
 */
function generateUri() {
  // entered playlist url
  var x = document.getElementById("input").value;
  // generate api endpoint
  TRACKS_URI = 'https://api.spotify.com/v1/playlists/' + x.split("/")[4] + '/tracks';

  return TRACKS_URI;
};

/** Function to fetch 100 tracks (Spotify api limitation) from a specified playlist uri.
 * @param {string} uri - The playlist uri.
 * @param {string} offset - The offset.
 * @returns {JSON} data - A maximum 100 tracks JSON object.
 */
async function fetchTracks(uri, offset) {

  const token = await fetchToken();

  const result = await fetch(uri + "?offset=" + offset, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  });

  const data = await result.json();
  return data.items;
};

// -------------------- other --------------------

/** Function to create a list of all track names using fecthTracks.
 * @param {string} uri - The playlist uri.
 * @returns {Array} array_tracksName - List of tracks name.
 */
async function listTracksName(uri) {

  // filter 1: create a list of all tracks data
  const array_tracksMeta = new Array();
  for (let offset = 0; offset < 1000; offset += 100) { // playlist limited to 1000 tracks
    const b = await fetchTracks(uri, offset);
    if(b.length != 0) {
      array_tracksMeta.push(b);
    }    
  }

  // filter2: create a list of only the 'track' objects
  const array_tracksOnly = new Array();
  for (let i = 0; i < array_tracksMeta.length; i++) {
    for (let j = 0; j < array_tracksMeta[i].length; j++) {
      array_tracksOnly.push(array_tracksMeta[i][j].track);
    }
  }

  // filter3: create a list of track names > "Artist1, Artist2 - Title"
  const array_tracksName = new Array();
  for (let i = 0; i < array_tracksOnly.length; i++) {
    // get artists names
    var artists = "";
    for (let j = 0; j < array_tracksOnly[i].artists.length; j++) {
      if (j == array_tracksOnly[i].artists.length - 1) {
        artists += array_tracksOnly[i].artists[j].name;
      } else {
        artists += array_tracksOnly[i].artists[j].name + ', ';
      } 
    }
    // get title name
    var title = array_tracksOnly[i].name;
    // merge both strings
    array_tracksName.push(artists + ' - ' + title);
  }

  // console.log("fectAllTracks");
  // console.log(array_tracksMeta);
  // console.log(array_tracksOnly);
  // console.log(array_tracksName);

  return array_tracksName;
};

/** Function to create a new li element inside the ul in HTML.
 * @param {string} string - The text to pass in li element.
 * @returns <li>string</li>
 */
function createLi(id, string) {
  const ul = document.getElementById('tracklist');
  const li = document.createElement('li');
  li.setAttribute('id', id.toString());
  li.setAttribute('type', 'track');
  li.setAttribute('onmousedown', "copyToClip('" + id.toString() + "')");
  li.innerHTML = string;
  ul.appendChild(li);
};

// -------------------- HTML handle --------------------

/** Function to handle the button clic.
 * 
 */
async function displayTracks() {
  // generate the playlist uri.
  const uri = generateUri();
  // create the track names list
  const array_tracksName = await listTracksName(uri);
  // display it in ul
  for (let i = 0; i < array_tracksName.length; i++) {
    createLi(i, array_tracksName[i]);
  }
};

/** Function to handle a li element clic.
 * 
 */
function copyToClip(id) {
  const text = document.getElementById(id).innerHTML;
  navigator.clipboard.writeText(text);
  alert('"' + text + '"' + "\n\nCopié dans le presse-papiers !");
};
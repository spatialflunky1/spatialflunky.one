// global
var name;

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function artistSelect(artist) {
    if (name=="ryan") {
        location.href = "Music/Albums?robot=ryan&artist="+artist;
    }
    else {
        location.href = "Music/Albums?artist="+artist;
    }
}

function listArtists(artists) {
    var table = document.getElementById('content');
    // Need to empty table here as the socket io likes to randomly reload causing duplicate entries to be shown
    table.innerHTML=""
    var row = table.insertRow();
    for (const artist of artists) {
        var data = row.insertCell();
        var artist_string = artist.replace(/_/g, " ");
        let btn = document.createElement("button");
        var music_url = "music";
        if (name=="ryan") {
            music_url="r_music";
        }
        btn.innerHTML = "<div><img id='cover' src='/static/"+music_url+"/"+artist+"/artist.png'><p>"+artist_string+"</p></div>"
        btn.id = "artist_button";
        btn.onclick = function() {artistSelect(artist)};
        data.appendChild(btn);
    }
}

$(document).ready(function() {
    var socket = io.connect(document.location.origin);
    socket.on('connect', function() {
        name = getParameterByName("robot");
        socket.send(['artists', name]);
    });
    socket.on('message', function(artists) {
        listArtists(artists);
        socket.disconnect();
    });
})

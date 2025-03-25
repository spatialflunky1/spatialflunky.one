var name;

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function albumSelect(artist, album) {
    if (name=="ryan") {
        location.href = "Songs?robot=ryan&artist="+artist+"&album="+album;
    }
    else {
        location.href = "Songs?artist="+artist+"&album="+album;
    }
}

function listAlbums(albums, artist) {
    var table = document.getElementById('content');
    // Need to empty table here as the socket io likes to randomly reload causing duplicate entries to be shown
    table.innerHTML=""
    var row = table.insertRow();
    for (const album of albums) {
        var data = row.insertCell()
        var album_string = album;
        for (let i = 0; i < album_string.length; i++) {
            if (album_string[i]=='_') {
                if (i<album_string.length && album_string[i+1]!='_') {
                    album_string = album_string.substring(0,i) + ' ' + album_string.substring(i+1, album_string.length);
                }
            }
        }
        // var album_string = album.replace(/_/g, " ")
        let btn = document.createElement("button");
        var music_url = "music";
        if (name=="ryan") {
            music_url = "r_music";
        }
        btn.innerHTML = "<div><img id='cover' src='/static/"+music_url+"/"+artist+"/"+album+"/album.png'><p>"+album_string+"</p></div>"
        btn.id = "album_button";
        btn.onclick = function() {albumSelect(artist, album)};
        data.appendChild(btn);
    }
}

$(document).ready(function() {
    var socket = io.connect(document.location.origin);
    var artist = getParameterByName('artist');
    socket.on('connect', function() {
        name = getParameterByName("robot");
        socket.send(['albums', artist, name]);
    });
    socket.on('message', function(albums) {
        listAlbums(albums, artist);
        socket.disconnect();
    });
})

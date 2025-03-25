// Global Variable
var buttonPaused = true;
var indicatorPressed = false;
var progressPressed = false;
var audioStream;
var globalVol = 1;

// Global song vars
var artist;
var album;
var songs;
var name;
var currentSong;

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function buttonPressUp() {
    var button = document.getElementById("playButton");
    if (buttonPaused && audioStream!=null) {
        audioStream.play();
        buttonPaused = false;
        button.src = "../../static/Assets/pause_unpressed.png";
    }
    else if (!buttonPaused && audioStream!=null) {
        audioStream.pause();
        buttonPaused = true; 
        button.src = "../../static/Assets/play_unpressed.png";
    }
    else if (audioStream == null && buttonPaused) {
        currentSong = 0;
        playSong();
        buttonPaused = false;
        button.src = "../../static/Assets/pause_unpressed.png";
    }
    else return;
}

function buttonPressDown() {
    var button = document.getElementById("playButton");
    if (!buttonPaused && audioStream!=null) button.src = "../../static/Assets/pause_pressed.png";
    else if (buttonPaused && audioStream!=null) button.src = "../../static/Assets/play_pressed.png";
    else if (audioStream == null && buttonPaused) button.src = "../../static/Assets/play_pressed.png";
    else return;
}

function indicatorUp() {
    if (indicatorPressed && audioStream != null) {
        var indicator = document.getElementById("indicator");
        var position = parseInt(indicator.style.left.substring(0,indicator.style.left.length-2))-115;
        var total = document.querySelector("#positionBar2").offsetWidth;
        var time = (audioStream.duration|0) * (position/total);
        audioStream.currentTime = time;
        indicator.src = "../../static/Assets/indicator_unpressed.png"
        indicatorPressed = false;
    }
}

function indicatorDown() {
    if (!indicatorPressed && audioStream != null) {
        var indicator = document.getElementById("indicator");
        indicator.src = "../../static/Assets/indicator_pressed.png"
        indicatorPressed = true;
    }
}

function updateVol() {
    var vol = document.getElementById("volume");
    globalVol = (parseInt(vol.value)/100);
    audioStream.volume = globalVol;
}

function playSong() {
    var minutes = songs[currentSong][1];
    var seconds = songs[currentSong][2];
    var song_name = songs[currentSong][0];
    
    console.log("playing track"+(currentSong+1)+".mp3");
    // Plays song
    var volume = document.getElementById("volume");
    volume.value = globalVol*100;
    volume.style.visibility = "visible";
    if (audioStream!=null) {
        audioStream.pause();
    }
    music_url = "music"
    if (name=="ryan") {
        music_url = "r_music"
    }
    audioStream = new Audio("../../static/"+music_url+"/"+artist+"/"+album+"/track"+(currentSong+1)+".mp3");
    audioStream.volume = globalVol;
    audioStream.play();
    // Switches button to pause
    var button = document.getElementById("playButton");
    button.src = "../../static/Assets/pause_unpressed.png"
    buttonPaused = false;
    // Sets song title
    var title = document.getElementById("songTitle");
    var position = document.getElementById("songPosition");
    var length = document.getElementById("songLength");
    title.innerHTML = song_name;
    position.innerHTML = "0:00";
    length.innerHTML = minutes+":"+seconds;
}

function listSongs(songList, newArtist, newAlbum) {
    var table = document.getElementById('songList');
    // Need to clear table here as the socket io likes to randomly reload causing duplicate entries to be shown
    table.innerHTML="<tr><th>#</th><th>Song</th><th>Artist</th><th>Album</th><th>Length</th></tr>"
    songs = songList;
    artist = newArtist;
    album = newAlbum;

    for (var i=0; i<songs.length; i++) {
        var row = table.insertRow();
        row.className = "song";
        row.id = "song"+i;
        var numCell = row.insertCell();
        numCell.id="cell"
        var songCell = row.insertCell();
        songCell.id="cell"
        var artistCell = row.insertCell();
        artistCell.id="cell"
        var albumCell = row.insertCell();
        albumCell.id="cell"
        var lengthCell = row.insertCell();
        lengthCell.id="cell"

        numCell.innerHTML = i+1;
        numCell.style.width = "10px";
        songCell.innerHTML = songs[i][0].replace(/_/g, " ");
        artistCell.innerHTML = artist.replace(/_/g, " ");
        albumCell.innerHTML = album.replace(/_/g, " ");
        lengthCell.innerHTML = songs[i][1]+":"+songs[i][2];
        row.onclick = function(i) {
            return function() {
                currentSong = i;
                playSong();
            };
        }(i);
    }
}

function timeUpdate() {
    if (!indicatorPressed && audioStream!=null) {
        if (audioStream.currentTime == audioStream.duration && audioStream.paused) {
            if (currentSong+1 == songs.length) {
                // End of album
                audioStream.pause();
                audioStream = null;
                var title = document.getElementById("songTitle");
                var position = document.getElementById("songPosition");
                var length = document.getElementById("songLength");
                title.innerHTML = "";
                position.innerHTML = "";
                length.innerHTML = "";
                var volume = document.getElementById("volume");
                volume.style.visibility = "hidden";
                var button = document.getElementById("playButton");
                button.src = "../../static/Assets/play_unpressed.png";
            }
            else {
                // Next song
                currentSong++;
                playSong();
            }
        }
        else {
            var currentTime = audioStream.currentTime | 0;
            var minutes = (currentTime/60) | 0;
            var seconds = (currentTime%60) | 0;
            if (seconds < 10) seconds = "0" + seconds;
            document.getElementById("songPosition").innerHTML = minutes+":"+seconds;
            var progress = document.querySelector("#positionBar2");
            var indicator = document.getElementById("indicator");
            var totalTime = audioStream.duration | 0;
            var position = ((currentTime/totalTime*progress.offsetWidth)|0)+115;
            indicator.style.left = position+"px";
        }
    }
}

document.onmousemove = handleMouseMove;
function handleMouseMove(event) {
    if (indicatorPressed && !tooFar) {
        // Use event.pageX / event.pageY here
        var progress = document.querySelector("#positionBar2");
        var timeIndicator = document.getElementById("songPosition");
        var tooFar = (event.pageX < 120) | (event.pageX > 120+progress.offsetWidth);

        var indicator = document.getElementById("indicator");
        indicator.style.left = event.pageX-5+"px";
        var time = (((event.pageX-120)/progress.offsetWidth)*audioStream.duration) | 0;
        var minutes = (time/60) | 0;
        var seconds = (time%60) | 0;
        if (seconds < 10) seconds = "0" + seconds;
        timeIndicator.innerHTML = minutes+":"+seconds
        //console.log(event.pageX);
    }
}

document.onmouseup = function(event){
    if (indicatorPressed) indicatorUp()
};



$(document).ready(function() {
    var socket = io.connect(document.location.origin);
    artist = getParameterByName('artist');
    album = getParameterByName('album');
    name = getParameterByName('robot');

    // Avoid unsafe inline errors:
    var startButton = document.getElementById("playButton");
    startButton.onmousedown = function(){buttonPressDown()};
    startButton.onmouseup = function(){buttonPressUp()};
    var posBar = document.getElementById("positionBar2");
    posBar.onmousedown = function(){indicatorDown()};
    var indicator = document.getElementById("indicator");
    indicator.onmousedown = function(){indicatorDown()};
    var volSlider = document.getElementById("volume");
    volSlider.oninput = function(){updateVol()};

    setInterval(timeUpdate, 1000);
    socket.on('connect', function() {
        socket.send(['songs', artist, album, name]);
    });
    socket.on('message', function(songs) {
        listSongs(songs, artist, album);
        socket.disconnect();
    });
})

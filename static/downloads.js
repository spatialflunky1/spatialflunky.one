function addDownloads(repos) {
    var table = document.getElementById("sidebar_table");
    table.innerHTML = "";
    for (const repo of repos) {
        var data = table.insertRow().insertCell();
        data.innerHTML = "<a href='https://github.com/spatialflunky1/"+repo+"'>"+repo+"</a>";
    }
    var newtable = []
    table.style.height = "75%";
    // <tr><td><a href=""></a><a></a></td></tr>
}

$(document).ready(function() {
    var socket = io.connect(document.location.origin);
    socket.on('connect', function() {
        socket.send(["downloads"])
    });
    socket.on('message', function(repos) {
        addDownloads(repos);
    });
})

from flask import Flask, render_template
from flask_socketio import SocketIO, send
from flask_minify import Minify
import os
import github
from mutagen import mp3, File

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
Minify(app=app, html=True, js=True, cssless=True)

@app.route("/", methods=["GET", "POST"])
def home():
    return render_template("index.html")

@app.route("/Downloads", methods=["GET", "POST"])
def downloads():
    return render_template("downloads.html")

@app.route("/Blog", methods=["GET", "POST"])
def blog():
    return render_template("blog.html")

@app.route("/Music", methods=["GET", "POST"])
def music():
    return render_template("music.html")

@app.route("/Music/Albums", methods=["GET", "POST"])
def albums():
    return render_template("albums.html")

@app.route("/Music/Songs", methods=["GET", "POST"])
def songs():
    return render_template("songs.html")

@socketio.on('message', namespace="/")
def handle_connection(page):
    print(page)
    if page[0]=="artists":
        if len(page)>1 and page[1]=="ryan":
            content = os.listdir("static/r_music")
        else:
            content = os.listdir("static/music")
        send(content)
    elif page[0]=="albums":
        if len(page)>2 and page[2]=="ryan":
            content = os.listdir("static/r_music/"+page[1])
        else:
            content = os.listdir("static/music/"+page[1])
        content.remove("artist.png")
        send(content)
    elif page[0]=="songs":
        if (len(page)>3 and page[3]=="ryan"):
            songs = [i for i in os.listdir("static/r_music/"+page[1]+"/"+page[2]) if "mp3" in i]
            contents = []
            for filename in songs:
                content = []
                song = mp3.MP3("static/r_music/"+page[1]+"/"+page[2]+"/"+filename)
                minutes = str(int(song.info.length) // 60)
                seconds = int(song.info.length) % 60
                if (seconds < 10):
                    seconds = "0"+str(seconds)
                else:
                    seconds = str(seconds)
                content.append(str(song["TIT2"]))
                content.append(minutes)
                content.append(seconds)
                contents.append(content)
            send(contents)
        else:
            content = open("static/music/"+page[1]+"/"+page[2]+"/song_list.csv", "r").read().split('\n')
            for i in range(len(content)):
                content[i] = content[i].split(",")
            if [''] in content:
                content.remove([''])
            send(content)
    elif page[0]=="downloads":
        send(github.get_repo_names())

if __name__ == '__main__':
    socketio.run(app, host="192.168.68.119", port=500, debug=True)

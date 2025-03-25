import requests

url_single_repo = "https://api.github.com/repos/spatialflunky1/"
url_repos = "https://api.github.com/users/spatialflunky1/repos"

token_file = open("git.key", "r")
token = token_file.readline()
token_file.close()

def get_repos():
    response = requests.get(url_repos)
    repos = response.json()
    return repos

def get_repo_names():
    repos = get_repos()
    repo_names = [i["name"] for i in repos]
    return repo_names

def get_releases():
    repos = get_repos()
    releases_urls = [i["releases_url"] for i in repos]
    response = requests.get(releases_urls[4].replace("{/id}",""))
    releases = response.json()
    return response

if __name__ == "__main__":
    for i in get_releases():
        print(i)

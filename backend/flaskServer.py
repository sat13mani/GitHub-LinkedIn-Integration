from flask import Flask, request
from flask_cors import CORS
from Database import create_connection, execute_query, execute_read_query
import json
import requests
import linkedin_api


app = Flask(__name__)
CORS(app)
api = linkedin_api.Linkedin('sat13mani@gmail.com', 'dustbin@123')


@app.route("/username/<name>")
def getProfile(name):
    print(name)
    profile = api.get_profile(name)
    return profile


@app.route("/link")
def data():
    code = request.args.get('code')
    state = request.args.get('state')
    client_id = 'Iv1.6a23a85edae7274a'
    url = 'https://github.com/login/oauth/access_token'

    data = {
        'client_id': client_id,
        'code': code,
        'state': state,
        'client_secret': '26b6d03d65baf64c4ce8b8de5c95fbab3f749b8b'
    }

    headers = {
        'Accept': 'application/json'
    }

    res = requests.post(url=url, data=data, headers=headers)
    token = (res.json())['access_token']

    if token is not None:
        query = f"UPDATE User SET hasLinked=1 WHERE username='{state}'"
        conn = create_connection('test.db')
        execute_query(conn, query)
        headers = {
            'Authorization': 'token ' + token
        }
        url = 'https://api.github.com/user'
        res = requests.get(url=url, headers=headers)
        print('github id', (res.json())['login'])
        git_id = (res.json())['login']

        values = (state, git_id)
        query = f"INSERT INTO Link (l_username, g_username) VALUES {values}"
        execute_query(conn, query)

        values = (git_id, token)
        query = f"INSERT INTO Token (g_username, token) VALUES {values}"
        execute_query(conn, query)

        return f"your GitHub id - {str(git_id)} is linked to your profile, Login again"

    return str(res.json())


@app.route('/signup', methods=['POST'])
def createNewUser():
    conn = create_connection('test.db')
    rqst_data = request.data
    user_data = json.loads(rqst_data.decode('utf-8'))

    # check whether user exists before
    username = str(user_data['username'])
    query = f"SELECT username FROM User WHERE username='{username}'"
    result = execute_read_query(conn, query)

    response = None
    if (len(result) > 0):
        response = "User already exists"
    else:
        values = (user_data['username'], user_data['password'], 0)
        query = f"INSERT INTO User (username, password, hasLinked) VALUES {values}"
        execute_query(conn, query)
        response = "User added successfully"

    response = json.dumps(response)
    return response


@app.route('/login', methods=['POST'])
def checkLogin():
    conn = create_connection('test.db')
    rqst_data = request.data
    user_data = json.loads(rqst_data.decode('utf-8'))

    # currently using password in plain text form instead of hash
    username = str(user_data['username'])
    password = str(user_data['password'])
    query = f"SELECT * FROM User WHERE username='{username}'"
    result = execute_read_query(conn, query)

    response = None
    if (len(result) == 1 and password == (result[0])[1]):
        response = str((result[0])[2])
    else:
        response = "Login failed"

    return response


@app.route('/check/<usr>')
def checkLink(usr):
    conn = create_connection('test.db')
    query = f"SELECT * FROM Link WHERE l_username='{usr}'"
    result = execute_read_query(conn, query)
    print("result", result)
    if (result is not None and (len(result) == 1)):
        print(result)
        git_id = (result[0])[1]
        return git_id
    else:
        # 0 indicates not found
        return "0"


@app.route('/getGitData/<username>')
def sendData(username):
    # fetch access token for current username
    conn = create_connection('test.db')
    query = f"SELECT token from Token WHERE g_username='{username}'"
    result = execute_read_query(conn, query)

    token = (result[0])[0]
    headers = {
        'Authorization': 'token ' + token
    }

    response = {}
    usrUrl = "https://api.github.com/user"
    res = requests.get(url=usrUrl, headers=headers)
    res = res.json()
    response['id'] = res['login']
    response['followers'] = res['followers']
    response['public_repos'] = res['public_repos']

    repoUrl = f"https://api.github.com/users/{username}/repos"
    res = requests.get(url=repoUrl, headers=headers)
    repo_data = res.json()

    lst = []
    stars = 0
    languages = {}
    for repo in repo_data:
        obj = {}
        obj['name'] = repo['name']
        obj['stars'] = repo['stargazers_count']
        obj['language'] = repo['language']
        obj['description'] = repo['description']
        obj['forks_count'] = repo['forks_count']

        key = repo['language']
        if key is not None:
            key = str(repo['language'])
            if key in languages:
                languages[key] += 1
            else:
                languages[key] = 0
        stars += obj['stars']
        lst.append(obj)

    func = lambda item: item[1]
    languages_list = [k for k, v in sorted(languages.items(), key=func)]
    languages_list.reverse()
    response['stars'] = stars
    response['repo_data'] = lst
    response['languages'] = languages_list

    return response


if __name__ == "__main__":
    app.run(debug=True, port=5000)

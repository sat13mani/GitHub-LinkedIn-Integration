import json
import requests
from sqlite3 import Error

from flask import Flask, request
from flask_cors import CORS
import linkedin_api

from Database import create_connection, execute_query, execute_read_query


app = Flask(__name__)
app.config['ENV'] = 'development'
CORS(app)


@app.route('/username/<username>')
def getLinkedInProfile(username):
    """
    Fetches LinkedIn profile for given username
    
    Args:
    username (str): LinkedIn username

    Returns:
    profile: LinkedIn profile data in json format
    """
    
    # initialize Linkedin object
    api = linkedin_api.Linkedin('sat13mani@gmail.com', 'dustbin@123')
    profile = api.get_profile(username)
    return profile


@app.route("/link")
def link():
    """
    Links GitHub account using OAuth 2.0

    Returns:
    res: Link text with Javascript to close browser window
         (if linking successful)
         fail message
         (if linking fails)
    """

    # Get authorization code and state from request URL
    code = request.args.get('code')
    state = request.args.get('state')
    client_id = 'Iv1.6a23a85edae7274a'
    url = 'https://github.com/login/oauth/access_token'

    # prepare data for access token POST request
    # client secret should be set up as environment variable
    # using client secret directly for ease
    data = {
        'client_id': client_id,
        'code': code,
        'state': state,
        'client_secret': '26b6d03d65baf64c4ce8b8de5c95fbab3f749b8b'
    }

    # include headers as written in API documentation
    headers = {'Accept': 'application/json'}

    # make POST request and get token
    res = requests.post(url=url, data=data, headers=headers)
    token = (res.json())['access_token']

    # If valid token is returned, Update it corresponding to user in DB
    if token is not None:
        conn = create_connection('test.db')
        query = f"UPDATE User SET hasLinked=1 WHERE username='{state}';"
        execute_query(conn, query)
        headers = {'Authorization': 'token ' + token}
        url = 'https://api.github.com/user'
        res = requests.get(url=url, headers=headers)
        g_username = (res.json())['login']

        # Save GitHub username corresponding to LinkedIn username
        values = (state, g_username)
        query = f"INSERT INTO Link (l_username, g_username) VALUES {values};"
        execute_query(conn, query)

        # Save user's access token in DB
        values = (g_username, token)
        query = f"INSERT INTO Token (g_username, token) VALUES {values};"
        execute_query(conn, query)

        # cache data while Linking to support filtering
        cache(g_username)

        return '<a href="#" onclick="window.close();">ID Linked, Click to close, Please Login again</a>'

    # return response message if linking fails
    return "Linking failed"


@app.route('/signup', methods=['POST'])
def registerUser():
    """
    Registers new user on the website,
    POST request is used for getting user's details

    Returns:
    res: response whether signup successful or failed
    """

    conn = create_connection('test.db')
    rqst_data = request.data
    user_data = json.loads(rqst_data.decode('utf-8'))

    # check whether user exists before
    username = str(user_data['username'])
    query = f"SELECT username FROM User WHERE username='{username}';"
    result = execute_read_query(conn, query)

    res = None

    # If User already exists
    if (len(result) > 0):
        res = "User already exists"
    
    # If user doesn't exist signup
    else:
        # save details of user in DB
        values = (user_data['username'], user_data['password'], 0)
        query = f"INSERT INTO User (username, password, hasLinked) \
                VALUES {values};"
        execute_query(conn, query)
        res = "User added successfully"

    res = json.dumps(res)
    return res


@app.route('/login', methods=['POST'])
def checkLogin():
    """
    Verify Login credentials for signing into website

    Returns:
    res: GitHub Link status as 0 / 1 (if successful)
       : Fail message (if failed)
    """

    conn = create_connection('test.db')
    rqst_data = request.data
    user_data = json.loads(rqst_data.decode('utf-8'))

    # store username and password in DB
    # password should be stored in form hash not plain text
    # plaintext format is used here
    username = str(user_data['username'])
    password = str(user_data['password'])
    query = f"SELECT * FROM User WHERE username='{username}';"
    result = execute_read_query(conn, query)

    response = None

    # if username and password match, success
    if (len(result) == 1 and password == (result[0])[1]):
        # sending GitHub account linking status
        response = str((result[0])[2])
    else:
        response = "Login failed"
    return response


@app.route('/check/<username>')
def checkLink(username):
    """
    Checks if linkedin user has linked GitHub account

    Args:
    username (str): linkedin username

    Returns:
    res: if linked GitHub username else "0"
    """

    conn = create_connection('test.db')
    query = f"SELECT * FROM Link WHERE l_username='{username}';"
    result = execute_read_query(conn, query)

    response = ""

    # if linked, response would be GitHub username
    if (result is not None and (len(result) == 1)):
        g_username = (result[0])[1]
        response = g_username
    else:
        # 0 indicates not found
        response = "0"
    return response


@app.route('/getGitData/<username>')
def getGitData(username):
    """
    Fetches GitHub data for GitHub username

    Args:
    username (str): GitHub username

    Returns:
    response: GitHub data for username
    """

    # fetch access token for given username
    conn = create_connection('test.db')
    query = f"SELECT token from Token WHERE g_username='{username}';"
    result = execute_read_query(conn, query)
    token = (result[0])[0]
    
    # appropriate header for GitHub API '/usr' endpoint
    headers = {'Authorization': f"token {token}"}
    usrUrl = "https://api.github.com/user"
    res = requests.get(url=usrUrl, headers=headers)
    res = res.json()

    # fetch required details from response
    response = {}
    response['id'] = res['login']
    response['followers'] = res['followers']
    response['public_repos'] = res['public_repos']

    # request for fetching repository details
    repoUrl = f"https://api.github.com/users/{username}/repos"
    res = requests.get(url=repoUrl, headers=headers)
    repo_data = res.json()

    # store all repository details in lst
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

    # sort all repos on number of stars
    def func(item): return item[1]
    languages_list = [k for k, v in sorted(languages.items(), key=func)]
    languages_list.reverse()
    response['stars'] = stars
    response['repo_data'] = lst
    response['languages'] = languages_list

    return response


@app.route('/getRepoList/<username>')
def getRepoList(username):
    """
    Fetches all repository details in ascending order

    Args:
    username (str): GitHub username

    Returns:
    response: repo list in json format
    """

    conn = create_connection('test.db')
    query = f"SELECT token from Token WHERE g_username='{username}';"
    result = execute_read_query(conn, query)
    token = (result[0])[0]
    headers = {
        'Accept': 'application/vnd.github.nebula-preview+json',
        'Authorization': f"token {token}"
    }
    url = "https://api.github.com/user/repos?direction=asc"
    res = requests.get(url=url, headers=headers)
    response = {}
    response['repo_list'] = res.json()
    return response


@app.route('/getCommits/<username>/<repo_name>')
def getCommits(username, repo_name):
    """
    Fetches all commits for a user's repo

    Args:
    username (str): GitHub username
    repo_name (str): repository name

    Returns:
    response: list of commits with required details
    """

    # fetch user's access token
    conn = create_connection('test.db')
    query = f"SELECT token from Token WHERE g_username='{username}';"
    result = execute_read_query(conn, query)
    token = (result[0])[0]
    
    # GET request for fetching commits
    # endpoint - '/repos/:username/:repo_name/commits'
    headers = {
        'Authorization': f"token {token}",
        'author': username,
    }
    url = f"https://api.github.com/repos/{username}/{repo_name}/commits"
    res = requests.get(url=url, headers=headers)
    res = res.json()

    # Store all commits in a list
    lst = []
    for i in res:
        commit = i['commit']
        
        # Custom object for details required
        # details required at frontend 
        obj = {}
        obj['message'] = commit['message']
        obj['url'] = commit['url']
        lst.append(obj)

    response = {}
    response['data'] = lst
    return response


@app.route('/highlight/commit', methods=['POST'])
def highlight():
    """
    Higlights commits for given username
    Details fetched by POST request

    Returns:
    value: "successful" or "failed"
    """

    # fetch details from POST request
    conn = create_connection('test.db')
    rqst_data = request.data
    user_data = json.loads(rqst_data.decode('utf-8'))
    g_username = user_data['g_username']
    rank = user_data['rank']
    repo = user_data['repo']
    sha = user_data['commit']
    description = user_data['description']

    # GET /repos/:owner/:repo/git/commits/:commit_sha
    query = f"SELECT token from Token WHERE g_username='{g_username}';"
    result = execute_read_query(conn, query)
    token = (result[0])[0]
    headers = {'Authorization': f"token {token}"}
    url = f"http://api.github.com/repos/{g_username}/{repo}/commits/{sha}"
    res = requests.get(url=url, headers=headers)
    res = res.json()

    response = {}

    # check if commit exists else return failed
    try:
        author = (res['author'])['login']
        message = res['commit']['message']
    except:
        response = "failed"
        return response
    
    # if commit is made by g_username, update in DB
    if (author == g_username):
        query = f"UPDATE Commits \
                SET g_username=?, rank=?, repo=?, message=?,\
                sha=?, description=? \
                WHERE g_username='{g_username}' AND rank={rank};"
        try:
            values = (g_username, rank, repo, message, sha, description)
            cur = conn.cursor()
            cur.execute(query, values)
            conn.commit()
            response = "successful"
        except Error as e:
            print(f"the db error {e} occurred")
            response = "failed"
        finally:
            conn.close()
    return response


@app.route('/get/commit/<username>')
def checkContribution(username):
    """
    Checks commits highlighted by a user

    Args:
    username: GitHub username of the user

    Returns:
    response: Contributions of the user (empty if nothing added)
    """

    # fetch all highlighted commits
    conn = create_connection('test.db')
    query = f"SELECT * FROM Commits WHERE g_username='{username}';"
    result = execute_read_query(conn, query)

    # condition for creating 3 entries for first time
    condition = True
    for item in result:
        condition = condition and (item[2] != "None")
        break

    response = {}

    # if commits exist, send it in list
    if len(result) > 0 and condition:
        lst = [item[1:] for item in result]
        response['contributions'] = lst
    
    # if commits doesn't exist, send empty list
    elif len(result) > 0:
        response['contributions'] = []
    
    # first time user, make 3 entries in the table
    # return empty list for this case
    else:
        for i in range(1, 4):
            values = (username, i, "None", "None", "None", "None")
            query = f"INSERT INTO Commits \
                    (g_username, rank, repo, message, sha, description) \
                    VALUES {values};"
            execute_query(conn, query)
        response['contributions'] = []
    return response


@app.route('/search/<keyword>')
def searchKeyword(keyword):
    '''
    Gives the LinkedIn search for given keyword.
    Limit imposed on no. of results - 10.
    
    Args:
    keyword (str): keyword to be searched on Linkedin

    Returns:
    response: Linkedin search results for keyword
    '''

    params = {'keywords': str(keyword)}
    api = linkedin_api.Linkedin('sat13mani@gmail.com', 'dustbin@123')
    result = api.search(params, limit=10)

    response = {}
    response['result'] = result
    return response


@app.route('/highlight/issue', methods=['POST'])
def highlightIssues():
    """
    Highlights issues by a user
    Receives data by POST request

    Returns:
    value: "successful" or "failed"
    """

    # fetch data from POST request
    conn = create_connection('test.db')
    rqst_data = request.data
    user_data = json.loads(rqst_data.decode('utf-8'))
    rank = user_data['rank']
    repo_fullname = user_data['repo_fullname']
    issue_number = user_data['issue_number']
    description = user_data['description']
    g_username = user_data['g_username']

    # fetch access token for the GitHub username
    # GET /repos/:user/:repo_name/issues/:issue_number
    query = f"SELECT token from Token WHERE g_username='{g_username}';"
    result = execute_read_query(conn, query)
    token = (result[0])[0]
    headers = {'Authorization': f"token {token}", }
    base_url = "https://api.github.com"
    path = f"/repos/{repo_fullname}/issues/{issue_number}"
    url = base_url + path
    res = requests.get(url=url, headers=headers)
    r = res.json()

    # check if issue exists or not
    try:
        title, body, login = r['title'], r['body'], (r['user'])['login']
    except:
        return "Wrong details"

    # if issue is not related to user, error
    if login != g_username:
        return "Issue is not created by user"

    # save highlighted issue into the DB
    query = f"UPDATE Issue \
            SET repo_fullname=?, issue_number=?, \
            description=?, title=?, body=? \
            WHERE g_username='{g_username}' AND rank={rank};"
    try:
        values = (repo_fullname, issue_number, description, title, body)
        cur = conn.cursor()
        cur.execute(query, values)
        conn.commit()
        return "successful"
    except Error as err:
        print(f"Error at /highlight/issue - {err}")
        return "failed"
    finally:
        conn.close()


@app.route('/get/issues/<username>')
def getIssues(username):
    """
    Fetches highlighted for given user

    Args:
    username (str): GitHub username
    
    Returns:
    response: highlighted issues
    """
    
    # fetch all highlighted issue for given username
    conn = create_connection('test.db')
    query = f"SELECT * FROM Issue WHERE g_username='{username}';"
    result = execute_read_query(conn, query)
    
    # condition for first time users
    condition = True
    for item in result:
        condition = condition and (item[2] != "None")
        break

    response = {}

    # check for appropriate conditions and return issues
    if len(result) > 0 and condition:
        response['issues'] = result
    elif len(result) > 0:
        response['issues'] = []
    else:
        for i in range(1, 4):
            values = (username, i, "None", "None", "None", "None", "None")
            query = f"INSERT INTO Issue \
                    (g_username, rank, repo_fullname, issue_number,\
                    description, title, body) \
                    VALUES {values};"
            execute_query(conn, query)
        response['issues'] = []
    return response


@app.route('/highlight/pr', methods=['POST'])
def highlightPr():
    """
    Highlight Pull requests by a user
    data fetched by POST request

    Returns:
    value: "succesful" or "failed"
    """

    # fetch data from POST request
    conn = create_connection('test.db')
    rqst_data = request.data
    user_data = json.loads(rqst_data.decode('utf-8'))
    g_username = user_data['g_username']
    rank = user_data['rank']
    repo_fullname = user_data['repo_fullname']
    pull_number = user_data['pull_number']
    description = user_data['description']

    # fetch access token
    # GET /repos/:owner/:repo_number/pulls/:pull_number
    query = f"SELECT token from Token WHERE g_username='{g_username}';"
    result = execute_read_query(conn, query)
    token = (result[0])[0]
    headers = {'Authorization': f"token {token}", }
    base_url = "https://api.github.com"
    path = f"/repos/{repo_fullname}/pulls/{pull_number}"
    url = base_url + path
    res = requests.get(url=url, headers=headers)
    res = res.json()

    # check if pull request exists or not
    try:
        title, body, login = res['title'], res['body'], (res['user'])['login']
    except:
        return "Wrong details"

    # check if PR is actually created by the user
    if login != g_username:
        print("issue is not created by user")
        return "Issue is not created by user"

    query = f"UPDATE PR \
            SET repo_fullname=?, pull_number=?,\
            description=?, title=?, body=? \
            WHERE g_username='{g_username}' AND rank={rank};"
    try:
        values = (repo_fullname, pull_number, description, title, body)
        print(values)
        cur = conn.cursor()
        cur.execute(query, values)
        conn.commit()
        print("query executed successfully")
        return "successful"
    except Error as err:
        print(f"Error at /highlight/pr - {err}")
        return "failed"
    finally:
        conn.close()


@app.route('/get/pr/<username>')
def getPr(username):
    """
    Fetches highlighted pull requests for the user

    Args:
    username (str): GitHub username

    Returns:
    response: List of highlighted Pull requests
    """

    # fetch highlighted PRs from the DB
    conn = create_connection('test.db')
    query = f"SELECT * FROM PR WHERE g_username='{username}';"
    result = execute_read_query(conn, query)
    response = {}
    
    # condition for the first time user
    condition = True
    for item in result:
        condition = condition and (item[2] != "None")
        break

    # check appropriate condition and return list of PRs
    if len(result) > 0 and condition:
        response['pr'] = result
    elif len(result) > 0:
        response['pr'] = []
    else:
        for i in range(1, 4):
            values = (username, i, "None", "None", "None", "None", "None")
            query = f"INSERT INTO PR \
                    (g_username, rank, repo_fullname,\
                    pull_number, description, title, body) \
                    VALUES {values};"
            execute_query(conn, query)
        response['pr'] = []
    return response


@app.route('/payload', methods=['POST'])
def getData():
    """
    Updates cache data after notification from webhooks
    """

    # fetch header to identify event type
    conn = create_connection('test.db')
    rqst_data = request.get_json(force=True)
    headers = request.headers
    event_type = headers['X-GitHub-Event']

    # if event type is star, update stars
    if event_type == 'star':
        g_username = rqst_data['repository']['owner']['login']
        
        # if starred, increase value else decrease
        if rqst_data['starred_at'] is not None:
            query = f"UPDATE GitHub SET stars = stars + 1 \
                    WHERE g_username='{g_username}';"
            execute_query(conn, query)
        else:
            query = f"UPDATE GitHub SET stars = stars - 1 \
                    WHERE g_username='{g_username}';"
            execute_query(conn, query)
    
    # if event type is repository, update repo data
    elif event_type == 'repository':
        g_username = rqst_data['repository']['owner']['login']
        action = action = rqst_data['action']
        if action == 'created':
            query = f"UPDATE GitHub SET repos = repos + 1 \
                    WHERE g_username='{g_username}';"
            execute_query(conn, query)
        else:
            query = f"UPDATE GitHub SET repos = repos - 1 \
                    WHERE g_username='{g_username}';"
            execute_query(conn, query)
    
    # updating language cache on each push
    elif event_type == 'push':
        g_username = rqst_data['repository']['owner']['login']
        language = rqst_data['language']
        query = f"SELECT language FROM Language \
                WHERE g_username = '{g_username}';"
        usr_lang = execute_read_query(conn, query)
        lang_lst = usr_lang[0][0][1:-1]
        lang_lst = (lang_lst).split(', ')
        lang_lst = [i[1:-1] for i in lang_lst]

        if language not in lang_lst:
            lang_lst.append(language)
            lang_lst = str(lang_lst)
            query = f"UPDATE Language SET language = {lang_lst} \
                    WHERE g_username='{g_username}';"
            execute_query(conn, query)

    return "received"


def cache(g_username):
    """
    Caches GitHub data for a user in the local DB

    Args:
    g_username (str):  GitHub username

    Returns:
    git_data: cached GitHub data
    """

    conn = create_connection('test.db')
    git_data = getGitData(g_username)
    
    # cache profile details
    stars = git_data['stars']
    repos = git_data['public_repos']
    followers = git_data['followers']
    values = (g_username, repos, followers, stars)
    query = f"INSERT INTO GitHub (g_username, repos, followers, stars) \
            VALUES {values};"
    execute_query(conn, query)

    # store language list explicitly in text format
    language_lst = str(git_data['languages'])
    values = (g_username, language_lst)
    query = f"INSERT INTO Language (g_username, language) VALUES {values}"
    execute_query(conn, query)
    return git_data


@app.route('/filter', methods=['POST'])
def filter():
    """
    Sends list of GitHub username satisfying given filters
    filters received by POST request

    Returns:
    response: list of GitHub users satisfying the constraint
    """

    # fetch data from POST request
    filter_data = request.get_json(force=True)
    usr_lst = (filter_data['list'])
    usr_lst.append('temp')
    repo_filter = filter_data['repo_filter']
    stars_filter = filter_data['stars_filter']
    language = filter_data['languages']
    language = language.split(';')

    # set default values for filters
    if repo_filter == "":
        repo_filter = ">0"

    if stars_filter == "":
        stars_filter = ">0"

    # convert to condition for WHERE secion of query
    repos = getOp(repo_filter, "repos")
    stars = getOp(stars_filter, "stars")

    # filter users on the basis of stars and repos
    usr_lst = tuple(i for i in usr_lst)
    conn = create_connection('test.db')
    query = f"SELECT g_username FROM GitHub WHERE g_username in {usr_lst}"
    query += f" AND {repos} AND {stars}"

    # filter users on language filter
    lst = execute_read_query(conn, query)
    rslt = []
    for item in lst:
        rslt.append(item[0])

    # if language filter exists then filter, else pass
    if (len(language) > 0):
        filtered_rslt = []
        for i in rslt:
            query = f"SELECT language FROM Language WHERE g_username = '{i}';"
            usr_lang = execute_read_query(conn, query)
            if (len(usr_lang) > 0):
                print(usr_lang[0][0][1:-1])
                res = usr_lang[0][0][1:-1]
                res = (res).split(', ')
                res = [i[1:-1] for i in res]
                print("res ", res)
                cond = True
                for lang in language:
                    print("lang", lang)
                    if lang in res:
                        cond = cond and True
                    elif lang == '':
                        continue
                    else:
                        cond = cond and False
                    print("cons", cond)
                if cond:
                    filtered_rslt.append(i)
    else:
        filtered_rslt = rslt

    response = {}
    response['result'] = filtered_rslt
    return response

def getOp(filter, name):
    """
    Converts string into conition for WHERE section of DB query

    Args:
    filter: filter value
    name: filter name

    Returns:
    condition: condition in the required format
    """
    condition = f"{name} "
    if 'gt' in filter:
        condition += ">"
    elif 'lt' in filter:
        condition += "<"
    elif 'eq' in filter:
        condition += "="
    condition += filter[2:]

    if 'bt' in filter:
        condition = f"{name} "
        value = filter.split(' ')
        low = value[0][2:]
        high = value[1]
        condition += f"BETWEEN {low} AND {high}"
    return condition


if __name__ == "__main__":
    app.run(debug=True, port=5000)

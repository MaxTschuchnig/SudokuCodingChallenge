import requests  # Must be installed first using pip or conda
import json

# you get a jwt from successful registration, followed by login. After logging in you will find under cookies, the auth cookie. Copy and paste its content in here
jwt = ""
ip = 'https://IP'

def solve(current_sudoku):  # TODO: add solution here
    # represents logic to solve the sudoku
    solved = current_sudoku
    return solved


def make_request():
    # get singular sudoku to solve
    response = requests.get(
        ip + '/sudoku',  # Replace with the correct URL
        headers={'Cookie': f'auth={jwt}'},
        verify=False
    )
    # parse the data
    data = response.json()

    # generate a solution and put it into the right format
    solution = {
        'data': [
            {
                'id': int(data['id']),
                'template': solve(data['masked'])  # add solution
            }
        ]
    }

    # send back the solution
    post_response = requests.post(
        ip + '/validate-sudokus',  # Replace with the correct URL
        headers={
            'Cookie': f'auth={jwt}',
            'Content-Type': 'application/json'
        },
        data=json.dumps(solution),
        verify=False
    )

    post_data = post_response.json()
    print(post_data)

make_request()

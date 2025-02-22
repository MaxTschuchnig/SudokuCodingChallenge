# requests library must be installed first
import requests
import json

import time
import random


# you get a jwt from successful registration, followed by login. After logging in you will find under cookies, the auth cookie. Copy and paste its content in here
jwt = ""
ip = ''

def solve(current_sudoku):
    # represents logic to solve the sudoku
    solved = current_sudoku
    return solved


def make_request():
    try:
        choice = bool(random.getrandbits(1))

        # get singular sudoku to solve
        response = requests.get(
            ip + '/sudoku',  # Replace with the correct URL
            headers={'Cookie': f'auth={jwt}'},
            verify=False
        )
        # parse the data
        data = response.json()

        # generate a solution and put it into the right format
        if choice:
            solution = {
                'data': [
                    {
                        'id': int(data['id']),
                        'template': data['template'] # add solution
                    }
                ]
            }
        else:
            solution = {
                'data': [
                    {
                        'id': int(data['id']),
                        'template': solve(data['masked'])  # add solution
                    }
                ]
            }

        print(f'submitting: {int(data["id"])}')

        # send back the solution
        post_response = requests.post(
            ip + '/validate-sudokus',  # Replace with the correct URL
            headers={
                'Cookie': f'auth={jwt}',
                'Content-Type': 'application/json',
            },
            data=json.dumps(solution),
            verify=False
        )

        post_data = post_response.json()
        print(post_data)
    except Exception as e:
        print(e)

interval = 15
while True:
    make_request()
    time.sleep(interval)

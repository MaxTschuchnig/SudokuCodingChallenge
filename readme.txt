If you run locally, 
	- mongodb must be running
	- compiled sudokugenerator must be running (or enough sudokus must be generated)
	- webserver must be running and pointing to sudokugenerator /data folder
To run on a server, additonally you need to
	- have an IP
	- use nginx as a reverse proxy as shown in ngingx
	- (Optionally) have a landing page
	- (Optionally) have https
	- (Optionally) Have a dns name
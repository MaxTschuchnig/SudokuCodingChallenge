Congratulations to team BGL for winning the CC2025!

to start run
	- npm i
	- node server.js
in helpers/init.js
	- you can define the teams in admin/admin.html
		- currently, this page is only accessible using admins. you can change that by copying admin.html to the public folder
		- Then you generate a new user
		- check the users pw hash in mongodb
		- and generate a new user in init.js with the, set by you, email and hash, and potentiall, you can set the admin flag of this user. Remember the password! This user is now an admin
		- copy admin.html back to admin folder
		- now generate new users in the same way from the admin.html page. Remember, you can find the hash in the mongodb
	- you can find some demo users in init.js
in helpers/sudokuloader.js
	- !!!YOU HAVE TO SET datafolder PATH TO YOUR GENERATED SUDOKUS!!!!
# webdev-demo-campgrounds

## Overview
This is a demonstration website that lists fictional campgrounds created by
registered users. Each campsite contains a picture, reviews, and price per
night. Users may edit/delete their comments or campground entries.

## Demonstrated Technologies
The campsite application demonstrates elements of the following technologies:

- Front end development with HTML/JS/CSS.
  * Styling with Bootstrap, Google Fonts, and FontAwesome.
- Backend development with MongoDB, Node, and Express.
  * Persistence of campground images, comments, and user IDs with MongoDB.
- MVC design: MongoDB models, express routes, and JavaScript template files
  are managed and developed separately.
- RESTful routes implemented with Express.
  * GET, POST, PUT, DELETE operations implemented for campground and
    campground comment entities. 
- Utilization of popular third-party NPM packages
  * large size JPEGs were dithered using a one-time gulpfile run.
  * database state can be saved as JSON and reloaded. The multi-part process of
    loading data into MongoDB is handled with async.
  * nice looking timestamps using Moment
  * nodemon keeps web-site running after files change during development.
  * banner messages are done using Flash.
- User regisration & authentication using passport
  * custom written middleware prevents users from editing/deleting 
    campgrounds/comments that are not theirs.
- Single page operations for editing and deleting campground comments
  * jQuery + AJAX features make editing or deleting campground comments smooth
    and visually appealing.
- multiple-branch development in GIT (this repo) to implement certain features of web-site.

## Dependencies
It is assumed that the NPM package *nodemon* is globally installed in your system.

The NoSQL database *MongoDB, version 3.4.2 or higher* must be installed on your system.

## Setup
This section pertains to steps you make take after cloning the repo but before doing the rest of the installation steps. 

The file ./config/env/yelpcamp.config.js contains setting to control the following items:
  - the name of the mongoDB database
  - the default URL and port that express will listen to

## Installation

```
git clone https://github.com/ceevee87/webdev-demo-campgrounds.git 
cd webdev-demo-campgrounds/yelpcamp
npm install
mongod &
node ./public/init/initdb.js
nodemon --config nodemon.json app.js
```
## Running the application
The default landing page for the application is http://localhost:3000/. 

## Development Environment
This code is developed using VS Code on top of Firefox 52.0.2 (64-bit). 
The operating system is Ubuntu 16.04 LTS.

No testing was done on Windows based machines or alternate browsers.

## Items left to do
- Implement form validation
- Implement general validation using Jasmine

# webdev-demo-campgrounds

This is a demonstration website that lists fictional campgrounds, with pictures, reviews,
price per night, by users (with real user ids).

The campsite demonstrates elements of the following technologies:

- Backend development with MongoDB, Node, and Express.
- Styling with CSS, Bootstrap, Google Fonts, and FontAwesome icons.
- Persistence of campground images, comments, and user IDs with MongoDB.
- MVC design: MongoDB models, express routes, and JavaScript template files
  are managed and developed separately.
- RESTful routes implemented with Express for campgrounds and comments entities.
- Utilization of popular third-party NPM packages such as async, moment, nodemon, gulp.
  - large size JPEGs were dithered using a one-time gulpfile run.
  - database state can be saved as JSON and reloaded. The multi-part process of
    loading is handled with async.
  - nice looking timestamps using Moment
  - nodemon keeps web-site running after files change during development.
- User regisration & authentication using passport plus custom written middleware
  to prevent users from editing/deleting campgrounds/comments that are not theirs.
- jQuery + AJAX features for certain REST operations such as editing or deleting
  a campground comment. 
- Flash messages.
- One to many MongoDB associations.
- multiple-branch development in GIT (this repo) to implement certain features of web-site.



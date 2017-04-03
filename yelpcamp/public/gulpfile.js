var gulp = require('gulp');
var imageResize = require('gulp-image-resize');
 
gulp.task('default', function () {
  gulp.src('img/*.jpg')
    .pipe(imageResize({
      width : 695,
      height : 400,
      crop : true,
      upscale : false
    }))
    .pipe(gulp.dest('dist'));
});

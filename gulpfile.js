var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({ pattern: ['gulp-*'] });

gulp.task('compass', function() {
  gulp.src(['src/scss/letdoocss.scss'])
    .pipe(plugins.plumber())
    .pipe(plugins.compass({
      config_file: 'config.rb',
      css: 'src/styles/',
      sass: 'src/scss/'
    }))
    .on('error', function(error) {
      console.log(error);
      this.emit('end');
    })
    .pipe(gulp.dest('src/styles'));
});

gulp.task('copy', ['compass'], function () {
  return gulp.src('src/styles/letdoocss.css')
  .pipe(gulp.dest('dist/'));
});

gulp.task('build', ['copy'], function () {
  return gulp.src('src/styles/letdoocss.css')
  .pipe(require('gulp-minify-css')())
  .pipe(plugins.rename("letdoocss.min.css"))
  .pipe(gulp.dest('dist/'));
});

gulp.task('clean', require('del').bind(null, ['tmp/', 'dist']));

gulp.task('connect', function () {
  var serveStatic = require('serve-static');

  var app = require('connect')();
  app.use(require('connect-livereload')({port: 35729}));
  app.use(serveStatic('src'));

  require('http').createServer(app).listen(8000)
  .on('listening', function () {
    console.log('Started connect web server on http://localhost:8000');
  });
});

gulp.task('watch-serve', ['connect'], function () {
  plugins.livereload.listen();

  gulp.watch([
    'src/**/*.html',
    "src/styles/**/*.css"
    ]).on('change', plugins.livereload.changed);

  gulp.watch(['src/scss/**/*.scss', 'src/scss/**/*.sass'], ['compass']);
});

gulp.task('serve', ['watch-serve'], function(){
  require('opn')('http://localhost:8000', 'firefox');
});
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({ pattern: ['gulp-*'] });

gulp.task('sass', function () {
  return gulp.src('src/scss/**/*.scss')
  .pipe(plugins.plumber())
  .pipe(plugins.sass())
  .pipe(gulp.dest('src/styles/'));
});

gulp.task('compass', function() {
  gulp.src(['src/scss/**/*.scss', 'src/scss/**/*.sass'])
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

gulp.task('styles', ['compass'], function () {
  return gulp.src('src/styles/**/*.css')
  .pipe(require('gulp-minify-css')())
  .pipe(gulp.dest('dist/style.min'));
});

gulp.task('clean', require('del').bind(null, ['tmp', 'dist']));

gulp.task('inject', function () {
  var sources = gulp.src(['src/styles/**/*.css', '!src/styles/letdoocss.css'], {read: false});
  return gulp.src('./src/index.html')
  .pipe(plugins.inject(sources, {relative: true}))
  .pipe(gulp.dest('./src'));
});

gulp.task('watch-common', ['inject', 'compass'], function () {
  gulp.watch(['src/scss/**/*.scss', 'src/scss/**/*.sass'], ['compass']);
  gulp.watch(['src/**/*.js', 'src/styles/**/*.css'], ['inject']);
});

/*********************************************/
//Web Server
gulp.task('connect', function () {
  var serveStatic = require('serve-static');

  var app = require('connect')()
  app.use(require('connect-livereload')({port: 35729}))
  app.use(serveStatic('src'));

  require('http').createServer(app).listen(9000)
  .on('listening', function () {
    console.log('Started connect web server on http://localhost:9000');
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
  require('opn')('http://localhost:9000', 'firefox');
});

gulp.task('serve:dist', ['default'], function () {
  initServe('dist');
  require('opn')('http://localhost:9000');
});

gulp.task('build', ['appBuild', 'images', 'extras'], function () {
  return gulp.src('dist/**/*').pipe(plugins.size({title: 'build', gzip: false}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});


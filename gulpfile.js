'use strict';

var gulp         = require('gulp');
var gm           = require('gulp-gm');
var notifier     = require('node-notifier');
var statik       = require('statik');
var merge        = require('merge-stream');
var rename       = require('gulp-rename');
var browserify   = require('browserify');
var watchify     = require('watchify');
var source       = require('vinyl-source-stream');
var aliasify     = require('aliasify')
var concat       = require('gulp-concat');
var buffer       = require('gulp-buffer');
var notifier     = require('stream-notifier');
var sourcemaps   = require('gulp-sourcemaps');
var uglify       = require('gulp-uglify');
var minifyHtml   = require('gulp-minify-html');
var minifyCss    = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var gutil        = require('gulp-util');
var runSequence  = require('run-sequence');
var minimist     = require('minimist');
var options      = minimist(process.argv);

var env = options.env || 'development';

gulp.task('images', function() {
  var n = notifier('images');

  var player = gulp
               .src('src/images/player.png')
               .pipe(rename('player-2.png'))
               .pipe(gm(function(gmfile) {
                 return gmfile.fill('rgba(0, 0, 0, 1)').opaque('rgba(255, 255, 255, 1)');
               }));

  return merge(player, gulp.src('src/images/**/*'))
         .pipe(gm(function(gmfile) {
           return gmfile.sample('200%');
         }))
         .on('error', n.error)
         .pipe(gulp.dest('dist/images'))
         .on('end', n.end);
});

gulp.task('styles', function() {
  var n = notifier('styles');

  return gulp.src('src/main.css')
         .pipe(env === 'production' ? minifyCss() : gutil.noop())
         .pipe(autoprefixer())
         .pipe(rename('bundle.css'))
         .pipe(gulp.dest('dist'))
         .on('end', n.end);
});

gulp.task('vendor', function() {
  return gulp
         .src('bower_components/phaser/build/custom/phaser-arcade-physics.js')
         .pipe(env === 'production' ? uglify() : gutil.noop())
         .pipe(rename('phaser.js'))
         .pipe(gulp.dest('dist'));
});

gulp.task('sounds', function() {
  var n = notifier('sounds');

  return gulp
         .src('src/sounds/**/*')
         .pipe(gulp.dest('dist/sounds'))
         .on('end', n.end);
});

gulp.task('html', function() {
  var n = notifier('html');

  return gulp
         .src('src/index.html')
         .pipe(env === 'production' ? minifyHtml() : gutil.noop())
         .pipe(gulp.dest('dist'))
         .on('end', n.end);
});

gulp.task('browserify', function() {
  var bundler = browserify('./src/main')
  var bundle = compileBundle(bundler);

  return bundle();
});

gulp.task('serve', function() {
  statik({ port: 3000, root: './dist' });
});

gulp.task('build', ['vendor', 'images', 'styles', 'browserify', 'sounds', 'html']);
gulp.task('default', function(cb) {
  runSequence('build', 'serve', 'watch', cb);
});

gulp.task('watch', ['watchify'], function() {
  gulp.watch('src/images/**/*', ['images']);
  gulp.watch('src/sounds/**/*', ['sounds']);
  gulp.watch('src/**/*.css', ['styles']);
  gulp.watch('src/index.html', ['html']);
});

gulp.task('watchify', function() {
  var opts = watchify.args;
  opts.debug = true;

  var bundler = watchify(browserify('./src/main', opts));
  var bundle = compileBundle(bundler)
  bundler.on('update', bundle);

  return bundle();
});

function compileBundle(bundler) {
  return function() {
    var n = notifier('browserify');

    return bundler
           .bundle()
           .on('error', n.error)
           .pipe(source('bundle.js'))
           .pipe(env === 'production' ? buffer() : gutil.noop())
           .pipe(env === 'production' ? uglify() : gutil.noop())
           .pipe(gulp.dest('dist'))
           .on('end', n.end);
  };
}
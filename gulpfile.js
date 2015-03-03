'use strict';

var gulp           = require('gulp');
var gm             = require('gulp-gm');
var notifier       = require('node-notifier');
var statik         = require('statik');
var merge          = require('merge-stream');
var rename         = require('gulp-rename');
var browserify     = require('browserify');
var watchify       = require('watchify');
var source         = require('vinyl-source-stream');
var aliasify       = require('aliasify')
var concat         = require('gulp-concat');
var buffer         = require('gulp-buffer');
var streamNotifier = require('stream-notifier');
var sourcemaps     = require('gulp-sourcemaps');

gulp.task('images', function() {
  var n = streamNotifier('images');

  var player = gulp
    .src('src/images/player.png')
    .pipe(rename('player-2.png'))
    .pipe(gm(function(gmfile) {
      return gmfile.fill('rgba(0, 0, 0, 1)').opaque('rgba(255, 255, 255, 1)');
    }));

  return merge(player, gulp
    .src('src/images/**/*'))
    .pipe(gm(function(gmfile) {
      return gmfile.sample('200%');
    }))
    .on('error', n.error)
    .pipe(gulp.dest('dist/images'))
    .on('end', n.end);
});

gulp.task('vendor', function() {
  return gulp
    .src('bower_components/phaser/build/phaser.js')
    .pipe(gulp.dest('dist'));
});

gulp.task('sounds', function() {
  var n = streamNotifier('sounds');

  return gulp
    .src('src/sounds/**/*')
    .pipe(gulp.dest('dist/sounds'))
    .on('end', n.end);
});

gulp.task('html', function() {
  var n = streamNotifier('html');

  return gulp
    .src('src/index.html')
    .pipe(gulp.dest('dist'))
    .on('end', n.end);
});

gulp.task('serve', function() {
  statik({ port: 3000, root: './dist' });
});

gulp.task('watch', ['watchify'], function() {
  gulp.watch('src/images/**/*', ['images']);
  gulp.watch('src/sounds/**/*', ['sounds']);
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

gulp.task('build', ['vendor', 'images', 'sounds', 'html']);
gulp.task('default', ['build', 'serve', 'watch']);

function compileBundle(bundler) {
  return function() {
    var n = streamNotifier('browserify');

    return bundler
      .bundle()
      .on('error', n.error)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('dist'))
      .on('end', n.end);
  };
}
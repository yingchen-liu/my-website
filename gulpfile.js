const gulp = require('gulp');
const gls = require('gulp-live-server');
const watch = require('gulp-watch');
const rename = require("gulp-rename");
const less = require('gulp-less');

const vendor = {
  js: [
    './bower_components/jquery/dist/jquery.js',
    './semantic/dist/semantic.js'
  ],
  css: [
    './semantic/dist/semantic.css'
  ]
};

gulp.task('vendor:node', () => {
  gulp
    .src('./markdown-core-node/index.bundle.js')
    .pipe(rename({
      basename: 'mdc'      
    }))
    .pipe(gulp.dest('./includes'));
});

gulp.task('vendor:js', () => {
  gulp
    .src(vendor.js)
    .pipe(gulp.dest('./public/js'));
});

gulp.task('vendor:css', () => {
  gulp
    .src(vendor.css)
    .pipe(gulp.dest('./public/css'));
  gulp
    .src('./semantic/dist/themes/default/**/*.*')
    .pipe(gulp.dest('./public/css/themes/default'));
  gulp
    .src('./bower_components/markdown-plus/dist/index.bundle.css')
    .pipe(rename({
      basename: 'mdc'
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('less', () => {
  return gulp.src('./public/css/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('./public/css'));
});

gulp.task('server', () => {
  const server = gls.new('./bin/run');
  server.start();

  watch([
    './app.js', 
    './routes/**/*.js',
    './includes/**/*.js'
  ], (file) => {
    setTimeout(() => {
      server.start.bind(server)();
      server.notify.apply(server, [file]);
      console.log('server reloaded');
    }, 4000);
  });

  watch(vendor.css, ['vendor:css']);
  watch(vendor.js, ['vendor:js']);

  watch(['./public/**/*.{css,js,png,gif,jpg}'], (file) => {
    server.notify.apply(server, [file]);
    console.log('server reloaded');
  });
  watch(['./views/**/*.ejs'], (file) => {
    server.notify.apply(server, [file]);
    console.log('server reloaded');
  });
});

gulp.task('default', ['vendor:node', 'vendor:css', 'vendor:js', 'server']);

gulp.task('build', ['vendor:node', 'vendor:css', 'vendor:js', 'less']);
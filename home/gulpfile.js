const gulp = require('gulp');
const gls = require('gulp-live-server');
const watch = require('gulp-watch');
const rename = require("gulp-rename");
const less = require('gulp-less');
const concat = require('gulp-concat');

const vendor = {
  js: [
    './bower_components/jquery/dist/jquery.js',
    '../semantic/dist/semantic.js',
    './bower_components/js-md5/src/md5.js'
  ],
  jsAdmin: [
    './bower_components/jquery-ui/ui/scroll-parent.js',
    './bower_components/jquery-ui/ui/widget.js',
    // './bower_components/jquery-ui/ui/widgets/datepicker.js',
    './bower_components/jquery-ui/ui/widgets/mouse.js',
    './bower_components/jquery-ui/ui/widgets/sortable.js',
  ],
  jsMarkdown: [
    './bower_components/editor.md/lib/marked.min.js',
    './bower_components/editor.md/lib/prettify.min.js',
    './bower_components/editor.md/lib/raphael.min.js',
    './bower_components/editor.md/lib/underscore.min.js',
    './bower_components/editor.md/lib/sequence-diagram.min.js',
    './bower_components/editor.md/lib/flowchart.min.js',
    './bower_components/editor.md/lib/jquery.flowchart.min.js',
    './bower_components/editor.md/editormd.js',
    './bower_components/editor.md/languages/en.js',
  ],
  css: [
    '../semantic/dist/semantic.css',
    './bower_components/editor.md/css/editormd.css'
  ],
  cssAdmin: [
    './bower_components/jquery-ui/themes/base/all.css',
  ]
};

gulp.task('vendor:js', () => {
  gulp
    .src(vendor.js)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('./public/js'));
  gulp
    .src(vendor.jsAdmin)
    .pipe(concat('admin.js'))
    .pipe(gulp.dest('./public/js'));
  gulp
    .src(vendor.jsMarkdown)
    .pipe(concat('markdown.js'))
    .pipe(gulp.dest('./public/js'));
  gulp
    .src('./bower_components/editor.md/lib/**/*.*')
    .pipe(gulp.dest('./public/js/markdown/lib'));
  gulp
    .src('./bower_components/editor.md/plugins/**/*.*')
    .pipe(gulp.dest('./public/js/markdown/plugins'));
});

gulp.task('vendor:css', () => {
  gulp
    .src(vendor.css)
    .pipe(concat('vendor.css'))
    .pipe(gulp.dest('./public/css'));
  gulp
    .src('../semantic/dist/themes/default/**/*.*')
    .pipe(gulp.dest('./public/css/themes/default'));
  gulp
    .src(vendor.cssAdmin)
    .pipe(concat('admin.css'))
    .pipe(gulp.dest('./public/css'));
  gulp
    .src('./bower_components/jquery-ui/themes/base/images/*.*')
    .pipe(gulp.dest('./public/css/images'));
  gulp
    .src('./bower_components/editor.md/images/*.*')
    .pipe(gulp.dest('./public/images'));
  gulp
    .src('./bower_components/editor.md/fonts/*.*')
    .pipe(gulp.dest('./public/fonts'));
  gulp
    .src('./bower_components/emoji-cheat-sheet.com/public/graphics/emojis/*.*')
    .pipe(gulp.dest('./public/emojis'));
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
  ], function () {
    server.start.bind(server);
    console.log('server reloaded');
  });

  watch(vendor.css, ['vendor:css']);
  watch(vendor.js, ['vendor:js']);

  watch(['./public/**/*.{css,js,png,gif,jpg}'], function (file) {
    server.notify.apply(server, [file]);
    console.log('server reloaded');
  });
  watch(['./views/**/*.ejs'], function (file) {
    server.notify.apply(server, [file]);
    console.log('server reloaded');
  });
});

gulp.task('default', ['vendor:css', 'vendor:js', 'server']);

gulp.task('build', ['vendor:css', 'vendor:js', 'less']);
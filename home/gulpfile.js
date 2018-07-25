const gulp = require('gulp');
const gls = require('gulp-live-server');
const watch = require('gulp-watch');
const rename = require("gulp-rename");
const less = require('gulp-less');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const pump = require('pump');
const cleanCSS = require('gulp-clean-css');

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
    './bower_components/dropzone/dist/dropzone.js'
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
    // './bower_components/jquery-ui/themes/base/*.css',
    './bower_components/dropzone/dist/dropzone.css'
  ]
};

const uglifyOptions = {
  sourceMap: true
};

gulp.task('vendor:js', (cb) => {
  pump([
    gulp.src(vendor.js),
    concat('vendor.js'),
    uglify(uglifyOptions),
    gulp.dest('./public/js')
  ], cb);
});

gulp.task('vendor:jsAdmin', (cb) => {
  pump([
    gulp.src(vendor.jsAdmin),
    concat('admin.js'),
    uglify(uglifyOptions),
    gulp.dest('./public/js')
  ], cb);
});

gulp.task('vendor:jsMarkdown', (cb) => {
  pump([
    gulp.src(vendor.jsMarkdown),
    concat('markdown.js'),
    uglify(uglifyOptions),
    gulp.dest('./public/js')
  ], cb);
});

gulp.task('vendor:jsEditor', (cb) => {
  gulp
    .src([
      './bower_components/editor.md/lib/**/*.*',
      '!./bower_components/editor.md/lib/**/*.js'
    ])
    .pipe(gulp.dest('./public/js/markdown/lib'));
  pump([
    gulp.src('./bower_components/editor.md/lib/**/*.js'),
    uglify(uglifyOptions),
    gulp.dest('./public/js/markdown/lib')
  ], cb);
});

gulp.task('vendor:jsEditorPlugin', (cb) => {
  gulp
  .src([
    './bower_components/editor.md/plugins/**/*.*',
    '!./bower_components/editor.md/plugins/**/*.js'
  ])
  .pipe(gulp.dest('./public/js/markdown/lib'));
  pump([
    gulp.src('./bower_components/editor.md/plugins/**/*.js'),
    uglify(uglifyOptions),
    gulp.dest('./public/js/markdown/plugins')
  ], cb);
});

gulp.task('js', (cb) => {
  pump([
    gulp.src('./static/js/**/*.*'),
    uglify(uglifyOptions),
    gulp.dest('./public/js')
  ], cb);
});

gulp.task('vendor:css', () => {
  gulp
    .src(vendor.css)
    .pipe(concat('vendor.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./public/css'));
  gulp
    .src('../semantic/dist/themes/default/**/*.*')
    .pipe(gulp.dest('./public/css/themes/default'));
  gulp
    .src(vendor.cssAdmin)
    .pipe(concat('admin.css'))
    .pipe(cleanCSS())
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
  return gulp.src('./static/css/**/*.less')
    .pipe(less())
    // .pipe(concat('all.css'))
    .pipe(cleanCSS())
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

  watch('./static/js/**/*.*', ['js']);
  watch('./static/css/**/*.*', ['less']);

  watch(['./public/**/*.{css,js,png,gif,jpg}'], function (file) {
    server.notify.apply(server, [file]);
    // console.log('server reloaded');
  });
  watch(['./views/**/*.ejs'], function (file) {
    server.notify.apply(server, [file]);
    // console.log('server reloaded');
  });
});

gulp.task('default', ['vendor:css', 'vendor:js', 'vendor:jsAdmin', 'vendor:jsMarkdown', 'vendor:jsEditor', 'vendor:jsEditorPlugin', 'js', 'less', 'server']);

gulp.task('build', ['vendor:css', 'vendor:js', 'vendor:jsAdmin', 'vendor:jsMarkdown', 'vendor:jsEditor', 'vendor:jsEditorPlugin', 'js', 'less']);
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var filter = require('gulp-filter');
var del = require('del');
var pkg = require('./package.json');

var SRC_DIR = "src";
var RES_DIR = "res";
var OUT_DIR = "app";

var HTML_SRC = SRC_DIR + "/html";
var SASS_SRC = SRC_DIR + "/sass";
var JS_SRC = SRC_DIR + "/js";

var HTML_OUT = OUT_DIR;
var CSS_OUT = OUT_DIR + "/css";
var JS_OUT = OUT_DIR + "/js";
var VENDOR_OUT = OUT_DIR + "/vendor";
var RES_OUT = OUT_DIR + "/" + RES_DIR

// Set the banner content
var banner = ['/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
    ' */\n',
    ''
].join('');

// Compile SASS files from /sass into /css
gulp.task('sass', function() {
    return gulp.src(SASS_SRC + '/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest(CSS_OUT))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify compiled CSS
gulp.task('minify-css', ['sass'], function() {
    return gulp.src(CSS_OUT + '/freelancer.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(CSS_OUT))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src(JS_SRC + '/freelancer.js')
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(JS_OUT))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', function() {
    gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest(VENDOR_OUT + '/bootstrap'))

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest(VENDOR_OUT + '/jquery'))

    gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/**/*.map',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest(VENDOR_OUT + '/font-awesome'))

    gulp.src(HTML_SRC + "/**/*.html")
        .pipe(gulp.dest(HTML_OUT));

    gulp.src(JS_SRC + "/**/*.js")
        .pipe(gulp.dest(JS_OUT));

    gulp.src(RES_DIR + "/**/*")
        .pipe(gulp.dest(OUT_DIR));
})

// Run everything
gulp.task('default', ['sass', 'minify-css', 'minify-js', 'copy']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: OUT_DIR
    })
})

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'sass', 'minify-css', 'minify-js'], function () {
    gulp.watch(SASS_SRC + '/**/*.scss', ['sass']);
    gulp.watch(CSS_OUT + '/**/*.css', ['minify-css']);
    gulp.watch(JS_OUT + '/**/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch(HTML_SRC + '/**/*.html', function (f) {
        gulp.src(f.path)
            .pipe(gulp.dest(HTML_OUT))
            .pipe(browserSync.reload({
                stream: true
            }))
    });
    gulp.watch(JS_SRC + '/**/*.js', function (f) {
        gulp.src(f.path)
            .pipe(gulp.dest(JS_OUT))
            .pipe(browserSync.reload({
                stream: true
            }))
    });
});

gulp.task('clean', [], function () {
    del([OUT_DIR + "/**/*"]).then(paths => {
        if (paths.length > 0) 
            console.log('Removed:')
        paths.forEach(function (v) { console.log("\t", v)})
    });
})

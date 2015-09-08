// grab gulp packages
var gulp = require('gulp');

var plugins = require('gulp-load-plugins')();

var browserSync = require('browser-sync').create();

var bases = {
    dev: './dev/',
    dist: './dist/'
};

var paths = {
    js: ['js/*.js', '!js/*.min.js'],
    jsAll: ['js/*.js'],
    styles: ['styles/*.less', 'styles/**/*.less', 'styles/*.css'],
    html: ['*.html', '**/*.html'],
    images: ['images/**/*.png', 'images/**/*.jpg'],
    extras: ['crossdomain.xml', 'humans.txt', 'manifest.appcache', 'robots.txt', 'favicon.ico']
};

gulp.task('default', ['watch']);

// configure jshint task
gulp.task('jshint', function() {
    return gulp.src(paths.js, {
            cwd: bases.dev
        })
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'));
});

// Delete the dist directory
gulp.task('clean', function() {
    return gulp.src(bases.dist)
        .pipe(plugins.clean());
});

// minify js and concatenate into one file
gulp.task('build-js', ['clean'], function() {
    return gulp.src(paths.jsAll, {
            cwd: bases.dev,
            base: bases.dev + 'js/'

        }) // process original source
        .pipe(plugins.sourcemaps.init())
        // only uglify if gulp is ran with '--type production'
        .pipe(plugins.util.env.type === 'production' ? plugins.uglify() : plugins.util.noop())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(bases.dist + 'js/'))
        .pipe(browserSync.stream());

});

// compile less map to modified source
gulp.task('build-css', ['clean'], function() {
    return gulp.src(paths.styles, {
            cwd: bases.dev,
            base: bases.dev + 'styles/'

        }) // process original source
        .pipe(plugins.less())
        .pipe((gulp.dest(bases.dist + 'css/')))
        .pipe(browserSync.stream({
            match: bases.dist + 'css/**/*.css'
        }));
});

// Imagemin images and ouput them in dist
gulp.task('imagemin', ['clean'], function() {
    gulp.src(paths.images, {
            cwd: bases.dev,
            base: bases.dev + 'images/'
        })
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(bases.dist + 'images/'))
        .pipe(browserSync.stream());

});

// copy html files
gulp.task('copy-html', ['clean'], function() {
    return gulp.src(paths.html, {
            cwd: bases.dev,
            base: bases.dev
        })
        .pipe(gulp.dest(bases.dist))
        .pipe(browserSync.stream());
});

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', ['clean', 'jshint', 'build-js', 'build-css', 'imagemin', 'copy-html'], function() {

    // static server
    browserSync.init({
        server: {
            baseDir: "./dist/"
        }
    });

    gulp.watch(bases.dev + paths.js, ['jshint', 'build-js']);
    gulp.watch(bases.dev + paths.styles, ['build-css']);
    gulp.watch(bases.dev + paths.images, ['imagemin']);
    gulp.watch(bases.dev + paths.html, ['copy-html']);
})

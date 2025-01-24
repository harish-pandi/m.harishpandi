// Node.js Packages / Dependencies
const gulp          = require('gulp');
const sass          = require('gulp-sass')(require('sass'));
const uglify        = require('gulp-uglify');
const rename        = require('gulp-rename');
const concat        = require('gulp-concat');
const cleanCSS      = require('gulp-clean-css');
const imageMin      = require('gulp-imagemin');
const pngQuint      = require('imagemin-pngquant');
const browserSync   = require('browser-sync').create();
const autoprefixer  = require('gulp-autoprefixer');
const jpgRecompress = require('imagemin-jpeg-recompress');
const clean         = require('gulp-clean');

// Paths
var paths = {
    root: { 
        www: './public_html'
    },
    src: {
        root:       'public_html/assets',
        html:       'public_html/**/*.html',
        css:        'public_html/assets/css/*.css',
        js:         'public_html/assets/js/*.js',
        vendors:    'public_html/assets/vendors/**/*.*',
        imgs:       'public_html/assets/imgs/**/*.+(png|jpg|gif|svg)',
        scss:       'public_html/assets/scss/**/*.scss'
    },
    dist: {
        root:       'public_html/dist',
        css:        'public_html/dist/css',
        js:         'public_html/dist/js',
        imgs:       'public_html/dist/imgs',
        vendors:    'public_html/dist/vendors'
    }
}

// Compile SCSS
gulp.task('sass', function() {
    return gulp.src(paths.src.scss)
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)) 
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.src.root + '/css'))
    .pipe(browserSync.stream());
});

// Minify + Combine CSS
gulp.task('css', function() {
    return gulp.src(paths.src.css)
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(concat('harish pandi.css'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist.css))
});

// Minify + Combine JS
gulp.task('js', function() {
    return gulp.src(paths.src.js)
    .pipe(uglify())
    .pipe(concat('harish pandi.js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.dist.js))
    .pipe(browserSync.stream());
});

// Compress (JPEG, PNG, GIF, SVG, JPG)
gulp.task('img', function(){
    return gulp.src(paths.src.imgs)
    .pipe(imageMin([
        imageMin.gifsicle({ interlaced: true }),
        imageMin.jpegtran({ progressive: true }),
        imageMin.optipng(),
        imageMin.svgo(),
        pngQuint({ quality: [0.6, 0.8] }), // Adjust quality range
        jpgRecompress({ quality: 'medium' })
    ]))
    .pipe(gulp.dest(paths.dist.imgs));
});

// Copy vendors to dist
gulp.task('vendors', function(){
    return gulp.src(paths.src.vendors)
    .pipe(gulp.dest(paths.dist.vendors))
});

// Clean dist
gulp.task('clean', function () {
    return gulp.src(paths.dist.root, { read: false, allowEmpty: true })
        .pipe(clean());
});

// Prepare all assets for production
gulp.task('build', gulp.series('clean', 'sass', 'css', 'js', 'vendors', 'img'));

// Watch (SASS, CSS, JS, and HTML) reload browser on change
gulp.task('watch', function() {
    browserSync.init({
        server: {
            baseDir: paths.root.www
        } 
    });
    gulp.watch(paths.src.scss, gulp.series('sass'));
    gulp.watch(paths.src.js).on('change', browserSync.reload);
    gulp.watch(paths.src.html).on('change', browserSync.reload);
});

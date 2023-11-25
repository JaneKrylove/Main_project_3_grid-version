const { src, dest, watch, parallel } = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
// const concat = require("gulp-concat");
const scss = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const include = require("gulp-include");
const browserSync = require("browser-sync");
const del = require("del");
const uglify = require("gulp-uglify-es").default;

function buildStyles() {
  return (
    src("./src/styles/style.scss")
      .pipe(sourcemaps.init())
      // склей все и присвой название
      // .pipe(concat("style.css"))
      // переведи все из scss в css
      .pipe(scss())
      // добавь вендорные префиксы
      .pipe(
        autoprefixer({
          cascade: false,
          overrideBrowserslist: ["last 2 versions"],
        })
      )
      .pipe(sourcemaps.write("."))
      // помести итоговый файл, туда куда скажем
      .pipe(dest("./public/css/"))
      .pipe(browserSync.stream())
  );
}

function buildPages() {
  return src("./src/pages/*.html")
    .pipe(
      include({
        includePaths: ["./src/components/**/", "./src/blocks/**/"],
      })
    )
    .pipe(dest("./public"))
    .pipe(browserSync.stream());
}

function buildScripts() {
  return src("./src/js/script.js")
    .pipe(sourcemaps.init())
    .pipe(
      include({
        includePaths: "./src/components/**/",
      })
    )
    .pipe(uglify())
    .pipe(sourcemaps.write("."))
    .pipe(dest("./public/js/"))
    .pipe(browserSync.stream());
}

function server() {
  browserSync.init({
    server: {
      baseDir: "./public/",
      // index: "order.html",
    },
    port: 8080,
    // ui: { port: 8081 },
    open: true,
  });
}

function copyFonts() {
  return src("./src/fonts/**/*").pipe(dest("./public/fonts/"));
}

function copyImages() {
  return src("./src/images/**/*").pipe(dest("./public/images/"));
}

async function copyResources() {
  copyFonts();
  copyImages();
}

async function clean() {
  return del.sync("./public/", { force: true });
}

function watching() {
  watch(["./src/styles/*.scss", "./src/components/**/*.scss", "./src/blocks/**/*.scss"], buildStyles).on(
    "change",
    browserSync.reload
  );
  watch(["./src/pages/*.html", "./src/components/**/*.html", "./src/blocks/**/*.html"], buildPages).on(
    "change",
    browserSync.reload
  );
  // watch(["./src/js/script.js", "./src/components/**/*.js"], buildScripts);
  watch("./src/images/**/*", copyImages).on("change", browserSync.reload);
}

exports.buildStyles = buildStyles;
exports.buildPages = buildPages;
// exports.buildScripts = buildScripts;
exports.server = server;
exports.copyResources = copyResources;
exports.clean = clean;
exports.watching = watching;

exports.default = parallel(clean, buildPages, buildStyles, copyResources, server, watching);

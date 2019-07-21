// Gulp task to gather all static files.

const gulp = require("gulp");
const path = require("path");
const cpx = require("cpx");
const fs = require("fs-extra");
const zopfli = require("gulp-zopfli-green");
const merge = require("merge-stream");
const paths = require("../paths");

const npmPath = (...parts) =>
  path.resolve(paths.polymer_dir, "node_modules", ...parts);
const polyPath = (...parts) => path.resolve(paths.polymer_dir, ...parts);

const copyFileDir = (fromFile, toDir) =>
  fs.copySync(fromFile, path.join(toDir, path.basename(fromFile)));

const genStaticPath = (staticDir) => (...parts) =>
  path.resolve(staticDir, ...parts);

function copyTranslations(staticDir) {
  const staticPath = genStaticPath(staticDir);

  // Translation output
  fs.copySync(
    polyPath("build-translations/output"),
    staticPath("translations")
  );
}

function copyPolyfills(staticDir) {
  const staticPath = genStaticPath(staticDir);

  // Web Component polyfills and adapters
  copyFileDir(
    npmPath("@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js"),
    staticPath("polyfills/")
  );
  copyFileDir(
    npmPath("@webcomponents/webcomponentsjs/webcomponents-bundle.js"),
    staticPath("polyfills/")
  );
  copyFileDir(
    npmPath("@webcomponents/webcomponentsjs/webcomponents-bundle.js.map"),
    staticPath("polyfills/")
  );
}

function copyFonts(staticDir) {
  const staticPath = genStaticPath(staticDir);
  // Local fonts
  cpx.copySync(
    npmPath("roboto-fontface/fonts/roboto/*.woff2"),
    staticPath("fonts/roboto")
  );
}

function copyMapPanel(staticDir) {
  const staticPath = genStaticPath(staticDir);
  copyFileDir(
    npmPath("leaflet/dist/leaflet.css"),
    staticPath("images/leaflet/")
  );
  fs.copySync(
    npmPath("leaflet/dist/images"),
    staticPath("images/leaflet/images/")
  );
}

function compressStatic(staticDir) {
  const staticPath = genStaticPath(staticDir);
  const polyfills = gulp
    .src(staticPath("polyfills/*.js"))
    .pipe(zopfli())
    .pipe(gulp.dest(staticPath("polyfills")));
  const translations = gulp
    .src(staticPath("translations/*.json"))
    .pipe(zopfli())
    .pipe(gulp.dest(staticPath("translations")));

  return merge(polyfills, translations);
}

gulp.task("copy-static", (done) => {
  const staticDir = paths.static;
  const staticPath = genStaticPath(paths.static);
  // Basic static files
  fs.copySync(polyPath("public"), paths.root);

  copyPolyfills(staticDir);
  copyFonts(staticDir);
  copyTranslations(staticDir);

  // Panel assets
  copyFileDir(
    npmPath("react-big-calendar/lib/css/react-big-calendar.css"),
    staticPath("panels/calendar/")
  );
  copyMapPanel(staticDir);
  done();
});

gulp.task("compress-static", () => compressStatic(paths.static));

gulp.task("copy-static-demo", (done) => {
  // Copy app static files
  fs.copySync(polyPath("public"), paths.demo_root);
  // Copy demo static files
  fs.copySync(path.resolve(paths.demo_dir, "public"), paths.demo_root);

  copyPolyfills(paths.demo_static);
  copyMapPanel(paths.demo_static);
  copyFonts(paths.demo_static);
  copyTranslations(paths.demo_static);
  done();
});

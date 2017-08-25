var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

var comments = ['/*!', '* <%= pkg.name %> - <%= pkg.description %>', '* @version <%= pkg.version %>', '*/;', ''].join('\n')

gulp.task("build", ["build:page", "build:code"], function () {});

gulp.task("build:code", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});

gulp.task("build:page", function () {
    return gulp.src(["./samples/**/*"])
        .pipe(gulp.dest("./dist"))
});

gulp.task("default", ["build"], function () {
    return gulp.src("./dist/index.html")
        .src("./dist/*.js")
        .pipe(open());
});
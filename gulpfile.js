var gulp = require("gulp");
var del = require("del");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

var comments = ['/*!', '* <%= pkg.name %> - <%= pkg.description %>', '* @version <%= pkg.version %>', '*/;', ''].join('\n')


gulp.task("build", ["build:clean", "build:page", "build:code"], function () {});

gulp.task('build:clean', function () {
    return del(['dist/*'])
})


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
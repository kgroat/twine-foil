var gulp = require('gulp');
var browserify = require('browserify');
var rimraf = require('gulp-rimraf');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var through = require('through2');
var stripComments = require('gulp-strip-comments');
var fs = require('fs');
var insert = require('gulp-insert');
var concat = require('gulp-concat');

gulp.task('default', ['all']);

gulp.task('all', ['clean'], function(done){
  gulp.start('build', 'icon', 'plugins', 'docs', 'lisence', done);
})

gulp.task('lisence', function(){
  return gulp.src('./lisence.txt')
    .pipe(gulp.dest('./dist'));
})

gulp.task('build', ['js'], function(){
  return gulp.src('./tmp/index.js')
    .pipe(buildFormat('./format/format.json', './format/index.html', './tmp/index.js'))
    .pipe(rename('format.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', ['build', 'icon', 'plugins', 'docs', 'lisence'], function(){
  gulp.watch('./format/**/*', ['build']);
  gulp.watch('./icon.svg', ['icon']);
  gulp.watch('./plugins/**/*', ['plugins']);
  gulp.watch('./docs/**/*', ['docs']);
  gulp.watch('./lisence.txt', ['lisence']);
})

gulp.task('js', function(){
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './format/index.js',
    debug: true,
    // defining transforms here will avoid crashing your stream
    transform: []
  });

  return b.bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    //.pipe(uglify())
    .pipe(stripComments())
    .pipe(gulp.dest('./tmp'));
})

gulp.task('plugins', function(){
  return gulp.src('./plugins/**/*')
    .pipe(gulp.dest('./dist/plugins'));
})

gulp.task('icon', function(){
  return gulp.src('icon.svg')
    .pipe(gulp.dest('./dist'));
});

gulp.task('clean', function(){
  return gulp.src(['./dist/**/*', './tmp/**/*', './public/**/*'], { read: false })
    .pipe(rimraf());
});

gulp.task('docs', ['docs:js', 'docs:static']);

gulp.task('docs:js', ['docs:templates'], function(){
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './docs/index.js',
    debug: true,
    // defining transforms here will avoid crashing your stream
    transform: [require('require-globify')]
  });

  return b.bundle()
    .pipe(source('index.js'))
    .pipe(buffer())
    //.pipe(uglify())
    .pipe(stripComments())
    .pipe(gulp.dest('./public'));
})

gulp.task('docs:templates', function(){
  return gulp.src(['./docs/**/*.html', '!./docs/index.html'])
    .pipe(insert.transform(function(contents, file){
      var escaped = contents
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\s+\\n|\\n\s+/g, '\\n')
        .replace(/\s{2,}/g, ' ');
      return '  "'+file.relative+'":"'+escaped+'",';
    }))
    .pipe(concat('templates.js'))
    .pipe(insert.transform(function(contents){
      return 'module.exports = {\n'+contents+'\n};';
    }))
    .pipe(gulp.dest('./tmp/'));
})

gulp.task('docs:static', function(){
  return gulp.src('./docs/static/**/*')
    .pipe(gulp.dest('./public/'));
})



function getFileContents(filename) {
  return new Promise(function(resolve, reject){
    fs.readFile(filename, function(err, contents){
      if(err) { return reject(err); }
      resolve(contents);
    });
  });
}

function escape(text){
  return text.toString()
    .replace(/\n/gi, '')
    .replace(/\s{2,}/gi, ' ')
    .replace(/\\/gi, '\\\\')
    .replace(/"/gi, '\\"');
}

function buildFormat(jsonFile, htmlFile, jsFile){
  function getFormatJson(){
    return getFileContents(jsonFile).then(function(jsonText){
      return JSON.parse(jsonText);
    });
  }
  function getHtml(){
    return getFileContents(htmlFile).then(escape);
  }
  function getJs(){
    return getFileContents(jsFile);
  }
  var promise = Promise.all([getFormatJson(), getHtml(), getJs()]);
  return through.obj(function(file, enc, cb){
    var self = this;
    var oldContent = file.contents;
    var stream = through();
    file.contents = stream;
    stream.write('window.storyFormat({');
    promise
      .then(function(vals){
        var format = vals[0];
        var html = vals[1];
        var js = vals[2];
        
        for(var key in format){
          if(format.hasOwnProperty(key) && key != 'source' && key != 'setup'){
            stream.write('"'+key+'":' + JSON.stringify(format[key]) + ',');
          }
        }
        stream.write('"source":"' + html + '",');
        stream.write('"setup":function(){' + js + '}');
        stream.end('});');
        cb();
      }, function(err){
        stream.emit('error', err);
        stream.end();
        cb();
      });
    self.push(file);
  });
}

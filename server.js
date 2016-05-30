var express = require('express');
var app = express();
var fs = require('fs');
var https = require('https');

function readKey(){
  return new Promise(function(resolve, reject){
    fs.readFile('./local/server.key', function(err, key){
      if(err) { return reject(err); }
      resolve(key);
    });
  });
}

function readCert(){
  return new Promise(function(resolve, reject){
    fs.readFile('./local/server.crt', function(err, cert){
      if(err) { return reject(err); }
      resolve(cert);
    });
  });
}

app.use(function(req, res, next){
  res.set('Access-Control-Allow-Origin', '*');
  next();
})

app.use('/dist', express.static('dist'));
app.use(express.static('icons'));
app.use(express.static('public'));

var port = process.env.PORT || 3000;
Promise.all([readKey(), readCert()]).then(function(vals){
  var key = vals[0];
  var cert = vals[1];
  var options = {
    key: key,
    cert: cert,
    requestCert: false,
    rejectUnauthorized: false
  };
  var securePort = port+1;
  var secureServer = https.createServer(options, app).listen(securePort, function(){
    console.log('secure server listening at port '+securePort);
  });
}, function(){
  console.log('secure server not started.');
});

app.listen(port, function(){
  console.log('server listening at port '+port);
});
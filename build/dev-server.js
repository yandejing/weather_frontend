require ( './check-versions' ) ()
var https = require ( 'https' );
var http = require ( 'http' );
var fs = require ( 'fs' );
var options = {
  key : fs.readFileSync ( './build/cert/privatekey.pem', 'utf8' ),
  cert : fs.readFileSync ( './build/cert/certificate.crt', 'utf8' )
}
var config = require ( '../config' )
if ( ! process.env.NODE_ENV ) {
  process.env.NODE_ENV = JSON.parse ( config.dev.env.NODE_ENV )
}

var opn = require ( 'opn' )
var path = require ( 'path' )
var express = require ( 'express' )
var webpack = require ( 'webpack' )
var proxyMiddleware = require ( 'http-proxy-middleware' )
var webpackConfig = require ( './webpack.dev.conf' )

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.dev.port
var sslPort = process.env.SSLPORT ||config.dev.sslPort
// automatically open browser, if not set will be false
var autoOpenBrowser = ! ! config.dev.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.dev.proxyTable

var app = express ()
var compiler = webpack ( webpackConfig )

var devMiddleware = require ( 'webpack-dev-middleware' ) ( compiler, {
  publicPath : webpackConfig.output.publicPath,
  quiet : true
} )

var hotMiddleware = require ( 'webpack-hot-middleware' ) ( compiler, {
  log : () => {
  }
} )
// force page reload when html-webpack-plugin template changes
compiler.plugin ( 'compilation', function ( compilation ) {
  compilation.plugin ( 'html-webpack-plugin-after-emit', function ( data, cb ) {
    hotMiddleware.publish ( { action : 'reload' } )
    cb ()
  } )
} )

// proxy api requests
Object.keys ( proxyTable ).forEach ( function ( context ) {
  var options = proxyTable[ context ]
  if ( typeof options === 'string' ) {
    options = { target : options }
  }
  app.use ( proxyMiddleware ( options.filter || context, options ) )
} )

// handle fallback for HTML5 history API
app.use ( require ( 'connect-history-api-fallback' ) () )

// serve webpack bundle output
app.use ( devMiddleware )

// enable hot-reload and state-preserving
// compilation error display
app.use ( hotMiddleware )

// serve pure static assets
var staticPath = path.posix.join ( config.dev.assetsPublicPath, config.dev.assetsSubDirectory )
app.use ( staticPath, express.static ( './static' ) )
app.use ( '/frontend/smilecampus_config.js', express.static ( './config/smilecampus_config.js' ) )
var uri = 'http://localhost:' + port
var sslUri = 'https://localhost:'+sslPort

var _resolve
var readyPromise = new Promise ( resolve => {
  _resolve = resolve
} )

console.log ( '> Starting dev server...' )
devMiddleware.waitUntilValid ( () => {
  console.log ( '> Listening at ' + uri )
  sslPort && console.log ( '> Listening at ' + sslUri + '\n' )
  // when env is testing, don't need open it
  if ( process.env.npm_config_open ) {
    var subModule = process.env.npm_config_open == 'true' ? 'home' : process.env.npm_config_open;
    opn ( uri + '/' + process.argv[ 2 ] + '/' + subModule + '/index.html' )
  }
  if ( autoOpenBrowser && process.env.NODE_ENV !== 'testing' ) {
    opn ( uri )
  }
  _resolve ()
} )

var httpServer = http.createServer ( app ).listen ( port );
var httpsServer = sslPort ? https.createServer ( options, app ).listen ( sslPort ) : undefined;
module.exports = {
  ready : readyPromise,
  close : () => {
    httpServer.close ()
    httpsServer && httpsServer.close ()
  }
}

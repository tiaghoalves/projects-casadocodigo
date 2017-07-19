var express         = require('express');
var app             = express();
var cfg             = require('./config.json');
var load            = require('express-load');
var cookieParser    = require('cookie-parser');
var expressSession  = require('express-session');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var error           = require('./middleware/error');
var compression     = require('compression');
var mongoose        = require('mongoose');
var server          = require('http').createServer(app);
var io              = require('socket.io')(server);
var redisAdapter    = require('socket.io-redis');
var RedisStore      = require('connect-redis')(expressSession);
var morgan          = require('morgan');
var cookie          = cookieParser(cfg.SECRET);
var store           = new RedisStore({prefix: cfg.KEY})

app.disable('x-powered-by');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(morgan('combined'));
app.use(compression());
app.use(cookie);
app.use(expressSession({
        secret: cfg.SECRET, 
        key: cfg.KEY,
        resave: false, 
        saveUninitialized: false,
        store: store
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public', cfg.CACHE));

io.adapter(redisAdapter(cfg.REDIS));
io.use(function(socket, next) {
  var data = socket.request;
  cookie(data, {}, function(err) {
    var sessionID = data.signedCookies[cfg.KEY];
    store.get(sessionID, function(err, session) {
      if (err || !session) {
        return next(new Error('Não autorizado'));
      } else {
        socket.handshake.session = session;
        return next();
      }
    });
  });
});

load('models')
  .then('controllers')
  .then('routes')
  .into(app);
load('sockets')
  .into(io);

app.use(error.notFound);
app.use(error.serverError);

var port = process.env.PORT || 3000;
server.listen(port, function(){
  console.log("Ntalk no ar em: http://localhost:" + port);
});

module.exports = app;

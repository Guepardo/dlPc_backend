var express       		 = require('express');
var path         		 = require('path');
var http         		 = require('http');
var session      		 = require('express-session');
var bodyParser           = require('body-parser');

var DeliveryPcBotHandler = require('./modules/DeliveryPcBotHandler');
var ServerSocket         = require('./modules/ServerSocket');

var app = express();

require('./mongo/db')();

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(session({secret: 'algumascoisa', resave: true, saveUninitialized: true}));

//API request:
app.all('/v1.0/*', require('./routes/setHeader')); 
app.use('/v1.0/' , require('./routes/cancelSolicitation'));
app.use('/v1.0/' , require('./routes/createSolicitation'));
app.use('/v1.0/' , require('./routes/getHistory'));
app.use('/v1.0/' , require('./routes/getStatus'));
app.use('/v1.0/' , require('./routes/register'));
app.use('/v1.0/' , require('./routes/updatePerfil'));
app.use('/v1.0/' , require('./routes/validate'));

//System requests:
app.all('/dash/*', require('./routes/site/dashSecurity'));
app.use('/'		 , require('./routes/registerTechnician'));
app.use('/'		 , require('./routes/site/login'));
app.use('/'      , require('./routes/site/dashboardColaborator'));
app.use('/'		 , require('./routes/site/history'));
app.use('/'		 , require('./routes/site/updateData'));
app.use('/'		 , require('./routes/site/password'));

//Security filter:
//app.use(require('./routes/security'));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


var port = process.env.PORT || 3000;
app.set('port', port);
var server = http.createServer(app);
server.listen(port);
ServerSocket.init(server);

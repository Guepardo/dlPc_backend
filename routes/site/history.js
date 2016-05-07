var express    = require('express');
var route      = express.Router();

route.get('/dash/history', function(req, res, next){
	res.render('history.html');
});

module.exports = route;

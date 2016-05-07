// var express = require('express'); 
// var route   = express.Router(); 

// route.get('/', function(req, res, next){
// 	res.redirect('/login'); 
// }); 

// route.all('/dash*', function(req, res, next){
// 	var authenticated = req.session.authenticated;

// 	console.log('Route all security: '+ authenticated); 
// 	if(!authenticated || typeof authenticated == 'undefined' || authenticated == null)
// 	 	res.redirect('/login'); 

// 	 next(); 
// }); 
var security; 

security = function(req, res, next){
	var authenticated = req.session._authenticated;

	console.log('Route all security: '+ authenticated); 
	if(!authenticated || typeof authenticated == 'undefined' || authenticated == null){
		res.redirect('/login'); 
		return;
	}

	next(); 
}; 

module.exports = security; 
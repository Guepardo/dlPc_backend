var express = require('express'); 
var route   = express.Router(); 

route.post('/updatePerfil', function(req, res,next){
	res.json({whats: "updatePerfil"}); 
}); 	

module.exports = route; 

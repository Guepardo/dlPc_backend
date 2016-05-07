var express = require('express'); 
var route   = express.Router(); 
var Client  = require('../schema/client'); 
var sha256  = require('crypto-js/sha256');

route.post('/validate', function(req, res,next){
	var validation_code = req.body.validation_code; //That code ref api_key in clientSchema;  

	Client.findOne({
		api_key: validation_code, 
	},function(error, client){
		if(error){
			res.json({status: false, msg: error.errmsg}); 
			return;
		}
 	 	
 	 	if(client == null){
 	 		res.json({stauts: false, msg: 'notfonud'}); 
 	 		return; 
 	 	}
 	 	
		client.validated = true; 
		client.api_key   = sha256(validation_code); 
		client.save(function(error, client){
			if(error){
				res.json({status: false, msg: error.errmsg}); 
				return; 
			}
		}); 

		res.json({status: true, api_key: client.api_key});
	});
}); 	

module.exports = route; 

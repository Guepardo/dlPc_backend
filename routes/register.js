var express                   = require('express'); 
var route                     = express.Router(); 
var Client                    = require("../schema/client"); 
var sha256                    = require('crypto-js/sha256'); 
var GoogleCloudMessageHandler = require('../modules/GoogleCloudMessageHandler');  

route.post('/register', function(req, res, next){
	var dd 		 = req.body.dd; 
	var phone 	 = req.body.phone;
	var gcm_key  = req.body.gcm_key;

	if( typeof dd == "undefined" ||  typeof phone == "undefined" ||  typeof gcm_key == "undefined" ){
		res.json({status:false, msg: "You need a little more of date for do it."}); 
		return; 
	} 

	var validate_code = Math.floor( (Math.random() * 9999 ) + 1111); 

	var client = new Client({
		dd           : dd, 
		phone        : phone, 
		gcm_key      : gcm_key,
		api_key      : validate_code,  
		date_register: new Date(), 
		validated    : false
	}); 

	client.save(function(error, client){
		if(error){
			res.json({status: false, msg: error.errmsg}); 
			return; 
		}

	 	//TO-DO: Send Google Cloud Messager here. 
	 	setTimeout(function(){
	 		GoogleCloudMessageHandler.sendMessage(client.gcm_key, "Seu código de validação é: "+validate_code); 
	 	},1000 * 15); 
	 	res.json({status: true}); 
	 }); 

}); 


module.exports = route; 
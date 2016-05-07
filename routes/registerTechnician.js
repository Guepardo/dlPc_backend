var express    = require("express"); 
var route      = express.Router(); 
var Technician = require('../schema/technician'); 
var md5        = require('crypto-js/md5'); 

route.post('/registerTechnician', function(req, res, next){
	var dd          = req.body.dd; 
	var phone       = req.body.phone; 
	var password    = req.body.password; 
	var name        = req.body.name; 

	console.log("here"); 

	if( typeof password == 'undefined' || typeof dd == 'undefined' || typeof phone == 'undefined' ){
		res.json({status: false, msg: "You need a little more of date for do it."}); 
		return; 
	}

	var tech = new Technician({
		dd           : dd, 
		phone        : phone, 
		telegram_id  : md5(new Date() + phone ), 
		password     : password, 
		name         : name, 
		date_creation: new Date(), 
		active       : false
	}); 

	tech.save(function(error, tech){
		if(error){
			res.json({status: false, msg: error.errmsg }); 
			return; 
		}
		res.json({status: true, msg: {telegram_register: tech.telegram_id}}); 
	}); 
}); 

module.exports = route; 
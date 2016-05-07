var express    			 = require('express');
var route     			 = express.Router();
var Technician 			 = require('../../schema/technician'); 
var Util      			 = require('../../util/util'); 
var sha256    			 = require('crypto-js/sha256'); 
var DeliveryPcBotHandler = require('../../modules/DeliveryPcBotHandler'); 

route.get('/password', function(req, res, next){
	res.render('password.html');
});

route.post('/passwordChange', function(req, res, next){
	var password1         = req.body.password1;
	var password2         = req.body.password2; 
	var verification_code = req.body.verification_code; 

	var util = new Util(); 
	var paramArray = new Array(password1, password2, verification_code); 

	if(util.hasEmpty(paramArray)){
		res.json({status: false, msg: "You need a little more of date for do it."}); 
		return; 
	}

	if(password1 != password2){
		res.json({status: false, msg: "Senhas diferentes"}); 
		return; 
	}

	Technician.findOne({
		verification_code: verification_code
	}).
	select('verification_code password telegram_id'). 
	exec(function(error, tech){
		if(error){
			res.json({status: false, msg: error.errmesg}); 
			return; 
		}

		if(tech == null){
			res.json({status: false, msg: "Código de verificação inválido."}); 
			return; 
		}

		tech.verification_code = ''; 
		tech.password = password1; 
		tech.save(function(error, tech){
			if(error){
				res.json({status: false, msg: error.errmesg}); 
				return; 
			}

			var msg = "Sua senha foi alterada na data e hora "+ util.dateFormat(new Date()); 
			DeliveryPcBotHandler.sendMessage(tech.telegram_id,msg); 
			res.json({status: true}); 
		}); 
	}); 
}); 

route.post('/getVerificationcCode', function(req, res, next){
	var dd	  = req.body.dd;  
	var phone = req.body.phone; 

	var util = new Util(); 
	var paramArray = new Array(dd, phone); 

	if(util.hasEmpty(paramArray)){
		res.json({status: false, msg: "You need a little more of date for do it."}); 
		return; 
	}

	Technician.findOne({
		dd	 : dd, 
		phone: phone
	}). 
	select('telegram_id verification_code'). 
	exec(function(error, tech){
		if(error){
			res.json({status: false, msg: error.errmesg}); 
			return; 
		}

		//send status true even tech is null, because it's a recovery password function. 
		if(tech == null){
			res.json({status: true}); 
			return; 
		}

		//if thechnincian already has a verification code. 
		if(tech.verification_code != ''){
			DeliveryPcBotHandler.sendVarificationCode(tech.telegram_id, tech.verification_code); 
			res.json({status: true}); 
			return; 
		}

		var randomValue = (Math.random() * 1000000); 
		var newVerificationCode = sha256( new Date() + phone + dd + randomValue); 
		
		tech.verification_code = newVerificationCode; 
		tech.save(function(error, tech){
			if(error){
				res.json({status: false, msg: error.errmesg}); 
				return; 
			}

			DeliveryPcBotHandler.sendVarificationCode(tech.telegram_id, tech.verification_code); 
			res.json({status: true}); 
		}); 
	}); 
}); 

module.exports = route;

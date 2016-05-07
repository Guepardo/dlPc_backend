var express    = require('express'); 
var route      = express.Router(); 
var Technician = require('../../schema/technician'); 
var Util       = require('../../util/util'); 

route.get('/login', function(req, res, next){
	res.render('login.html'); 
}); 

route.post('/login', function(req, res, next){
	var dd  	 = req.body.dd; 
	var phone 	 = req.body.phone; 
	var password = req.body.password; 
	var session  = req.session;  

	var util = new Util(); 

	var paramArray = new Array(dd, phone, password); 

	// if(typeof dd == 'undefined' || typeof phone == 'undefined' || typeof password == 'undefined'){
	if(util.hasEmpty(paramArray)){
		res.json({status: false, msg: "Dados insuficientes para efetuar login."}); 
		return; 
	}

	Technician.findOne({
		dd: dd, 
		phone: phone, 
		password: password
	},function(error, tech){
		if(error){
			res.json({status: false, msg: error.errmsg}); 
			return; 
		}

		if(tech == null ){
			res.json({status: false, clean_input: true,  msg: "DDD, celular ou senha inválido."}); 
			return; 
		}

		session._id            = tech._id; 
		session._name 		   = tech.name;
		session._authenticated = true; 

		res.json({status: true, redirect : '/dash/colaborador'})
	}); 
}); 

module.exports = route; 
var express    = require('express');
var route      = express.Router();
var Technician = require('../../schema/technician'); 
var Util       = require('../../util/util'); 


route.get('/dash/update', function(req, res, next){
	var id = req.session._id; 

	Technician.findOne({
		_id: id
	},function(error, tech){
		if(error){
			//Create a veiw to inform for some trouble in database; 
		}

		var temp = {
			name : tech.name, 
			dd   : tech.dd, 
			phone: tech.phone, 
			email: tech.email,  
		}; 
		res.render('updatedata.html',temp);
	}); 
});


route.post('/dash/passwordChange', function(req, res, next){
	var nowPassword        = req.body.now_password; 
	var newPassword        = req.body.new_password; 
	var newPasswordConfirm = req.body.new_password_confirm; 
	var id                 = req.session._id; 

	var paramArray = new Array(nowPassword, newPassword, newPasswordConfirm); 
	var util = new Util(); 

	if(util.hasEmpty(paramArray)){
		res.json({status: false, msg: "You need a little more of date for do it."}); 
		return; 
	}

	if(newPasswordConfirm != newPassword){
		res.json({status: false, msg: "Senhas diferentes"}); 
		return; 
	}

	Technician.findOne({
		_id     : id, 
		password: nowPassword
	}). 
	select('password'). 
	exec(function(error, tech){
		if(error){
			res.json({status: false, msg: error.errmesg}); 
			return; 
		}

		if(tech == null){
			res.json({status: false, msg: "notfound"}); 
			return; 
		}

		tech.password = newPassword; 
		tech.save(function(error, tech){
			if(error){
				res.json({status: false, msg: error.errmesg}); 
				return; 
			}

			res.json({status: true}); 
		}); 
	}); 
}); 


route.post('/dash/updateRegister', function(req, res, next){
	var name  = req.body.name; 
	var email = req.body.email; 
	var id    = req.session._id; 

	var paramArray = new Array(name); 
	var util = new Util(); 

	if(util.hasEmpty(paramArray)){
		res.json({status: false, msg: "You need a little more of date for do it."}); 
		return; 
	}

	Technician.findOne({
		_id: id
	}).
	select('name email'). 
	exec(function(error, tech){
		if(error){
			res.json({status: false, msg: error.errmesg}); 
			return; 
		}

		tech.name  = name; 
		tech.email = email; 
		tech.save(function(error, tech){
			if(error){
				res.json({status: false, msg: error.errmesg}); 
				return; 
			}

			res.json({status: true}); 
		}); 
	}); 
}); 


module.exports = route;

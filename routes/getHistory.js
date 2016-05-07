var express = require('express'); 
var route   = express.Router(); 
var Client  = require('../schema/client'); 
var Order   = require('../schema/order'); 

route.post('/getHistory', function(req, res,next){
	var api_key = req.body.api_key; 
	
	if(	typeof api_key == 'undefined' ){
		res.json({status:false, msg: "You need a little more of date for do it."}); 
		return; 
	} 

	Client.findOne({
		api_key: api_key
	},function(error, client){
		if(error){
			res.json({status: false, msg: error.errmsg}); 
			return; 
		}

		if(client == null){
			res.json({status: false, msg: "notfound"}); 
			return; 
		}

		Order.find({
			client: client._id
		}).
		limit(50). 
		sort({creation_date: 'desc'}). 
		select('status creation_date _id').
		exec(function(error, orders){
			if(error){
				res.json({status: false, msg: error.errmsg}); 
				return; 
			}

			var result = {}; 

			result.status  = true; 
			result.history = new Array();

			for(var i = 0; i < orders.length; i++)
				result.history.push(orders[i]);

			res.json(result); 
		}); 
	}); 
}); 	

module.exports = route; 

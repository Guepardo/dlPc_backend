var express    = require('express'); 
var route      = express.Router(); 
var Client     = require('../schema/client'); 
var Order      = require('../schema/order'); 
var Technician = require('../schema/technician'); 
var enumOrder  = require('../enum/enumOrder'); 

route.post('/getStatus', function(req, res,next){
	var api_key = req.body.api_key; 

	if( typeof api_key == 'undefined'){
		res.json({status: false, msg: "You need a little bit more of data for do it."}); 
		return; 
	}

	Client.findOne({
		api_key: api_key
	}, function(error, client){
		if(error){
			res.json({status: false, msg: error.errmsg}); 
			return; 
		}

		if(client == null){
			res.json({status: false, msg: "notfound client"}); 
			return; 
		}

		Order.findOne({
			client: client._id, 
			status: { $ne : enumOrder.CLOSE  }
		}).
		select('status'). 
		exec(function(error, order){
			if(error){
				res.json({status: false, msg: error.errmsg}); 
				return; 
			}

			if(order == null){
				res.json({status: false, msg: "notfound order"}); 
				return; 
			}

			Technician.findOne({
				responded_orders: {$in : [order._id] },
				busy: true
			}).
			select('name count_cancel dd phone'). 
			exec(function(error, tech){
				if(error){
					res.json({status: false, msg: error.errmsg}); 
					return; 
				}

				if(tech == null){
					var result ={
						orderId    : order.Id,
						orderStatus: order.status, 
					}; 

					res.json({status: true, result: result}); 
					return; 
				}

				var result ={
					orderId    : order.Id,
					orderStatus: order.status, 
					tech: {
						name              : tech.name, 
						count_solicitation: 10, 
						count_cancel      : tech.count_cancel, 
						phone             : tech.dd+" "+tech.phone
					}
				}; 

				res.json({status: true, result: result}); 
			}); 
		}); 
	}); 
}); 	

module.exports = route; 

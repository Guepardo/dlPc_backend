var express    			 = require('express'); 
var route      			 = express.Router(); 
var Client     			 = require("../schema/client"); 
var Order      			 = require("../schema/order"); 
var enumOrder  			 = require("../enum/enumOrder"); 
var DeliveryPcBotHandler = require("../modules/DeliveryPcBotHandler");
var ServerSocket         = require('../modules/ServerSocket'); 

route.post('/createSolicitation', function(req, res,next){
	var api_key 		   = req.body.api_key; 
	var latitude 	       = req.body.latitude; 
	var longitude 	       = req.body.longitude; 
	var address_complement = req.body.address_complement;  

	var gps_location = new Object(); 

	gps_location.latitude  = latitude; 
	gps_location.longitude = longitude;

	console.log(gps_location);

	if( typeof api_key == 'undefined' || typeof gps_location == 'undefined' || typeof address_complement == 'undefined'){
		res.json({status: false, msg: "You need a little more of date for do it."}); 
		return; 
	}

	//Finding client by api_key
	Client.findOne({
		api_key: api_key
	},function(error,client){
		if(error){
			res.json({status: false, msg: error.errmsg}); 
			return;
		}

		if(client == null){
			res.json({status: false, msg: "notfound"}); 
			return; 
		}

		//Finding open orders by client object Id.
		Order.find({
			client: client._id, 
			status: { $ne : enumOrder.CLOSE }
		},function(error, orders){
			if(error){
				res.json({status: false, msg: error.errmsg}); 
				return;
			}

			//Setting all open orders to status close. 
			for(var i = 0; i < orders.length; i++){
				orders[i].status = enumOrder.CLOSE; 
				orders[i].save(); 
				ServerSocket.pulseSolicitationRemove(orders[i]._id); 
			}

			var order = new Order({
				address_complement: address_complement, 
				gps_location: gps_location, 
				client: client._id, 
				status: enumOrder.OPEN, 
				creation_date: new Date()
			}); 

			order.save(function(error,order){
				if(error){
					res.json({status: false, msg: error.errmsg}); 
					return;
				}

				res.json({status: true}); 
				DeliveryPcBotHandler.pulseSolicitationAlert(); 
				ServerSocket.pulseSolicitationAlert(order); 
			}); 
		}); 
	}); 
}); 	

module.exports = route; 

var express              = require('express'); 
var route                = express.Router(); 
var Client               = require('../schema/client'); 
var Order                = require('../schema/order'); 
var Technician           = require('../schema/technician'); 
var enumOrder            = require('../enum/enumOrder'); 
var DeliveryPcBotHandler = require('../modules/DeliveryPcBotHandler'); 
var ServerSocket         = require('../modules/ServerSocket'); 

route.post('/cancelSolicitation', function(req, res,next){
	var api_key = req.body.api_key; 

	if( typeof api_key == 'undefined' ){
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

		//Canceling all open orders.
		Order.find({
			client: client._id, 
			status: {$ne: enumOrder.CLOSE}
		},function(error,orders){
			if(error){
				res.json({status: false, msg: error.errmsg}); 
				return; 
			}

			//Setting all open orders to status close. 
			for(var i = 0; i < orders.length; i++){

				Technician.findOne({
					responded_orders: { $in: [orders[i]._id ] }
				}).
				select('_id busy telegram_id'). 
				exec(function(error, tech){
					if(error){
						res.json({status: false, msg: error.errmsg}); 
						return; 
					}

					if(tech == null){
						res.json({status: false, msg: "notfound"}); 
						return; 
					}

					tech.busy = false; 
					tech.save(function(error,tech){
						if(!error){
							ServerSocket.changeStatusBusy({id: tech._id, busy: tech.busy}); 
							DeliveryPcBotHandler.sendMessage(tech.telegram_id,"O pedido que você está atendendo atualmente foi cancelado pelo cliente. Seu estado foi modificado de ocupado para livre."); 
						}
					}); 
				}); 

				orders[i].status = enumOrder.CLOSE; 
				orders[i].save(); 
			}

			res.json({status: true}); 
		}); 
	}); 
}); 	

module.exports = route; 

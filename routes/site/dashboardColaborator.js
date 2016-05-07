var express                      = require('express'); 
var route                        = express.Router(); 
var Technician                   = require('../../schema/technician'); 
var Order                        = require('../../schema/order'); 
var enumOrder                    = require('../../enum/enumOrder'); 
var AuthenticateHashFactory      = require('../../util/AuthenticateHashFactory');  
var Util      			         = require('../../util/util'); 

var DeliveryPcBotHandler         = require('../../modules/DeliveryPcBotHandler'); 
var ServerSocket                 = require('../../modules/ServerSocket'); 
var GoogleCloudMessageHandler    = require('../../modules/GoogleCloudMessageHandler'); 


route.get('/dash/colaborador', function(req, res, next){
	var session = req.session; 
	Technician.findOne({
		_id: session._id
	}).
	exec(function(error, tech){
		console.log(tech); 
		var authToken = AuthenticateHashFactory.create(); 

		var busyText         = (tech.busy  ) ? 'Pedido em andamento.' : 'Você está livre'; 
		var telegramIdText   = (tech.active) ? 'Conta ativada'        : tech.telegram_id; 
		var telegramIdButton = (tech.active) ? 'disabled' : ''; 

		var temp = {
			authToken         : authToken,
			telegram_id       : telegramIdText,
			name              : tech.name, 
			dd                : tech.dd, 
			phone             : tech.phone, 
			busy              : busyText, 
			count_cancel      : tech.count_cancel, 
			responded_orders  : tech.responded_orders.length,
			id                : tech._id, 
			telegram_id_button: telegramIdButton
		}; 

		Order.find({
			status: enumOrder.OPEN
		}).
		select('creation_date _id').
		exec(function(error, orders){
			if(error)
				temp.orders = new Array(); 

			temp.orders = orders; 
			res.render('dashColaborador.html',temp); 
		}); 
	}); 
}); 


route.get('/dash/logout', function(req, res, next){
	req.session.destroy(); 
	res.redirect('/login'); 
}); 


route.post('/dash/remember', function(req, res, next){
	var id = req.session._id; 

	Technician.findOne({
		_id: id,
		busy: true
	}). 
	select('telegram_id responded_orders'). 
	populate('responded_orders').
	exec(function(error, tech){
		if(error){
			res.json({status: false, msg: error.errmsg}); 
			return; 
		}

		if(tech == null){
			res.json({status: false, msg: 'Você não está atendendo uma solicitação no momento.'}); 
			return; 
		}

		var order = tech.responded_orders[tech.responded_orders.length-1];

		DeliveryPcBotHandler.rememberSolicitationAlert(tech.telegram_id, order); 
		res.json({status: true}); 
	}); 
}); 


route.post('/dash/acceptSolicitation', function(req, res, next){
	var id      = req.session._id; 
	var orderId = req.body.order_id; 

	var util = new Util(); 	
	var array = new Array(orderId); 

	if(util.hasEmpty(array)){
		res.json({status: false, msg: "You need a little more of date for do it."}); 
		return; 
	}

	Technician.findOne({
			_id        : id, 
			active     : true,
			busy       : false
		}).select('busy responded_orders _id telegram_id'). 
		exec(function(error, tech){
			if(error){
				res.json({status: false, msg: "Error, tenta novamente mais tarde"});
				return; 
			}

			if(tech == null){
				res.json({status: false, msg: "Desculpe, mas você <b>está ocupado</b> ou ainda não é um <b>usuário ativado</b>."});
				return;
			}

			Order.findOne({
				status: enumOrder.OPEN, 
				_id   : orderId
			}).
			populate('client').
			exec(function(error, order){
				if(error){
					res.json({status: false, msg: "Error, tenta novamente mais tarde"});
					return; 
				}

				console.log(order); 
				if(order == null ){
					res.json({status: false, msg: "Desculpe, mas não há mais solicitações em aberto. Aguarde uma nova solicitação."});
					return;
				}

				
				//all is good to send to technician: 
				var buildMsg = "Você aceitou a solicitação. Seu estado passou de livre para ocupado.\n"; 
				buildMsg    += "Conclua essa solicitação ou cancele por meio do comando /cancelar.\n"; 
				buildMsg    += "Número do cliente: "+order.client.dd+" - "+order.client.phone+"\n"; 
				buildMsg    += "Complemento do endereço: "+order.address_complement+"\n"; 
				buildMsg    += "Localização da solicitação: \n\n"; 

				var bot = DeliveryPcBotHandler.getBot(); 

				bot.sendMessage(tech.telegram_id,buildMsg); 
				bot.sendLocation(tech.telegram_id, order.gps_location.longitude, order.gps_location.latitude); 

				tech.busy    = true; 
				tech.responded_orders.push(order._id);
				order.status = enumOrder.IN_PROGRESS; 

				tech.save(); 
				order.save(); 

				ServerSocket.pulseSolicitationRemove(order._id); 
				ServerSocket.changeStatusBusy({id: tech._id, busy: tech.busy}); 
				GoogleCloudMessageHandler.pulseAcceptSolicitation(order.client.gcm_key); 
				res.json({status: true}); 
			}); 

		});
}); 

module.exports = route; 

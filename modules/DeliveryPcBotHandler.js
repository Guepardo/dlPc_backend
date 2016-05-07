var DeliveryPcBot 			  = require('./DeliveryPcBot'); 
var Technician    			  = require('../schema/technician'); 
var Order         			  = require('../schema/order'); 
var Client                    = require('../schema/client'); 
var enumOrder     			  = require("../enum/enumOrder"); 
var GoogleCloudMessageHandler = require('./GoogleCloudMessageHandler'); 
var ServerSocket        	  = require('./ServerSocket'); 
var Util 					  = require('../util/util'); 

var DeliveryPcBotHandler = function(){
	this.dpb = new DeliveryPcBot(); 
	this.dpb.registerService(); 

	var self = this; 

	//-----Start function; 
	this.dpb.on('start', function(bot, id, msg){
		var buildMsg = "Olá, meu nome é DeliveryPcBot. Parece que você ainda não está registrado. Já tem a sua chave de ativação? Se ainda não tem, acesso o site www.deliverypc.com/serumcolcaborador.\n"; 
		buildMsg += "Se você já tiver o código de ativação basta digitar abaixo e eu irei cuidar do resto pra você.\n\n/registrar [codigo de ativação]"; 
		bot.sendMessage(id,buildMsg); 
	}); 

	//-----Register function; 
	this.dpb.on('registrar',function(bot, id, msg){
		console.log(msg); 
		Technician.findOne({
			telegram_id : msg.trim() 
		}).
		select('dd phone name date_creation').
		exec(function(error, tech){
			if(error){
				bot.sendMessage(id,"Error, tente novamente mais tarde"); 
				return; 
			}

			if(tech == null){
				bot.sendMessage(id,"Você não foi cadastrado ou o seu código é inválido. "); 
				return; 
			}	

			var util = new Util(); 

			var buildMsg ="Bem-vindo a equipe DeliveryPC, "+tech.name+"!\n";
			buildMsg += "Seu número é: "+tech.dd+" - "+tech.phone+"\n"; 
			buildMsg += "Seu cadastro foi criado no site no dia: "+ util.dateFormat(new Date(tech.date_creation))+"\n\n";
			buildMsg += "Delivery PC é um aplicativo que facilita a solicitação de visitas técnicas ou reparos técnicos em equipamentos eletrônicos. O aplicativo tem como proposta fornecer uma interface amigável entre o cliente e a empresa prestadora de serviço, assim evitando ao máximo o uso da área de SAC da empresa. Delivery PC, como um todo, compreende um aplicativo para todas as plataformas mobile atuais e um software de gerenciamento agendamentos de solicitação de visita técnica. "; 
			buildMsg += "Veja as funções que eu posso executar digitando este comando /ajuda.\n\n"; 
			buildMsg += "Você está cadastrado como um técnico. Eu irei lhe informar sobre as solicitações de assistência técnica assim que o clientes requererem. Então fique atento as notificações.";

			tech.active 	 = true; 
			tech.telegram_id = id;

			tech.save(function(error,tech){
				if(!error){
					bot.sendMessage(id,buildMsg); 
					console.log('register done'); 
				}else{
					bot.sendMessage(id, error.errmsg); 
				}
			}); 

		}); 
	}); 

	//-----Help function
	this.dpb.on('ajuda',function(bot, id, msg){
		var buildMsg = "Olá, parece que você está precisando de ajuda. "; 
		buildMsg += "Abaixo eu irei listar as minhas habilidades mágicas:\n\n"; 
		buildMsg += "/registrar [chave de ativação] Ativa sua conta de colaborador;\n"; 
		buildMsg += "/ajuda Uma lista de funçãos e descrições são exibidas;\n"; 
		buildMsg += "/cancel Cancelar uma solicitação de assistência técnica;\n";
		buildMsg += "/sim Aceitar uma order de solicitação de assistência técnica;\n"; 
		buildMsg += "/nao Rejeitar uma order de solicitação de assistência técnica.\n";  
		buildMsg += "...\n"; 

		bot.sendMessage(id,buildMsg);  
	}); 

	//-----Cofirm function
	this.dpb.on('sim',function(bot, id, msg){
		//check list: 
		//status is busy; 
		//he has an active account; 

		Technician.findOne({
			telegram_id: id, 
			active     : true,
			busy       : false
		}).select('busy responded_orders _id'). 
		exec(function(error, tech){
			if(error){
				bot.sendMessage(id,"Error, tenta novamente mais tarde"); 
				return; 
			}

			if(tech == null){
				bot.sendMessage(id,"Desculpe, mas você está ocupado no momento. Você ainda está atendendo uma solicitação pelo que consta no meu banco de dados, ."); 
				return;
			}

			Order.find({
				status: enumOrder.OPEN
			}).
			populate('client').
			limit(1).
			exec(function(error, order){
				if(error){
					bot.sendMessage(id,"Error, tenta novamente mais tarde"); 
					return; 
				}

				console.log(order); 
				if(order == null || order.length == 0){
					bot.sendMessage(id,"Desculpe, mas não há mais solicitações em aberto. Aguarde uma nova solicitação."); 
					return;
				}

				order = order[0]; 
				// console.log(order); 
				// console.log(tech); 
				//all is good to send to technician: 
				var buildMsg = "Você aceitou a solicitação. Seu estado passou de livre para ocupado.\n"; 
				buildMsg    += "Conclua essa solicitação ou cancele por meio do comando /cancelar.\n"; 
				buildMsg    += "Número do cliente: "+order.client.dd+" - "+order.client.phone+"\n"; 
				buildMsg    += "Complemento do endereço: "+order.address_complement+"\n"; 
				buildMsg    += "Localização da solicitação: \n\n"; 

				bot.sendMessage(id,buildMsg); 
				bot.sendLocation(id, order.gps_location.longitude, order.gps_location.latitude); 

				tech.busy    = true; 
				tech.responded_orders.push(order._id);
				order.status = enumOrder.IN_PROGRESS; 

				tech.save(); 
				order.save(); 

				ServerSocket.pulseSolicitationRemove(order._id); 
				ServerSocket.changeStatusBusy({id: tech._id, busy: tech.busy}); 
				GoogleCloudMessageHandler.pulseAcceptSolicitation(order.client.gcm_key); 
			}); 

		}); 
	}); 

	this.dpb.on('nao',function(bot, id, msg){
		var buildMsg ="Ok, você não quer pegar essa solicitação. Aguarde por novas notificações. Mas caso mude de ideia, mande o comando /sim para mim."; 
		bot.sendMessage(id,buildMsg); 
	}); 

	this.dpb.on('cancelar',function(bot, id, msg){
		Technician.findOne({
			telegram_id: id, 
			busy: true
		}).
		select("responded_orders busy count_cancel _id"). 
		populate('responded_orders'). 
		exec(function(error, tech){
			if(error){
				bot.sendMessage(id,"Error, tenta novamente mais tarde"); 
				return; 
			}

			if(tech == null){
				bot.sendMessage(id,"Parece que você não está atendendo uma solicitação."); 
				return; 
			}

			tech.busy = false; 
			tech.count_cancel++; 

			var index = tech.responded_orders.length-1; 

			//in case of empty array
			if(index == -1){
				tech.save(); 
				ServerSocket.changeStatusBusy({id: tech._id, busy: tech.busy}); 
				return; 
			}

			tech.responded_orders[index].status = enumOrder.OPEN; 
			tech.responded_orders[index].save(); 
			tech.save(); 

			self.pulseSolicitationAlert(id); 
			
			ServerSocket.changeStatusBusy({id: tech._id, busy: tech.busy}); 
			ServerSocket.pulseSolicitationAlert(tech.responded_orders[index])

			var buildMsg = "Você cancelou a ordem de serviço. Não recomendamos o cancelamento de uma ordem, pois o cliente é informado que um técnico já está a caminho.\n";
			buildMsg    += "Portanto, os cancelamentos são registrados na sua conta e seu comportamento é analisado pela equipe do DeliveryPc."; 
			buildMsg    += "Atualmente o seu número de cancelamentos é de "+ tech.count_cancel; 
			bot.sendMessage(id,buildMsg); 

			Client.findOne({
				_id: tech.responded_orders[index].client 
			}).
			select('gcm_key').
			exec(function(error, client){
				if(error){
					consle.log("Error ao enviar pushNotification /cancelar"); 
				}
				GoogleCloudMessageHandler.pulseCancelSolicitation(client.gcm_key); 
			}); 
			
		}); 

	}); 
};

DeliveryPcBotHandler.prototype.pulseSolicitationAlert = function(exceptTelegramId){
	var self = this; 

	Technician.find({
		active: true, 
		busy: false
	}).
	select('telegram_id').
	exec(function(error,technicians){
		if(error)
			return false; 

		var buildMsg ="-----Alerta de Solicitação de Assistência técnica.------\n"; 
		buildMsg    +="Deseja se candidatar a essa solicitação?\n"; 
		// buildMsg    +="Complemento do endereço: "+order.address_complement; 
		var bot = self.dpb.getBot(); 

		//Code to keyboard goes here: 
		for(var i = 0; i < technicians.length; i++){
			var id = technicians[i].telegram_id; 

			if(id == exceptTelegramId)
				continue; 

			bot.sendMessage(id, buildMsg, {
				reply_markup:{keyboard: [["/sim"], ["/nao"]]}
			}); 
		}
		return true; 
	}); 
};

DeliveryPcBotHandler.prototype.rememberSolicitationAlert = function(telegramId, order){
	var buildMsg = "Hey, vou te lembrar a localização da sua solicitação.\n"; 
	var bot = this.dpb.getBot(); 

	bot.sendMessage(telegramId,buildMsg); 
	bot.sendLocation(telegramId, order.gps_location.longitude, order.gps_location.latitude); 
};

DeliveryPcBotHandler.prototype.sendVarificationCode = function(telegramId, verificationCode){
	var buildMsg = "Você solicitou um código verificação para alteração de senha, o código é:\n\n"; 
	buildMsg    +=  verificationCode;

	var bot = this.dpb.getBot(); 

	bot.sendMessage(telegramId, buildMsg);  
};

DeliveryPcBotHandler.prototype.sendMessage = function(telegramId, msg){
	var bot = this.dpb.getBot(); 
	bot.sendMessage(telegramId, msg); 
};

DeliveryPcBotHandler.prototype.getBot = function(){
	return this.dpb.getBot(); 
}; 

module.exports = new DeliveryPcBotHandler(); 
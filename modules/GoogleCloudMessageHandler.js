var gcm = require('node-gcm'); 
var tokensConfing = require('../util/tokensConfig'); 

var GoogleCloudMessageHandler = function(){
	this.sender  = gcm.Sender(tokensConfig.GCM_SENDER); 
}; 


GoogleCloudMessageHandler.prototype.pulseAcceptSolicitation = function(gcmKey){
	var message = this.preFabMessage(); 
	message.addData('message', 'A sua solicitação foi encaminhada para um técnico.'); 

	var tokens = new Array(); 
	tokens.push(gcmKey); 

	this.sender.send(message,{registrationTokens : tokens }, function(error, response){
		if(error) console.error(error);
  		else    console.log(response);
	});  
}; 

GoogleCloudMessageHandler.prototype.sendMessage = function(gcmKey, msg){
	var message = this.preFabMessage(); 
	message.addData('message', msg); 

	var tokens = new Array(); 
	tokens.push(gcmKey); 

	this.sender.send(message,{registrationTokens : tokens }, function(error, response){
		if(error) console.error(error);
  		else    console.log(response);
	}); 
};

GoogleCloudMessageHandler.prototype.pulseCancelSolicitation = function(gcmKey){
	var message = this.preFabMessage(); 
	message.addData('message', 'Desculpa, mas a sua solicitação será remanejada para outro técnico. Aguardo por mais alguns minutos.'); 

	var tokens = new Array(); 
	tokens.push(gcmKey); 

	this.sender.send(message,{registrationTokens : tokens }, function(error, response){
		if(error) console.error(error);
  		else    console.log(response);
	}); 
};

GoogleCloudMessageHandler.prototype.preFabMessage = function(){
	var message = gcm.Message(); 
	message.addData('title','DeliveryPc'); 
	return message; 
}; 

module.exports = new GoogleCloudMessageHandler(); 
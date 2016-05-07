var TelegramBot  = require('node-telegram-bot-api'); 
var util         = require('util'); 
var events		 = require('events'); 
var tokensConfing = require('../util/tokensConfig'); 

var DeliveryPcBot = function(){ 
	this.token = tokensConfig.TELEGRAM; 
	this.bot   = new TelegramBot(this.token, {polling: true});
}	


DeliveryPcBot.prototype.registerService = function(){
	var self = this; 
	//handling requets.
	var bot = this.bot; 

	//register
	bot.onText(/\/start/, function(msg, match){
		var sendTo = msg.chat.id;  
		console.log("start"); 
		self.emit('start', bot,sendTo,match[1]); 
	});

	//register
	bot.onText(/\/registrar (.+)/, function(msg, match){
		var sendTo = msg.chat.id;  
		console.log("register"); 
		self.emit('registrar', bot,sendTo,match[1]); 
	});

	//help
	bot.onText(/\/ajuda/, function(msg, match){
		var sendTo = msg.chat.id; 
		self.emit('ajuda', bot, sendTo, match[1]); 
		console.log('ajuda'); 
	});

	//confirm a solicitation
	bot.onText(/\/sim/, function(msg, match){
		var sendTo = msg.chat.id; 
		self.emit('sim', bot, sendTo, match[1]); 
		console.log('sim'); 
	});

	//desapprove a solicitation
	bot.onText(/\/nao/, function(msg, match){
		var sendTo = msg.chat.id; 
		self.emit('nao', bot, sendTo, match[1]); 
		console.log('nao'); 
	});

	//cancel an solicitation when once it was approve. 
	bot.onText(/\/cancelar/, function(msg, match){
		var sendTo = msg.chat.id; 
		self.emit('cancelar', bot, sendTo, match[1]); 
		console.log('cancelar'); 
	});

	console.log("Bot up");   
}

DeliveryPcBot.prototype.getBot = function(){
	return this.bot; 
}

util.inherits(DeliveryPcBot,events.EventEmitter);

module.exports = DeliveryPcBot; 

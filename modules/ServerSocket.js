var Server                  = require('socket.io'); 
var AuthenticateHashFactory = require('../util/AuthenticateHashFactory');  

var ServerSocket = function(){
	this.io; 
}; 

ServerSocket.prototype.init = function(app){
	this.io  = io = new Server(app); 
	var self = this; 

	io.on('connection', function(socket){
		self.setCommonBehaviorSocket(socket); 
	}); 
	console.log('ServerSocket up'); 
}; 

ServerSocket.prototype.setCommonBehaviorSocket = function(socket){
	//handler follow targets: 
	// 	*auth; 
	//  *rmSolicitation; 

	socket.on('auth', function(data){
		if(!AuthenticateHashFactory.exists(data.authToken)){
			socket.disconnect(); 
			return; 
		}

		socket._auth = true; 
		socket._id   = data.id; 
		console.log('Authenticated'); 
		socket.emit("signed"); 
	}); 

	socket.on('rmSolicitation', function(data){

	}); 
}; 

ServerSocket.prototype.pulseSolicitationAlert = function(order){
	var package = {
		id           : order._id,
		creation_date: order.creation_date
	}; 
	this.io.emit('pulseNewSolicitationAlert', package); 
}; 

ServerSocket.prototype.pulseSolicitationRemove = function(id){
	this.io.emit('pulseRemoveSolicitation',{id: id}); 
}; 

ServerSocket.prototype.changeStatusBusy = function(data){
	var connected = this.io.sockets.connected; 

	for(var key in connected){
		console.log(connected[key]._id); 
		if(connected[key]._id == data.id)
			connected[key].emit('changeStatusBusy',{busy: data.busy});
	}
};

module.exports = new ServerSocket(); 
var sha256 = require('crypto-js/sha256'); 

var AuthenticateHashFactory = function(){
	this.hashStore = new Array(); 

	var self = this; 
	//auto clean system: 
	setInterval(function(){
		self.hashStore = new Array(); 
	}, 1000 * 60 * 60 * 12)//twelve hours

}; 

AuthenticateHashFactory.prototype.create = function(){
	var randomValue = (Math.random() * 10000000); 
	var newHash     = sha256(new Date()	+ randomValue ).toString(); 
	this.hashStore.push(newHash); 

	return newHash;   
}; 

AuthenticateHashFactory.prototype.remove = function(hashTarget){
	var index = this.hashStore.indexOf(hashTarget); 

	if(index == -1)
		return false;
	
	this.hashStore.splice(index,1); 
	return true;  
}; 

AuthenticateHashFactory.prototype.exists = function(hashTarget){
	var index = this.hashStore.indexOf(hashTarget); 
	console.log("here "+ index); 
	console.log(this.hashStore); 
	if(index == -1)
		return false; 

	this.remove(hashTarget); 
	return true; 
}; 

module.exports =  new AuthenticateHashFactory(); 
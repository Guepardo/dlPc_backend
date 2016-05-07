var security; 

security = function(req, res, next){
	console.log(new Date()); 
	next(); 
}

module.exports = security; 
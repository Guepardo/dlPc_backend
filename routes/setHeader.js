var setHeader; 

setHeader = function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin','*');
	next(); 
}

module.exports = setHeader; 
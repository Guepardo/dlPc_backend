var Util = function(){}

Util.prototype.hasEmpty = function(array){
	if( !(array instanceof Array) ) 
		return true; 

	for(var i = 0; i < array.length; i++ )
		if(array[i] == null || typeof array[i] == 'undefined' || array[i] == '')
			return true; 
	
	return false;
}

Util.prototype.dateFormat = function(date){
	if( !(date instanceof Date) ) 
		return "Not a date"; 

	return date.toISOString().replace(/T/, ' ').replace(/\..+/, ''); 
}

module.exports = Util; 
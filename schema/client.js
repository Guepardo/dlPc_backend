var mongoose = require('mongoose'); 

var clientSchema = mongoose.Schema({
	dd     : {type: Number, required: true}, 
	phone  : {type: String, required: true, unique: true}, 
	gcm_key:  String, // Google Cloud Message Key
	api_key:  String, // Auto Generated Key
	validated: {type: Boolean, required: true},
	date_register: {type: Date, required: true }
	// history:[
	// 	{type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true}
	// ]
}); 

var Client = mongoose.model('Client', clientSchema); 
module.exports = Client; 
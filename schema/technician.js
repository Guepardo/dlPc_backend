var mongoose = require('mongoose'); 

var technicianSchema = mongoose.Schema({
	dd               : {type: Number, required: true}, 
	phone            : {type: String, required: true, unique: true}, 
	name             : {type: String, required: true}, 
	// telegram_id      : {type: String, required: true, unique: true}, 
	telegram_id      : {type: String, required: true },//debug 
	email            : {type: String, unique: true },//debug 
	password         :  String, 
	date_creation    : {type: Date   , required: true}, 
	active		     : {type: Boolean, required: true},
	busy             : {type: Boolean, default : false}, 
	count_cancel     : {type: Number , default : 0}, 
	verification_code: {type: String , default : ''},//for password recovery; 
	responded_orders:[
		{type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }
	]
}); 

var Technician = mongoose.model('Technician', technicianSchema); 
module.exports = Technician; 
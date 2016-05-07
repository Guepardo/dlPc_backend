var mongoose = require('mongoose'); 

var orderSchema = mongoose.Schema({
	address_complement: {type: String, required: true}, 
	gps_location : {
		latitude : {type: Number, required: true}, 
		longitude: {type: Number, required: true}
	}, 
	client: {type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
	status: {type: String, required: true}, 
	creation_date: {type : Date, required: true}, 
	conclusion_date: Date
}); 

var Order = mongoose.model('Order', orderSchema); 
module.exports = Order; 
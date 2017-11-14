const mongoose = require('mongoose');
let WpUserSchema = new mongoose.Schema({
	wpUserId: String,
	wpUrl: {type: String, unique: true, required: true, dropDups: true},
	wpUserName: String,
	wpPassword: String,
	status: Boolean,
	createdDate: {
		type: Date, 
		default: new Date()
	},
	updateDate: {
		type: Date, 
		default: new Date()
	}	
});
mongoose.model('WpUser', WpUserSchema);
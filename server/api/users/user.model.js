const mongoose = require('mongoose');
let UserSchema = new mongoose.Schema({
	firstName: String,
	lastName: String,
	role: Number,
	email: {type: String, unique: true, required: true},
	secondaryEmail: {type: String, unique: true, required: true},
	shortUserId: {type: String, unique: true, required: true},
	password: String,
	googleAuths: Object,
	lastLoggedIn: { type: Date },
	createdDate: {
		type: Date, 
		default: new Date()
	},
	updateDate: {
		type: Date, 
		default: new Date()
	},
	loginCount: Number,
	freeUser: Boolean
});
mongoose.model('User', UserSchema);
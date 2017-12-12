const mongoose = require('mongoose');
let BillingSchema = new mongoose.Schema({
	salesIds: Object,
	selectedProduct: Object,
	userId: String,
	totalWpUrls: Number,
	totalExports: Number,
	recurrenceBilling: Boolean,
	createdDate: {
		type: Date, 
		default: new Date()
	},
	updateDate: {
		type: Date, 
		default: new Date()
	}
});
mongoose.model('Billings', BillingSchema);
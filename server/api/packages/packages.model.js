const mongoose = require('mongoose');
let PackageSchema = new mongoose.Schema({
	shortPackageId: String,
	monthlyTCOProductId: String,
	yearlyTCOProductId: String,
	monthlyPaypalBillingId: String,
	yearlyPaypalBillingId: String,
	monthlyPaddleProductId: String,
	yearlyPaddleProductId: String,
	name: String,
	description: String,
	cost: Number,
	validityPeriod: Number,
	annualCost: Number,
	priorityLevel: Number,
	maxUrls: Number,
	maxExports: Number,
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
mongoose.model('Package', PackageSchema);
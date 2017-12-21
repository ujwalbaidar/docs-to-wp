const mongoose = require('mongoose');
let PackageSchema = new mongoose.Schema({
	shortPackageId: String,
	monthlyProductId: String,
	yearlyProductId: String,
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
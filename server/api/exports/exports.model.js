const mongoose = require('mongoose');
let ExportSchema = new mongoose.Schema({
	userId: String,
	docFileId: String,
	docFileTitle: String,
	wpId: String,
	wpType: String,
	publishType: String,
	wpUrl: String,
	createdDate: {
		type: Date, 
		default: new Date()
	},
	updateDate: {
		type: Date, 
		default: new Date()
	}
});
mongoose.model('Export', ExportSchema);
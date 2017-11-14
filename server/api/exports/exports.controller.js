const mongoose = require('mongoose');
const Export = mongoose.model('Export');

const getExportLists = (req, res)=>{
	if(req.headers && req.headers.userId){
		getExports({userId: req.headers.userId})
			.then(exportsResp=>{
				res.status(200).json({success:true, data: exportsResp, message: 'Export List retrieved successfully!'});
			})
			.catch(exportsErr=>{
				res.status(400).json({success: false, data: exportsErr, message: 'Failed to retrieve export list!'});
			})
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
	
}

const getExports = (query)=>{
	return new Promise((resolve, reject)=>{
		Export.find(query, (exportsErr, exportsResp)=>{
			if(exportsErr){
				reject(exportsErr);
			}else{
				resolve(exportsResp);
			}
		});
	});
}

module.exports = {
	getExportLists
}

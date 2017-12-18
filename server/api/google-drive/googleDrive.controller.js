const mongoose = require('mongoose');
const User = mongoose.model('User');
const Export = mongoose.model('Export');
const Billings = mongoose.model('Billings');
const GoogleDriveLib = require('../../library/googleApi/googleDrive');
const tidy = require('htmltidy').tidy;

const listDriveFiles = (req, res)=>{
	if(req.headers && req.headers.userId){
		let userId = mongoose.Types.ObjectId(req.headers.userId);
		getDbUser({_id: userId})
			.then(userInfo=>{
				if(userInfo.length>0){
					let userGoogleAuthObj = userInfo[0]['googleAuths'];
					let qs = {};
						qs = { 
							q: `mimeType = 'application/vnd.google-apps.document' and trashed = false`,
							orderBy: 'lastViewedByMeDate desc',
							maxResults: 10
						};
						
						if(req.query && req.query.queryVal){
							qs.q = `${qs.q} and title contains '${req.query.queryVal}'`;
						}

						let oAuthOptions = {
							clientId: config['google']['client_id'],
							clientSecret: config['google']['client_secret'],
						};
						
						let googleDriveLib = new GoogleDriveLib(oAuthOptions);
						googleDriveLib.listFiles(userGoogleAuthObj.access_token, userGoogleAuthObj.refresh_token, qs)
							.then(driveFiles=>{
								res.status(200).json({success: true, data: driveFiles, message: 'successfully retrieved drive files!'});
							})
							.catch(driveFilesErr=>{
								res.status(400).json({success: false, data: driveFilesErr, message: driveFilesErr.error.message || 'failed to retriev drive files!'});
							});
				}else{
					res.status(401).json({success:false, data: {}, message: 'Failed to get user details'});
				}
			})
			.catch(userInfoErr=>{
				res.status(400).json({status: true, data: userInfoErr, message: 'Failed to get user information'});
			});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
	
}

const checkAllowExports = (userId)=>{
	return new Promise((resolve, reject)=>{
		Billings.findOne({userId: userId}, (err, userBilling)=>{
			if(err){
				reject(err);
			}else{
				let maxExports = userBilling.selectedProduct.maxExports;
				let totalExports = userBilling.totalExports;
				if(maxExports === 1000 || (maxExports>userBilling.totalExports)){
					resolve(true);
				}else{
					resolve(false);
				}
			}
		});
	});
}

const exportDriveFile = (req, res)=>{
	if(req.headers && req.headers.userId){
		let userId = req.headers.userId;
		let docObj = req.body;
		checkAllowExports(userId)
			.then(allowExports=>{
				if(allowExports === true){
					getDbUser({_id: userId})
						.then(userInfo=>{
							if(userInfo.length>0){
								let oAuthOptions = {
									clientId: config['google']['client_id'],
									clientSecret: config['google']['client_secret'],
								};
								let accessToken = userInfo[0]['googleAuths']['access_token'];
								let refreshToken = userInfo[0]['googleAuths']['refresh_token'];
								let qs = { mimeType: 'text/html', alt: 'media' };
								let googleDriveLib = new GoogleDriveLib(oAuthOptions);
								googleDriveLib.getDriveFile(accessToken, refreshToken, docObj.fileId, qs)
									.then(driveFile=>{
										let opts = {
										    'show-body-only': true,
										};
										tidy(driveFile, opts, (err, htmlData)=>{
											docObj.htmlData = htmlData;
											res.status(200).json({ success: true, data: docObj, message: 'Drive Data!!'});
										});
									})
									.catch(driveFileErr=>{
										res.status(400).json({success: false, data: driveFileErr, message: driveFileErr || 'failed to retriev file contents!'});
									});
							}else{
								res.status(401).json({success:false, data: {}, message: 'Failed to get user details'});
							}
						})
						.catch(userInfoErr=>{
							res.status(400).json({status: true, data: userInfoErr, message: 'Failed to get user information.'});
						});
				}else{
					res.status(200).json({status: false, data: {}, message: 'You have reached maximum exports.'})
				}
			})
			.catch(allowExportsErr=>{
				res.status(400).json({status: false, data: allowExportsErr, message: 'Failed to check exports count.'});
			});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
}

const getDbUser = (query)=>{
	return new Promise((resolve, reject)=>{
		User.find(query, (userErr, userInfo)=>{
			if(userErr){
				reject(userErr);
			}else{
				resolve(userInfo);
			}
		});
	});
}

module.exports = {
	listDriveFiles,
	exportDriveFile
}
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const WpUser = mongoose.model('WpUser');
const Export = mongoose.model('Export');
const Billings = mongoose.model('Billings');
const GoogleDriveLib = require('../../library/googleApi/googleDrive');
const WpApiLib = require('../../library/wordpressApi/wordpressApi');
const CryptoLib = require('../../library/crypto/cryptoLib');
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
										filterHtmlObj(driveFile)
											.then(htmlText=>{
												createWpPost(userId, docObj, htmlText)
													.then((createPostResp) => {
														let saveObj = {
															userId: userId,
															docFileId: docObj.fileId,
															docFileTitle: docObj.title,
															wpId: createPostResp.wpId,
															wpType: docObj.exportMethod,
															publishType: "Draft",
															wpUrl: createPostResp.wpUrl
														};
														createExportsInfo(saveObj, userId)
															.then(exportCreateResp=>{
																res.status(200).json({ success: true, data: exportCreateResp, message: 'Document created in wordpress successfully'});
															})
															.catch(exportCreateErr=>{
																res.status(400).json({ success: false, data: exportCreateErr, message: 'Failed to create document info in database.'});
															});
													})
													.catch(createPostErr=>{
														res.status(400).send({ success: false, data: createPostErr, message: 'Failed to create document in wordpress.'});
													});
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

const createWpPost = (userId, docObj, wpContent)=>{
	return new Promise((resolve, reject)=>{
		getWpDbuser({wpUserId: userId})
			.then(wpUserInfo=>{
				let cryptoObj = {
					cryptoAlgorithm: config['wp']['cryptoAlgorithm'],
					cryptoSecret: config['wp']['cryptoSecret']
				};
				
				let cryptoLib = new CryptoLib(cryptoObj);
				cryptoLib.decryptString(wpUserInfo[0]['wpPassword'])
					.then(decryptedPassword=>{
						let wpOptions = {
						    url: wpUserInfo[0]['wpUrl'],
						    username: wpUserInfo[0]['wpUserName'],
						    password: decryptedPassword
						};
						let wpApiLib = new WpApiLib();
						
						let wpContentData = {
							title: docObj.title,
							content: wpContent
						};
						wpApiLib.exportDocToWp(wpOptions, wpContentData, docObj.exportMethod)
							.then(wpPostResponse=>{
								let wpPostResponseObj = {
									wpId: wpPostResponse,
									wpUrl: wpOptions.url
								};
								resolve(wpPostResponseObj);
							})
							.catch(wpPostErr=>{
								reject(wpPostErr);
							});
					});
			})
			.catch(wpUserInfoErr=>{
				reject(wpUserInfoErr)
			});
	});
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

const getWpDbuser = (query)=>{
	return new Promise((resolve, reject)=>{
		WpUser.find(query, (wpUserErr, wpUserInfo)=>{
			if(wpUserErr){
				reject(wpUserErr);
			}else{
				resolve(wpUserInfo);
			}
		});
	});
}

const filterHtmlObj = (htmlContent)=>{
	return new Promise((resolve, reject)=>{
		var $ = cheerio.load(htmlContent, {ignoreWhitespace: true, useHtmlParser2: true});
		$('*').removeAttr('style');
		$('*').removeAttr('id');
		$('*').removeAttr('class');
		let htmlElement = $.html();
		htmlElement.replace(/[<]br[^>]*[>]/gi,"");
		// var bodyContents = htmlElement.split('<body>');
		// bodyContents = bodyContents[1].replace(/[&]nbsp[;]/gi," ").replace(/[<]br[^>]*[>]/gi,"").replace('</body>','').replace('</html>','');
		let opts = {
		    'doctype': 'html5',
		    'hideComments': false,
		    'indent': false,
		    'show-body-only': true
		};
		
		tidy(htmlElement, opts, (err, htmlData)=>{
			resolve(htmlData);
		})
	});
}

const createExportsInfo = (saveObj, userId)=>{
	return new Promise((resolve, reject)=>{
		let wpExport = new Export(saveObj);
		wpExport.save((err, exportInfo)=>{
			if(err){
				reject(err);
			}else{
				let updateObj = {
					updateDate: new Date(),
					$inc: {totalExports: 1}
				};
				updateUserBilling({userId: userId}, updateObj)
					.then(billingUpdateResp=>{
						resolve(billingUpdateResp);
					})
					.catch(billingUpdateErr=>{
						reject(billingUpdateErr);
					});
			}
		});
	});
}

const updateUserBilling = (updateQuery, updateObj)=>{
	return new Promise((resolve, reject)=>{
		Billings.update(updateQuery, updateObj, (err, billingUpdateResp)=>{
			if(err){
				reject(err);
			}else{
				resolve(billingUpdateResp);
			}
		});
	});
}

module.exports = {
	listDriveFiles,
	exportDriveFile
}
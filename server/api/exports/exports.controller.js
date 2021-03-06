const mongoose = require('mongoose');
const Export = mongoose.model('Export');
const cheerio = require('cheerio');
const tidy = require('htmltidy').tidy;
const WpUser = mongoose.model('WpUser');
const WpApiLib = require('../../library/wordpressApi/wordpressApi');
const CryptoLib = require('../../library/crypto/cryptoLib');
const Billings = mongoose.model('Billings');

var wordpress = require( "wordpress" );
var request = require('request').defaults({ encoding: null });
const shortid = require('shortid');
const Jimp = require("jimp");

const getExportLists = (req, res)=>{
	if(req.headers && req.headers.userId){
		getExports({userId: req.headers.userId}, {})
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

const getExports = (query, projection)=>{
	return new Promise((resolve, reject)=>{
		Export.find(query).sort({createdDate:-1, _id: -1}).exec((exportsErr, exportsResp)=>{
			if(exportsErr){
				reject(exportsErr);
			}else{
				resolve(exportsResp);
			}
		});
	});
}

const exportDocToWp = (req, res)=>{
	if(req.headers && req.headers.userId){
		let docObj = req.body;
		let userId = req.headers.userId;
		filterHtmlObj(req.body.htmlData, userId, docObj)
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
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
}

const filterHtmlObj = (htmlContent, userId, docObj)=>{
	return new Promise((resolve, reject)=>{
		var $ = cheerio.load(htmlContent, {ignoreWhitespace: true, useHtmlParser2: true});
		$('*').removeAttr('style');
		$('*').removeAttr('id');
		$('*').removeAttr('class');
		var images = $('*').children('img').map(function(){
		    return $(this).attr('src');
		}).get();
		if(images.length>0){
			uploadWpMedia(images, userId, docObj)
				.then(imageEl =>{
					$('*').find('img').each(function(index){
						if(imageEl[$(this).attr('src')]){
							$(this).attr('src', imageEl[$(this).attr('src')])
						}
					});

					let htmlElement = $.html();

					htmlElement.replace(/<\/?span[^>]*>/g,"").replace(/[<]br[^>]*[>]/gi,"")
					let opts = {
					    'doctype': 'html5',
					    'gdoc': true,
					    'hideComments': false,
					    'indent': false,
					    'show-body-only': true,
					    'wrap': 0,
					    'anchor-as-name': false,
					    'quote-nbsp': false,
					    'drop-empty-elements': true,
					    'drop-empty-paras': true
					};
					tidy(htmlElement, opts, (err, htmlData)=>{
						resolve(htmlData);
					});
				});
		}else{
			let htmlElement = $.html();
			htmlElement.replace(/<\/?span[^>]*>/g,"").replace(/[<]br[^>]*[>]/gi,"")
			let opts = {
			    'doctype': 'html5',
			    'gdoc': true,
			    'hideComments': false,
			    'indent': false,
			    'show-body-only': true,
			    'wrap': 0,
			    'anchor-as-name': false,
			    'quote-nbsp': false,
			    'drop-empty-elements': true,
			    'drop-empty-paras': true
			};
			tidy(htmlElement, opts, (err, htmlData)=>{
				resolve(htmlData);
			});
		}
		
	});
}

const uploadWpMedia = (mediaArray, userId, docObj)=>{
	let imgArrIndex = [];
	let imgObj = {};
	return new Promise((resolve, reject) => {
		getWpDbuser({wpUserId: userId})
			.then(wpUserInfo=>{
				
				let cryptoObj = {
					cryptoAlgorithm: config['wp']['cryptoAlgorithm'],
					cryptoSecret: config['wp']['cryptoSecret']
				};
				
				let cryptoLib = new CryptoLib(cryptoObj);
				
				if(docObj.wpAccount !== undefined && JSON.stringify(docObj.wpAccount) !== '{}'){
					wpUserInfo[0] = docObj.wpAccount;
				}

				cryptoLib.decryptString(wpUserInfo[0]['wpPassword'])
					.then(decryptedPassword=>{
						let wpOptions = {
						    url: wpUserInfo[0]['wpUrl'],
						    username: wpUserInfo[0]['wpUserName'],
						    password: decryptedPassword
						};

						for(let i=0; i<mediaArray.length; i++){
							/*let imageName = mediaArray[i].split('/').splice(-1,1)[0];
							if(mediaArray[i].indexOf("googleusercontent.com") > -1){
								imageName = imageName+'.jpg';
							}*/
							let imageName = shortid.generate()+'.jpg';
							getGoogleDocsImage(mediaArray[i])
								.then(imageBuffer=>{
									var client = wordpress.createClient(wpOptions);

									let args = {
										name: imageName,
										type: "image/jpg",
										bits: imageBuffer
									};

									client.uploadFile(args, function( error, data ) {
										if(error){
											imgArrIndex.push(i);
										}else{
											imgArrIndex.push(i);
											if(imgObj[mediaArray[i]] == undefined){
												imgObj[mediaArray[i]] = data.link;
											}
										}

										if(imgArrIndex.length == mediaArray.length){
											resolve(imgObj);
										}
									});
								});
						}
					});
			});
	});
}

/**
* if need original quality use request module
* else increase or decrease quality using Jimp module
**/
const getGoogleDocsImage = (imageUrl)=> {
	return new Promise((resolve)=>{
		request.get(imageUrl, (err, res, body) => {
			if(!err && res.statusCode === 200){
				resolve(body)
			}else{
				resolve(imageUrl)
			}
		});
		
		/*Jimp.read(imageUrl, (err, image)=>{
			if(err){
				resolve(imageUrl);
			}else{
				image.quality(60).getBuffer(Jimp.MIME_JPEG, (err, bufferData)=>{
					if(err){
						resolve(imageUrl);
					}else{
						resolve(bufferData);
					}
				})
			}
		});*/
	});
}

const createWpPost = (userId, docObj, wpContent)=>{
	return new Promise((resolve, reject)=>{
		getWpDbuser({wpUserId: userId})
			.then(wpUserInfo=>{
				if(docObj.wpAccount !== undefined && JSON.stringify(docObj.wpAccount) !== '{}'){
					wpUserInfo[0] = docObj.wpAccount;
				}

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
				reject(wpUserInfoErr);
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
	getExportLists,
	exportDocToWp
}

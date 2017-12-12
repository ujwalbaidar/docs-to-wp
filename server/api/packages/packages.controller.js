const mongoose = require('mongoose');
const Package = mongoose.model('Package');
const Billings = mongoose.model('Billings');
const Twocheckout = require('2checkout-node');
const shortid = require('shortid');

const getCheckoutUrl = (req, res, next)=>{
	if(req.headers && req.headers.userId){
		getUserBillingInfo({userId: req.headers.userId}, {})
		.then(billingInfo=>{
			if(billingInfo.length>0){
				let userBilling = billingInfo[0];
				if(userBilling.recurrenceBilling === true){
					res.status(200).json({success: false, data: {}, message: 'Your recurrence billing is already running.'});
				}else{
					retrieveProductInfo(req.query.productId)
						.then(productDetail=>{
							tcoCheckoutUrl(productDetail, req.headers.userId)
								.then(checkoutUrl=>{
									res.status(200).json({success: true, data: checkoutUrl, message: 'Checkout Url generated successfully.'});
								});
						})
						.catch(packageErr=>{
							res.status(400).json({success: false, data: packageErr, message: 'Failed to retrieve selected package information'});
						});
				}
			}else{
				res.status(200).json({success: false, data: {}, message: 'Your Initial Billing Not found. Please contact support team.'});
			}
		})
		.catch(billingErr=>{

		});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
}

const retrieveProductInfo = (productId)=>{
	return new Promise((resolve, reject)=>{
		let tcoOptions = {
			apiUser: config.tco.apiUsername,
			apiPass: config.tco.password,
		    sellerId: config.tco.sellerId,                                    
		    privateKey: config.tco.privateKey,     
		    secretWord: config.tco.secretWord,                                    
		    demo: config.tco.demo,                                             
		    sandbox: config.tco.sandbox                                          
		};

		var tco = new Twocheckout(tcoOptions);
		tco.products.retrieve({product_id: productId}, (err,data)=>{
			if(err){
				reject(err);
			}else{
				resolve(data.product);
			}
		});
	})
}

const tcoCheckoutUrl = (packageInfo, userId)=>{
	return new Promise(resolve=>{
			var tco = new Twocheckout({
			    sellerId: config.tco.sellerId,                                    
			    privateKey: config.tco.privateKey,     
			    secretWord: config.tco.secretWord,                                    
			    demo: config.tco.demo,                                             
			    sandbox: config.tco.sandbox                                          
			});

			var params = {
			    mode: '2CO',
			    li_0_product_id: packageInfo.product_id,
			    li_0_name: packageInfo.name,
			    li_0_price: packageInfo.price,
			    li_0_description: packageInfo.description,
			    li_0_recurrence: packageInfo.recurrence,
			    li_0_duration: packageInfo.duration,
			    userId: userId
			};
			var link = tco.checkout.link(params);
			resolve(link);
	});
}

getUserBillingInfo = (query, projections)=>{
	return new Promise((resolve, reject)=>{
		Billings.find(query, projections, (err, billingInfo)=>{
			if(err){
				reject(err);
			}else{
				resolve(billingInfo);
			}
		})
	});
}

const saveAdminPackages = (req, res) =>{
	if(req.headers && req.headers.role && req.headers.role===30){
		let saveObj = { 
			name: req.body.name,
			description: req.body.description,
			cost: req.body.cost,
			validityPeriod: req.body.validityPeriod,
			annualCost: req.body.annualCost,
			priorityLevel: req.body.priorityLevel,
			maxUrls: req.body.urlCounts,
			maxExports: req.body.exportCounts,
			shortPackageId: shortid.generate(),
			status: true
		};
		createTcoPackage(saveObj)
			.then(tcoResp=>{
				saveObj.productId = tcoResp.product_id;
				savePackage(saveObj)
					.then(packageInfo=>{
						res.status(200).json({success: true, data: packageInfo, message: 'New Package created successfully'});
					})
					.catch(tcoErr=>{
						res.status(400).json({success: false, data: packageErr, message: 'Failed to create new package'});
					});
			})
			.catch(packageErr=>{
				
			});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Request From Unauthrised User!'});
	}
}

const createTcoPackage = (packageArgs)=>{
	return new Promise((resolve, reject)=>{
		let tcoOptions = {
			apiUser: config.tco.apiUsername,
			apiPass: config.tco.password,
		    sellerId: config.tco.sellerId,                                    
		    privateKey: config.tco.privateKey,     
		    secretWord: config.tco.secretWord,                                    
		    demo: config.tco.demo,                                             
		    sandbox: config.tco.sandbox                                          
		};

		var tco = new Twocheckout(tcoOptions);

		args = {
		    name: packageArgs.name,
		    description: packageArgs.description,
		    price: packageArgs.cost,
		    recurring: 1,
		    recurrence: '1 Week',
		    duration: 'Forever'
		};

		tco.products.create(args, function (error, data) {
		    if (error) {
		        reject(error);
		    } else {
		        resolve(data)
		    }
		});
	});
}

const updateAdminPackages = (req, res) =>{
	if(req.headers && req.headers.role && req.headers.role===30){
		let updateQuery = {
			_id: mongoose.Types.ObjectId(req.body._id)
		};

		let updateObj = { 
			name: req.body.name,
			description: req.body.description,
			cost: req.body.cost,
			validityPeriod: req.body.validityPeriod,
			annualCost: req.body.annualCost,
			priorityLevel: req.body.priorityLevel,
			maxUrls: req.body.urlCounts,
			maxExports: req.body.exportCounts,
			updateDate: new Date()
		};

		updatePackage(updateQuery, updateObj)
			.then(packageInfo=>{
				res.status(200).json({success: true, data: req.body, message: 'Package udpated successfully'});
			})
			.catch(packageErr=>{
				console.log(packageErr)
				res.status(400).json({success: false, data: packageErr, message: 'Failed to update package'});
			});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Request From Unauthrised User!'});
	}
}

const savePackage = (saveObj)=>{
	return new Promise((resolve, reject)=>{
		let packages = new Package(saveObj);
		packages.save((err, packageInfo)=>{
			if(err){
				reject(err);
			}else{
				resolve(packageInfo);
			}
		})
	});
}

const updatePackage = (updateQuery, updateObj)=>{
	return new Promise((resolve, reject)=>{
		Package.update(updateQuery, updateObj, (err, updateResp) => {
			if(err){
				reject(err);
			}else{
				resolve(updateResp);
			}
		});
	})
} 

const listPackages = (req, res)=>{
	findPackage({}, {})
		.then(packages=>{
			res.status(200).json({success:true, data: packages, message: 'Package list retrieved successfully.'});
		})
		.catch(packageErr=>{
			res.status(400).json({success: false, data: packageErr, message: 'Failed to retrieve package list'});
		});
}

const getBillingPackages = (req, res)=>{
	if(req.headers && req.headers.userId){
		findPackage({cost:{$gt:0}}, {})
			.then(packages=>{
				res.status(200).json({success:true, data: packages, message: 'Package list retrieved successfully.'});
			})
			.catch(packageErr=>{
				res.status(400).json({success: false, data: packageErr, message: 'Failed to retrieve package list'});
			});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
}

const findPackage = (query, projections)=>{
	return new Promise((resolve, reject)=>{
		Package.find(query, projections, (err, packages)=>{
			if(err){
				reject(err);
			}else{
				resolve(packages);
			}
		})
	});
}

module.exports = {
	getCheckoutUrl,
	saveAdminPackages,
	updateAdminPackages,
	listPackages,
	getBillingPackages
}
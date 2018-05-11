const mongoose = require('mongoose');
const Package = mongoose.model('Package');
const Billings = mongoose.model('Billings');
const Twocheckout = require('2checkout-node');
const shortid = require('shortid');
const paypal = require('paypal-rest-sdk');
const url = require('url');
const request = require('request');

const getCheckoutUrl = (req, res, next)=>{
	if(req.headers && req.headers.userId){
		getUserBillingInfo({userId: req.headers.userId}, {})
			.then(billingInfo=>{
				if(billingInfo.length>0){
					let queryData = req.query;
					// need to put payment methods in database or in file and use const id value for following case
					if(queryData.paymentMethod === 'paypal'){
						let billingId = queryData.productId;
						getPaypalUrl(billingId, queryData)
							.then(paypalUrl=>{
								res.status(200).json({success: true, data: paypalUrl, message: 'Checkout Url generated successfully.'});
							})
							.catch(paypalUrlErr=>{
								res.status(400).json({success: false, data: paypalUrlErr, message: 'Failed to retrieve selected package information'});
							});
					}else if(queryData.paymentMethod === 'twoCheckout'){
						let productId = queryData.productId;
						retrieveProductInfo(productId)
							.then(productDetail=>{
								tcoCheckoutUrl(productDetail, req.headers.userId)
									.then(checkoutUrl=>{
										res.status(200).json({success: true, data: checkoutUrl, message: 'Checkout Url generated successfully.'});
									});
									paypalCheckoutUrl(productDetail, req.headers.userId)
										.then(checkoutUrl=>{
											res.status(200).json({success: true, data: checkoutUrl, message: 'Checkout Url generated successfully.'});
										});
							})
							.catch(packageErr=>{
								res.status(400).json({success: false, data: packageErr, message: 'Failed to retrieve selected package information'});
							});
					}else if(queryData.paymentMethod === 'paddle'){
						let productId = queryData.productId;
						getPaddleUrl(productId, queryData)
							.then(paddleUrl=>{
								res.status(200).json({success: true, data: paddleUrl, message: 'Checkout Url generated successfully.'});
							})
							.catch(paddleUrlErr=>{
								res.status(400).json({success: false, data: paddleUrlErr, message: 'Failed to retrieve selected package information'});
							});
					}else{
						res.status(500).send({msg:'Payment Method is not defined for this action.'});
					}
					// let userBilling = billingInfo[0];
					// if(userBilling.recurrenceBilling === true){
					// 	res.status(200).json({success: false, data: {}, message: 'Your recurrence billing is already running.'});
					// }else{
					// 	retrieveProductInfo(req.query.productId)
					// 		.then(productDetail=>{
					// 			tcoCheckoutUrl(productDetail, req.headers.userId)
					// 				.then(checkoutUrl=>{
					// 					res.status(200).json({success: true, data: checkoutUrl, message: 'Checkout Url generated successfully.'});
					// 				});
					// 				paypalCheckoutUrl(productDetail, req.headers.userId)
					// 					.then(checkoutUrl=>{
					// 						res.status(200).json({success: true, data: checkoutUrl, message: 'Checkout Url generated successfully.'});
					// 					});
					// 		})
					// 		.catch(packageErr=>{
					// 			res.status(400).json({success: false, data: packageErr, message: 'Failed to retrieve selected package information'});
					// 		});
					// }
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

const client_id = config.paypal.client_id;
const client_secret = config.paypal.client_secret;

const getPaypalUrl = (billingPlanId, queryData)=>{
	return new Promise((resolve, reject)=>{
		let aggrementIndex = [];
		let aggrementUrl = '';

		getPaypalPackage(billingPlanId, queryData.payBill)
			.then(billingInfo=>{
				getPaypalBillingPlan(billingPlanId)
					.then(paypalBillingPlanDetails=>{
						createBillingAgreement(billingPlanId, billingInfo)
							.then(aggrementDetails=>{
								for(let i=0; i<aggrementDetails.links.length; i++){
									aggrementIndex.push(i);
									if(aggrementDetails.links[i]['method'] === 'REDIRECT'){
										aggrementUrl = aggrementDetails.links[i]['href'];
									}

									if(aggrementDetails.links.length === aggrementIndex.length){
										if(aggrementUrl === ''){
											reject({msg: 'Failed to get Paypal Aggrement Redirect URL.'});
										}else{
											resolve(aggrementUrl);
										}
									}
								}
							})
							.catch(aggrementErr=>{
								reject(aggrementErr);
							});
					})
					.catch(billingPlanErr=>{
						reject(billingPlanErr)
					});
			})
			.catch(packageErr=>{
				reject(packageErr);
			});
	});
}

const getPaypalPackage = (billingPlanId, paymentPlan)=>{
	return new Promise((resolve, reject)=>{
		if(paymentPlan === 'yearly'){
			var queryObj = {
				yearlyPaypalBillingId: billingPlanId
			};
		}else{
			var queryObj = {
				monthlyPaypalBillingId: billingPlanId
			};
		}

		Package.find(queryObj, (packageErr, packageDetail)=>{
			if(packageErr){
				reject(packageErr);
			}else{
				if(packageDetail.length>0){
					resolve(packageDetail[0]);
				}else{
					reject({msg:'Package not found'});
				}
			}
		});
	});
}

const listBillingPlans = (req, res)=>{
	paypal.configure({
		'mode': 'sandbox',
		"client_id": client_id,
		"client_secret": client_secret
	});

	let list_billing_plan = {
	    'status': 'ACTIVE',
	    'page_size': 20,
	    'total_required': 'yes'
	};

	paypal.billingPlan.list(list_billing_plan, function (error, billingPlan) {
	    if (error) {
	        res.status(400).send(error);
	    } else {
	    	res.status(200).send({data: billingPlan, msg: 'List Billing Plans Response'});
	    }
	});
}

const getPaypalBillingPlan = (billingPlanId)=>{
	return new Promise((resolve, reject)=>{
		paypal.configure({
			'mode': 'sandbox',
			"client_id": client_id,
			"client_secret": client_secret
		});
		paypal.billingPlan.get(billingPlanId, (billingPlanError, billingPlan) => {
            if (billingPlanError) {
                reject(billingPlanError);
            } else {
            	resolve(billingPlan);
            }
        });
	});
}

const createBillingPlans = (req, res)=>{
	
}

const activateBillingPlans = (billingPlanId)=>{
	return new Promise((resolve, reject) =>{
		paypal.configure({
			'mode': 'sandbox',
			"client_id": client_id,
			"client_secret": client_secret
		});

		var billing_plan_update_attributes = [{
	        "op": "replace",
	        "path": "/",
	        "value": {
	            "state": "ACTIVE"
	        }
	    }];

	    paypal.billingPlan.update(billingPlanId, billing_plan_update_attributes, (error, response) => {
	    	if(error){
	    		reject(error);
	    	}else{
	    		paypal.billingPlan.get(billingPlanId, (billingPlanError, billingPlan) => {
                    if (billingPlanError) {
                        reject(billingPlanError);
                    } else {
                    	resolve(billingPlan);
                    }
                });
	    	}
	    });
    });
}

const createBillingAgreement = (billingPlanId, billingPlan)=>{
	return new Promise((resolve, reject)=>{
		let isoDate = new Date();
		isoDate.setSeconds(isoDate.getSeconds() + 4);
		isoDate.toISOString().slice(0, 19) + 'Z';

		let billingAgreementAttributes = {
		    "name": `Agreement for ${billingPlan.name}`,
		    "description": `Agreement for ${billingPlan.description}` || `Billing Plan Agreement`,
		    "start_date": isoDate,
		    "plan": {
		        "id": billingPlanId
		    },
		    "payer": {
		        "payment_method": "paypal"
		    }
		};

		paypal.configure({
			"mode": "sandbox",
			"client_id": client_id,
			"client_secret": client_secret
		});

		paypal.billingAgreement.create(billingAgreementAttributes, (error, billingAgreement) => {
			if(error){
				reject(error);
			}else{
				resolve(billingAgreement);
			}
		});
	});
}

const paypalCheckoutUrl = (packageInfo, userId)=>{
	return new Promise(resolve=>{
		paypal.configure({
			'mode': 'sandbox',
			"client_id": client_id,
			"client_secret": client_secret
		});

		



	});
}
const billingSuccess = (req, res)=>{
	console.log("----------------------------------------------")
	console.log(req.query)
	console.log(req.body)
	console.log(req.params)
	console.log("----------------------------------------------")
	/*paypal.configure({
		'mode': 'sandbox',
		"client_id": client_id,
		"client_secret": client_secret
	});
	let token = req.query.token;
	paypal.billingAgreement.execute(token, {}, (error, billingAgreement) => {
  		if(error) {
        	console.log(error);
    	} else {
	        console.log(billingAgreement);
	        //Billing agreement will have all the information about the agreement.
	        res.json({message:"Successfully created the agreement.", data: billingAgreement})
    	}
  	});*/
}

billingCancel = (req, res)=>{
	console.log(req.params);
	console.log(req.query);
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
			maxUrls: req.body.maxUrls,
			maxExports: req.body.maxExports,
			shortPackageId: shortid.generate(),
			status: true
		};

		let paddlePackage = new Promise((resolve, reject)=>{
			generatePaddlePlan(saveObj)
				.then(paddleBillingObj=>{
					resolve(paddleBillingObj)
				})
		});

		let payalPackage = new Promise((resolve, reject)=>{
			resolve();
			// generatePaypalBilling(saveObj)
			// 	.then(paypalBillingObj=>{
			// 		resolve(paypalBillingObj);
			// 	});
		});

		let tcoPakckage = new Promise((resolve, reject)=>{
			resolve();
			// createTcoPackage(saveObj)
			// 	.then(response=>{
			// 		resolve(response);
			// 	});
		});

		Promise.all([payalPackage, tcoPakckage, paddlePackage])
			.then(response=>{
				if(response && response.length>=1){
					// let paypalResponse = response[0]['productDataArr'];
					// saveObj.monthlyPaypalBillingId = paypalResponse[0]['id'];
					// saveObj.yearlyPaypalBillingId = paypalResponse[1]['id'];

					// let tcoResponse = response[1]['productDataArr'];
					// saveObj.monthlyTCOProductId = tcoResponse[0]['product_id'];
					// saveObj.yearlyTCOProductId = tcoResponse[1]['product_id'];	

					let paddleResponse = response[2]['productDataArr'];
					saveObj.monthlyPaddleProductId = paddleResponse[0]['product_id'];
					saveObj.yearlyPaddleProductId = paddleResponse[1]['product_id'];


					savePackage(saveObj)
						.then(packageInfo=>{
							res.status(200).json({success: true, data: packageInfo, message: 'New Package created successfully'});
						})
						.catch(tcoErr=>{
							res.status(400).json({success: false, data: packageErr, message: 'Failed to create new package'});
						});
				}else{
					res.status(400).json({msg: 'Failed to create package'});
				}
			})
			.catch(packageErr=>{
				res.status(400).json({success: false, data: packageErr, message: 'Failed to create new package'});
			});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Request From Unauthrised User!'});
	}
}

const generatePaypalBilling = (packageArgs)=> {
	return new Promise((resolve, reject)=>{
		let indexArr = [];
		let productDataArr = [];
		let productDataErr = [];

		let payPalConfigObj = {
			"mode": config.paypal.mode,
			"client_id": config.paypal.client_id,
			"client_secret": config.paypal.client_secret
		};

		paypal.configure(payPalConfigObj);

		let payment_definitions = [
	        [{
	        	"name": packageArgs.name,
	        	"type": "REGULAR",
	        	"frequency": "MONTH",
	        	"frequency_interval": "1",
	            "amount": {
	                "value": packageArgs.cost,
	                "currency": "USD"
	            },
	            "cycles": "0"
	        }],[{
	        	"name": packageArgs.name,
	        	"type": "REGULAR",
	        	"frequency": "YEAR",
	        	"frequency_interval": "1",
	            "amount": {
	                "value": packageArgs.annualCost,
	                "currency": "USD"
	            },
	            "cycles": "0"
	        }]
	    ];

	    let merchant_preferences = {
	        "setup_fee": {
	            "value": "0",
	            "currency": "USD"
	        },
	        "return_url": `${config.webHost}/app/packages/billingSuccess`,
	        "cancel_url": `${config.webHost}/app/packages/billingCancel`,
	        "auto_bill_amount": "yes",
	        "initial_fail_amount_action": "CONTINUE",
	        "max_fail_attempts": "1",
	    };

		for(let i=0; i<payment_definitions.length; i++){
			let billingPlanAttributes = {
				"name": `${packageArgs.name} Plan`,
				"description": `Plan for ${packageArgs.description}`,
				"type": "INFINITE",
				"payment_definitions": payment_definitions[i],
			    "merchant_preferences": merchant_preferences,
			};

			paypal.billingPlan.create(billingPlanAttributes, (error, billingPlan) => {
			    if (error) {
					indexArr.push(i);
					productDataErr.push(error);
			        if(indexArr.length === payment_definitions.length){
			        	resolve({productDataArr: productDataArr, productDataErr: productDataErr});
			        }
			    } else {
			    	activateBillingPlans(billingPlan.id)
			    		.then(billingPlanDetail=>{
			    			indexArr.push(i);
							productDataArr.push(billingPlan);
					        if(indexArr.length === payment_definitions.length){
					        	JSON.stringify(productDataArr)
					        	resolve({productDataArr: productDataArr, productDataErr: productDataErr});
					        }
			    		})
			    		.catch(billingPlanDetailError=>{
			    			reject(billingPlanDetailError);
			    		});
			    }
			});
		}
	});
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
		
		let indexArr = [];
		let productDataArr = [];
		let productDataErr = [];

		let args = [{
		    name: packageArgs.name,
		    description: packageArgs.description,
		    price: packageArgs.cost,
		    recurring: 1,
		    recurrence: '1 Month',
		    duration: 'Forever'
		},{
		    name: packageArgs.name,
		    description: packageArgs.description,
		    price: packageArgs.annualCost,
		    recurring: 1,
		    recurrence: '1 Year',
		    duration: 'Forever'
		}];

		for(let i=0; i<2; i++){
			tco.products.create(args[i], function (error, data) {
				indexArr.push(i);
			    if (error) {
			        productDataErr.push(error);
			        if(indexArr.length === 2){
			        	resolve({productDataArr: productDataArr, productDataErr: productDataErr});
			        }
			    } else {
			        productDataArr.push(data);
			        if(indexArr.length === 2){
			        	resolve({productDataArr: productDataArr, productDataErr: productDataErr});
			        }
			    }
			});
		}
	});
}

const generatePaddlePlan = (packageArgs)=>{
	return new Promise((resolve, reject)=>{
		let indexArr = [];
		let productDataArr = [];
		let productDataErr = [];

		let planObj = [{
			'vendor_id': parseInt(config.paddle.vendor_id),
			'vendor_auth_code': config.paddle.app_api_key,
			'plan_name': `${packageArgs.name} Plan`,
			'plan_trial_days': '0',
			'plan_type': 'month',
			'plan_length': '1',
			'main_currency_code': 'USD',
			'initial_price_usd': packageArgs.cost,
			'recurring_price_usd': packageArgs.cost
		},{
			'vendor_id': parseInt(config.paddle.vendor_id),
			'vendor_auth_code': config.paddle.app_api_key,
			'plan_name': `${packageArgs.name} Plan`,
			'plan_trial_days': '0',
			'plan_type': 'year',
			'plan_length': '1',
			'main_currency_code': 'USD',
			'initial_price_usd': packageArgs.annualCost,
			'recurring_price_usd': packageArgs.annualCost
		}];
		for(let i=0; i<planObj.length; i++){
			let postOptions = {
				url: 'https://vendors.paddle.com/api/2.0/subscription/plans_create',
				form: planObj[i]
			};

			request.post(postOptions, (err, httpResponse, body)=>{
				indexArr.push(i);
				if(err){
					productDataErr.push(err);
					if(indexArr.length === planObj.length){
			        	resolve({productDataArr: productDataArr, productDataErr: productDataErr});
			        }
				}else{
					let parseBody = JSON.parse(body);
					productDataArr.push(parseBody.response);
					if(indexArr.length === planObj.length){
			        	resolve({productDataArr: productDataArr, productDataErr: productDataErr});
			        }
				}
			});
		}
     
	});
}

const getPaddleUrl = (planId, queryData)=>{
	return new Promise((resolve, reject)=>{
		let aggrementIndex = [];
		let aggrementUrl = '';
		let postOptions = {
			url: 'https://vendors.paddle.com/api/2.0/product/generate_pay_link',
			form: {
				'vendor_id': parseInt(config.paddle.vendor_id),
				'vendor_auth_code': config.paddle.app_api_key,
				'product_id': planId,
				'return_url': `${config.webHost}/app/packages/billingSuccess`
			}
		};

		request.post(postOptions, (err, httpResponse, body)=>{
			if(err){
				reject(err);
			}else{
				let parseBody = JSON.parse(body);
				let response = parseBody['response'];
				resolve(response.url);
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
			maxUrls: req.body.maxUrls,
			maxExports: req.body.maxExports,
			updateDate: new Date()
		};

		updateTcoPackage(req.body)
			.then(tcoUpdateResponse=>{
				updatePackage(updateQuery, updateObj)
					.then(packageInfo=>{
						res.status(200).json({success: true, data: req.body, message: 'Package udpated successfully'});
					})
					.catch(packageErr=>{
						res.status(400).json({success: false, data: packageErr, message: 'Failed to update package'});
					});
			});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Request From Unauthrised User!'});
	}
}

const updateTcoPackage = (packageArgs)=>{
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
		
		let indexArr = [];
		let productDataArr = [];
		let productDataErr = [];

		let args = [{
			product_id: packageArgs.monthlyProductId,
		    name: packageArgs.name,
		    description: packageArgs.description,
		    price: packageArgs.cost,
		    recurring: 1,
		    recurrence: '1 Month',
		    duration: 'Forever'
		},{
			product_id: packageArgs.yearlyProductId,
		    name: packageArgs.name,
		    description: packageArgs.description,
		    price: packageArgs.annualCost,
		    recurring: 1,
		    recurrence: '1 Year',
		    duration: 'Forever'
		}];

		for(let i=0; i<2; i++){
			tco.products.update(args[i], function (error, data) {
				indexArr.push(i);
			    if (error) {
			        productDataErr.push(error);
			        if(indexArr.length === 2){
			        	resolve({productDataArr: productDataArr, productDataErr: productDataErr});
			        }
			    } else {
			        productDataArr.push(data);
			        if(indexArr.length === 2){
			        	resolve({productDataArr: productDataArr, productDataErr: productDataErr});
			        }
			    }
			});
		}
	});
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
		// findPackage({cost:{$gt:0}}, {})
		findPackage()
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
	getBillingPackages,
	listBillingPlans,
	createBillingPlans,
	billingSuccess,
	billingCancel
}
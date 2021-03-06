const mongoose = require('mongoose');
const Packages = mongoose.model('Package');
const Billings = mongoose.model('Billings');
const Twocheckout = require('2checkout-node');
const request = require('request');

const saveUserBillings = (req, res, next)=>{
	let getPackageQuery = {$or:[{monthlyProductId: req.body.productId},{yearlyProductId: req.body.productId}]};
	getPackage(getPackageQuery, {})
		.then(packageInfo=>{
			let updateObj = { 
				$addToSet: {salesIds: req.body.salesId },
				"selectedProduct.shortPackageId" : packageInfo[0]['shortPackageId'],
		        "selectedProduct.maxExports" : packageInfo[0]['maxExports'],
		        "selectedProduct.maxUrls" : packageInfo[0]['maxUrls'],
		        "selectedProduct.priorityLevel" : packageInfo[0]['priorityLevel'],
		        "selectedProduct.cost" : packageInfo[0]['cost'],
		        "selectedProduct.name" : packageInfo[0]['name'],
		        "recurrenceBilling" : true,
		        updateDate: new Date()
			};

			Billings.update({userId: req.headers.userId}, updateObj, (billingUpdateErr, billingUpdate)=>{
				if(billingUpdateErr){
					res.status(400).json({success: false, data: billingUpdateErr, message: 'Failed to update user billing.'});
				}else{
					res.status(200).json({success: true, data: updateObj, message: 'Billing updated successfully!'});
				}
			});
		})
		.catch(packageErr=>{
			res.status(400).json({success: false, data: packageErr, message: 'Failed to package information from two checkout.'});
		});
}

const getPackage = (query, projection)=>{
	return new Promise((resolve, reject) => {
		Packages.find(query, projection, (err, packageInfo)=>{
			if(err){
				reject(err);
			}else{
				resolve(packageInfo);
			}
		});
	});
}

const listUserBilling = (req, res)=>{
	if(req.headers && req.headers.userId){
		getUserBilling({userId: req.headers.userId}, {_id: 0, salesIds: 1})
			.then(userBillings=>{
				if(userBillings.length>0){
					let billingsSalesIds = userBillings[0]['salesIds'];
					if(billingsSalesIds.length>0){
						getTCOUserSales(billingsSalesIds)
							.then(salesDetails=>{
								res.status(200).json({success: true, data: salesDetails, message: 'User Billing Response retrieved successfully.'});
							});
					}else{
						res.status(200).json({success: false, data: {}, message: 'User Sales Billing not found.'});
					}
				}else{
					res.status(200).json({success: false, data: {}, message: 'Your Initial Billing Not found. Please contact support team.'});
				}
			})
			.catch(userBillingsErr=>{
				console.log(userBillingsErr)
			});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
}

const getUserBilling = (query, projection)=>{
	return new Promise((resolve, reject)=>{
		Billings.find(query, projection, (err, userBilling)=>{
			if(err){
				reject(err);
			}else{
				resolve(userBilling)
			}
		})
	});
}

const getTCOUserSales = (salesIds) =>{
	let sales = [];
	let salesErr = [];
	let counter = [];
	return new Promise((resolve)=>{
		salesIds.map((currentValue, index, array) => {
			let salesId = currentValue;
			args = {
			    sale_id: salesId
			};

			let tcoOptions = {
				apiUser: config.tco.apiUsername,
				apiPass: config.tco.password,
			    sellerId: config.tco.sellerId,                                    
			    privateKey: config.tco.privateKey,     
			    secretWord: config.tco.secretWord,                                    
			    demo: config.tco.demo,                                             
			    sandbox: config.tco.sandbox                                          
			};
			retrieveSales(args, tcoOptions)
				.then(userSales=>{
					counter.push(index);
					sales.push(userSales);
					if(counter.length === salesIds.length){
						resolve({sales:sales, salesErr: salesErr});
					}
				})
				.catch(userSalesErr=>{
					counter.push(index);
					salesErr.push(userSalesErr);
					if(counter.length === salesIds.length){
						resolve({sales:sales, salesErr: salesErr});
					}
				});
		});
	});
}

const getSalesDetail = (req, res)=>{
	if(req.headers && req.headers.userId){
		let userId = req.headers.userId;
		let salesId = req.query.saleId;
		let args = {
			    sale_id: salesId
			};

			let tcoOptions = {
				apiUser: config.tco.apiUsername,
				apiPass: config.tco.password,
			    sellerId: config.tco.sellerId,
			    privateKey: config.tco.privateKey,
			    secretWord: config.tco.secretWord,
			    demo: config.tco.demo,
			    sandbox: config.tco.sandbox
			};
			retrieveSales(args, tcoOptions)
				.then(salesDetails=>{
					res.status(200).json({success:true, data: salesDetails, message: 'sales detail retrieved successfully'});
				})
				.catch(saleErr=>{
					res.status(400).json({success: false, data: saleErr, message: 'Failed to retrieve sales detail'});
				});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
}

const retrieveSales = (args, tcoOptions)=>{
	return new Promise((resolve, reject)=>{
		var tco = new Twocheckout(tcoOptions);
		tco.sales.retrieve(args, function (error, data) {
		    if (error) {
		       	reject(error);
		    } else {
		        resolve(data.sale);
		    }
		});
	});
}

const getUserBillingInfo = (req, res)=>{
	if(req.headers && req.headers.userId){
		getUserBilling({userId: req.headers.userId}, {})
			.then(billingInfo=>{
				res.status(200).json({success: true, data: billingInfo[0], message: 'Billing information retrieved successfully.'});
			})
			.catch(billingInfoErr=>{
				res.status(400).json({successfully: false, data: billingInfoErr, message: 'Failed to retrieve user billing information.'});
			});
	}else{
		res.status(401).json({success:false, data: {}, message: 'Login is Required!'});
	}
}

const handleInsInfo = (req, res)=>{
	let insBody = req.body;
	switch(insBody.message_type){
		case "ORDER_CREATED":
			console.log("ORDER_CREATED")
			break;
		case "RECURRING_INSTALLMENT_SUCCESS":
			recurringInstallmentSuccess(req.body)
				.then(updateResp=>{
					let notificationObj = {
						subject: 'Recurring Installment Success',
						content: `${req.body.message_description}.`
					}
					ioObj.to(socketObj.id).emit('ins-data-obj', notificationObj);
					res.status(200).send('RECURRING_INSTALLMENT_SUCCESS');
				})
				.catch(updateErr=>{
					res.status(400).send('RECURRING_INSTALLMENT_SUCCESS');
				});
			break;
		case "REFUND_ISSUED": 
			let refundIssueNotification = {
				subject: 'Refund Issued',
				content: `${req.body.message_description}.`
			}
			ioObj.to(socketObj.id).emit('ins-data-obj', refundIssueNotification);
			break;
		case "RECURRING_INSTALLMENT_FAILED": 
			let recurringFailedNotification = {
				subject: 'Recurring Installment Success',
				content: `${req.body.message_description}.`
			}
			ioObj.to(socketObj.id).emit('ins-data-obj', recurringFailedNotification);
			res.status(200).send('RECURRING_INSTALLMENT_SUCCESS');
			break;
		case "RECURRING_STOPPED": 
			console.log("RECURRING_STOPPED")
			break;
	}
}

const recurringInstallmentSuccess = (insObj)=>{
	return new Promise((resolve, reject)=>{
		Billings.update({
			salesIds:{
				$in:['insObj.sale_id']
			}
		},{ 
			$set:{
				totalExports: 13,
				updateDate: new Date()
			}
		}, (err, updateResp)=>{
			if(err){
				reject(err);
			}else{
				resolve(updateResp)
			}
		});
	});
}

const listAdminBillings = (req, res)=>{
	if(req.headers && parseInt(req.headers.role) === 30){
		getUserBilling({userId: req.query.userId}, {_id: 0, salesIds: 1})
			.then(userBillings=>{
				if(userBillings.length>0){
					let billingsSalesIds = userBillings[0]['salesIds'];
					if(billingsSalesIds.length>0){
						getTCOUserSales(billingsSalesIds)
							.then(salesDetails=>{
								res.status(200).json({success: true, data: salesDetails, message: 'User Billing Response retrieved successfully.'});
							});
					}else{
						res.status(200).json({success: false, data: {}, message: 'User Sales Billing not found.'});
					}
				}else{
					res.status(200).json({success: false, data: {}, message: 'Your Initial Billing Not found. Please contact support team.'});
				}
			})
			.catch(userBillingsErr=>{
				console.log(userBillingsErr)
			});
	}else{
		res.status(401).json({success:false, data: {}, message: 'You are not authorized for this request.'});
	}
}

module.exports = {
	saveUserBillings,
	listUserBilling,
	getSalesDetail,
	getUserBillingInfo,
	handleInsInfo,
	listAdminBillings
}
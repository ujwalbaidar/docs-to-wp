import { Component, OnInit, Inject } from '@angular/core';
import { PackagesService } from '../../../shared/service/packages.service';
import { BillingsService } from '../../../shared/service/billings.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-packages',
	templateUrl: './packages.component.html',
	styleUrls: ['./packages.component.css']
})
export class PackagesComponent implements OnInit {
	public packages: any;
	public checked: boolean = true;

	constructor(
		public packagesService: PackagesService, 
		private activatedRoute: ActivatedRoute, 
		private router: Router, 
		public snackBar: MatSnackBar,
		public billingService: BillingsService,
		public dialog: MatDialog
	) { }

	ngOnInit() {
		this.activatedRoute.queryParams.subscribe(params => {
			if(params !== undefined && params['salesId'] !== undefined && params['productId'] !== undefined){
				this.saveBilling(params);
			}else{
				this.getPackages();
			}
		}, error=>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 2000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					if(error.status === 401){
						localStorage.removeItem('currentUser');
						this.router.navigate(['/home']);
					}else{
						window.location.reload();
					}
				});
			});
	}

	getCheckoutUrl(packageInfo){
		let dialogRef = this.dialog.open(PaymentTypeSelectDialog, {
			width: '500px'
    	});

	    dialogRef.afterClosed().subscribe(result => {
			if(result && result.cancel === false){
				if(this.checked === true){
					var payBill = 'monthly';
					if(result.paymentType === 'paypal'){
						var productId = packageInfo.monthlyPaypalBillingId;
					}else if(result.paymentType === 'paddle'){
						var productId = packageInfo.monthlyPaddleProductId;
					}else{
						var productId = packageInfo.monthlyTCOProductId;
					}
				}else{
					var payBill = 'yearly';
					if(result.paymentType === 'paypal'){
						var productId = packageInfo.yearlyPaypalBillingId;
					}else if(result.paymentType === 'paddle'){
						var productId = packageInfo.yearlyPaddleProductId;
					}else{
						var productId = packageInfo.yearlyTCOProductId
					}
				}

				this.packagesService.getCheckoutUrl([{productId:productId}, {paymentMethod: result.paymentType}, {payBill: payBill}])
					.subscribe(checkoutUrl=>{
						if(checkoutUrl.success === true){
							window.location.href = checkoutUrl.data;
						}else{
							let msg = checkoutUrl.message;
							let snackBarRef = this.snackBar.open(msg, '',{
								duration: 3000,
							});
						}
					});
			}
	    });
	}

	saveBilling(tcoParams){
		this.billingService.saveBillings(tcoParams)
			.subscribe(saveBillingResp=>{
				if(saveBillingResp.success == true){
					this.router.navigate(['/app/documents']);
				}
			}, error=>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 2000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					if(error.status === 401){
						localStorage.removeItem('currentUser');
						this.router.navigate(['/home']);
					}else{
						window.location.reload();
					}
				});
			});
	}

	getPackages(){
		this.packagesService.getBillingPackages()
			.subscribe(packagesDataObj=>{
				this.packages = packagesDataObj.data;
			}, error =>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 2000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					if(error.status === 401){
						localStorage.removeItem('currentUser');
						this.router.navigate(['/home']);
					}else{
						window.location.reload();
					}
				});
		});
	}

	toggleSlider(){
		if(this.checked === true){
			this.checked = false;
		}else{
			this.checked = true;
		}
	}
}


@Component({
	selector: 'payment-type-select-dialog',
	templateUrl: 'payment-type-select-dialog.html',
})
export class PaymentTypeSelectDialog {
	selectedPayment: string;
	paymentMethods = [
		{ name: 'Two Checkout', value: 'twoCheckout'},
		{ name: 'Paypal', value: 'paypal'},
		{ name: 'Paddle', value: 'paddle'},
	];
	constructor(
		public dialogRef: MatDialogRef<PaymentTypeSelectDialog>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		this.selectedPayment = this.paymentMethods[0]['value'];
	}

	cancelSubmit(): void {
		this.dialogRef.close({ cancel:true, paymentType: {} });
	}

	submitPaymentMethod(){
		this.dialogRef.close({ cancel:false, paymentType: this.selectedPayment });
	}
}
import { Component, OnInit } from '@angular/core';
import { PackagesService } from '../../../shared/service/packages.service';
import { BillingsService } from '../../../shared/service/billings.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
	selector: 'app-packages',
	templateUrl: './packages.component.html',
	styleUrls: ['./packages.component.css']
})
export class PackagesComponent implements OnInit {
	public packages: any;
	constructor(
		public packagesService: PackagesService, 
		private activatedRoute: ActivatedRoute, 
		private router: Router, 
		public snackBar: MatSnackBar,
		public billingService: BillingsService
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

	getCheckoutUrl(productId){
		this.packagesService.getCheckoutUrl([{productId:productId}])
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
}



import { Component, OnInit } from '@angular/core';
import { PackagesService } from '../../../shared/service/packages.service';
import { BillingsService } from '../../../shared/service/billings.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { AuthsService } from '../../../shared/service/auths.service';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
	public packages: any;
	public checked: boolean = true;
	public googleAuthUrl: string;

	constructor(
		public packagesService: PackagesService, 
		private activatedRoute: ActivatedRoute, 
		private router: Router, 
		public snackBar: MatSnackBar,
		public billingService: BillingsService,
		public authsService: AuthsService
	) { }

	ngOnInit() {
		this.getAuthUrls();
		this.getPackages();
	}

	getPackages(){
		this.packagesService.getPackages()
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

	getAuthUrls(){
		this.authsService.getAuthUrls()
			.subscribe(authUrlObj=>{
				if(authUrlObj.success === true){
					this.googleAuthUrl = authUrlObj.data.google;
				}
			}, error =>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 2000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					window.location.reload();
				});
			});
	}
}

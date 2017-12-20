import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingsService } from '../../../shared/service/billings.service';
import { MatSnackBar } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-admin-user-billing-list',
  templateUrl: './admin-user-billing-list.component.html',
  styleUrls: ['./admin-user-billing-list.component.css']
})
export class AdminUserBillingListComponent implements OnInit {
	public userBillings: any;
	public displayedColumns: any;
	public color:string = 'primary';
	public mode:string = 'indeterminate';
	public loading: boolean = true;

	constructor(private route: ActivatedRoute, private router: Router, public billingService: BillingsService, public snackBar: MatSnackBar) { }

	ngOnInit() {
		this.route.params.subscribe(params=>{
			if(params && params['user-id']){
				this.getUserBillings(params['user-id']);
			}else{
				this.router.navigate(['/app/admin-users']);
			}
		});
	}

	getUserBillings(userId){
		this.billingService.listAdminUserBilling([{userId: userId}])
			.subscribe(userBillings=>{
				this.loading = false;
			  	this.displayedColumns = ['saleId', 'datePlaced', 'customerName', 'recurrence', 'recurrenceDecline', 'usdTotal'];
				let billingData = userBillings.data;
				this.userBillings = new AdminUserSalesDataSource(billingData.sales);
			}, error=>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 3000,
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

export interface AdminUserSales {
	saleId: string;
	datePlaced: string;
	customerName: string;
	recurrence: string;
	recurrenceDecline: string;
	usdTotal: string;
}


export class AdminUserSalesDataSource extends DataSource<any> {
	constructor(public salesData){
		super();
	}

	connect(): Observable<AdminUserSales[]> {
		const salesData: AdminUserSales [] = this.salesData;
		return Observable.of(salesData);
		
	}

	disconnect() {}
}
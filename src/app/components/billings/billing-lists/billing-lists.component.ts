import { Component, OnInit } from '@angular/core';
import { BillingsService } from '../../../shared/service/billings.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-billing-lists',
  templateUrl: './billing-lists.component.html',
  styleUrls: ['./billing-lists.component.css']
})
export class BillingListsComponent implements OnInit {
	public userBillings: any;
	public displayedColumns: any;
	public color:string = 'primary';
	public mode:string = 'indeterminate';
	public loading: boolean = true;
	
	constructor(public billingsService: BillingsService, public snackBar: MatSnackBar, private router: Router) { }

	ngOnInit() {
		this.getUserBillings();
	}

	getUserBillings(){
		this.billingsService.listUserBillings()
			.subscribe(userBillings=>{
				this.loading = false;
			  	this.displayedColumns = ['saleId', 'datePlaced', 'customerName', 'recurrence', 'recurrenceDecline', 'usdTotal'];
				let billingData = userBillings.data;
				this.userBillings = new SalesDataSource(billingData.sales);
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

}

export interface Sales {
	saleId: string;
	datePlaced: string;
	customerName: string;
	recurrence: string;
	recurrenceDecline: string;
	usdTotal: string;
}


export class SalesDataSource extends DataSource<any> {
	constructor(public salesData){
		super();
	}

	connect(): Observable<Sales[]> {
		const salesData: Sales [] = this.salesData;
		return Observable.of(salesData);
		
	}

	disconnect() {}
}
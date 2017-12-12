import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingsService } from '../../../shared/service/billings.service';
import { MatSnackBar } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-billing-details',
  templateUrl: './billing-details.component.html',
  styleUrls: ['./billing-details.component.css']
})
export class BillingDetailsComponent implements OnInit {
	public billingDetail: any;
	public productBillings: any;
	public displayedColumns = ['product_id', 'product_description', 'product_cost'];
	public loading: boolean = true;
	public color:string = 'primary';
	public mode:string = 'indeterminate';
	
	constructor(private route: ActivatedRoute, private router: Router, public billingService: BillingsService, public snackBar: MatSnackBar) { }

	ngOnInit() {
		this.route.queryParams.subscribe(params=>{
			if(params && params.sales_id){
				this.getSalesDetail(params.sales_id);
			}else{
				this.router.navigate(['/app/billing']);
			}
		});
	}

	getSalesDetail(saleId){
		this.billingService.getBillingDetails([{saleId:saleId}])
			.subscribe(billingDetail=>{
				this.loading = false;
				this.billingDetail = billingDetail.data;
				this.productBillings = new SalesBillingsDataSource(this.billingDetail.invoices[0]['lineitems']);
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

export interface SalesBiling {
	product_id: string;
	product_description: string;
	product_cost: string;
}


export class SalesBillingsDataSource extends DataSource<any> {
	constructor(public salesBillingData){
		super();
	}

	connect(): Observable<SalesBiling[]> {
		const salesBillingData: SalesBiling [] = this.salesBillingData;
		return Observable.of(salesBillingData);
		
	}

	disconnect() {}
}
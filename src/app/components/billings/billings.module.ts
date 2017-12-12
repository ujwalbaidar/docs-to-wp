import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingsComponent } from './billings/billings.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { BillingDetailsComponent } from './billing-details/billing-details.component';
import { BillingListsComponent } from './billing-lists/billing-lists.component';

const routes: Routes = [
	{ 
		path: '', 
		component: BillingsComponent,
		children: [
			{ path: '', redirectTo: 'lists', pathMatch: 'full' },
			{ path: 'lists', component: BillingListsComponent },
			{ path: 'details', component: BillingDetailsComponent },
	    ]
	}
];

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		RouterModule.forChild(routes)
	],
	declarations: [BillingsComponent, BillingDetailsComponent, BillingListsComponent]
})
export class BillingsModule { }
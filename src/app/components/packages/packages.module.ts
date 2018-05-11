import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackagesComponent, PaymentTypeSelectDialog } from './packages/packages.component';
import { SharedModule } from '../../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule }   from '@angular/forms';

const routes: Routes = [
	{ path: '', component: PackagesComponent },
	{ path: 'billing-response', component: PackagesComponent },
	{ 
		path: '', 
		component: PackagesComponent,
		children: [
			{ path: '', redirectTo: 'lists', pathMatch: 'full' },
			{ path: 'billing-response/:salesId', component: PackagesComponent }
	    ]
	}
];

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		RouterModule.forChild(routes),
		FormsModule
	],
	declarations: [PackagesComponent, PaymentTypeSelectDialog],
	entryComponents: [PaymentTypeSelectDialog]
})
export class PackagesModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdminUserBillingComponent } from './admin-user-billing/admin-user-billing.component';
import { AdminUserBillingListComponent } from './admin-user-billing-list/admin-user-billing-list.component';

const routes: Routes = [
	{ 
		path: '', 
		component: AdminUserBillingComponent,
		children: [
			{ path: 'user-id/:user-id', component: AdminUserBillingListComponent }
	}
];

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		RouterModule.forChild(routes)
	],
	declarations: [
		AdminUserBillingComponent,
		AdminUserBillingListComponent, 
		AdminUserBillingListComponent
	]
})
export class AdminUserBillingModule { }
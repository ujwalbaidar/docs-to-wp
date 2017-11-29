import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule }   from '@angular/forms';

const routes: Routes = [
	{ path: '', component: AdminLoginComponent }
];
@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		FormsModule,
		RouterModule.forChild(routes)
	],
	declarations: [AdminLoginComponent]
})
export class AdminLoginModule { }
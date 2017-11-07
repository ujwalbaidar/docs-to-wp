import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AdminHeaderComponent } from './admin-layout/admin-header/admin-header.component';
import { AdminAsideComponent } from './admin-layout/admin-aside/admin-aside.component';

const routes: Routes = [
	{ path: '', component: AdminLayoutComponent }
];

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		RouterModule.forChild(routes)
	],
	declarations: [AdminLayoutComponent, AdminHeaderComponent, AdminAsideComponent]
})
export class AdminLayoutModule { }

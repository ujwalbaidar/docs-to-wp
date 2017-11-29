import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule }   from '@angular/forms';

import { AdminPackagesComponent, PackageDialog } from './admin-packages/admin-packages.component';

const routes: Routes = [
	{ 
		path: '', 
		component: AdminPackagesComponent
	}
];

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		RouterModule.forChild(routes),
		FormsModule
	],
  	declarations: [AdminPackagesComponent, PackageDialog],
  	entryComponents: [PackageDialog]
})

export class AdminPackagesModule { }
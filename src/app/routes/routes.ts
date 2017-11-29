import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../components/layout/layout/layout.component';
import { AdminLayoutComponent } from '../components/admin-layout/admin-layout/admin-layout.component';

export const routes = [
	{
		path: '',
		component: LayoutComponent,
		children: [
			{ path: '', redirectTo: 'home', pathMatch: 'full' },
			{ path: 'home', loadChildren: '../components/home/home.module#HomeModule' },
			{ path: 'pricing', loadChildren: '../components/pricing/pricing.module#PricingModule' },
			// { path: 'login', loadChildren: '../components/google-auths/google-auths.module#GoogleAuthsModule' },
			{ path: 'wp-admin/login', loadChildren: '../components/admin-login/admin-login.module#AdminLoginModule' },
			{ path: 'app/google-auth/action/:action/loginType/:loginType/:code/:authuser/:prompt/:session_state', loadChildren: '../components/google-auths/google-auths.module#GoogleAuthsModule' },
		]
	},
	{
		path: 'app',
		component: AdminLayoutComponent,
		children: [
			{ path: '', redirectTo: 'documents', pathMatch: 'full' },
			{ path: 'documents', loadChildren: '../components/documents/documents.module#DocumentsModule' },
			{ path: 'exports', loadChildren: '../components/exports/exports.module#ExportsModule' },
			{ path: 'user', loadChildren: '../components/user/user.module#UserModule' },
			{ path: 'packages', loadChildren: '../components/packages/packages.module#PackagesModule' },
			{ path: 'admin-packages', loadChildren: '../components/admin-packages/admin-packages.module#AdminPackagesModule' },
			{ path: 'billing', loadChildren: '../components/billings/billings.module#BillingsModule'}
		]
	},
	// {
	// 	path: '**', 
	// 	redirectTo: 'home'
	// }
];

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
			{ path: 'privacy-policy', loadChildren: '../components/privacy-policy/privacy-policy.module#PrivacyPolicyModule' },
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
			{ path: 'admin-users', loadChildren: '../components/admin-users/admin-users.module#AdminUsersModule' },
			{ path: 'admin-user-billing', loadChildren: '../components/admin-user-billing/admin-user-billing.module#AdminUserBillingModule' },
			{ path: 'wp-details', loadChildren: '../components/wp-details/wp-details.module#WpDetailsModule' },
			{ path: 'billing', loadChildren: '../components/billings/billings.module#BillingsModule'}
		]
	},
	// {
	// 	path: '**', 
	// 	redirectTo: 'home'
	// }
];

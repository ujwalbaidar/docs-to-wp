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
			{ path: 'login', loadChildren: '../components/google-auths/google-auths.module#GoogleAuthsModule' },
			{ path: 'app/google-auth/action/:action/loginType/:loginType', loadChildren: '../components/google-auths/google-auths.module#GoogleAuthsModule' },
		]
	},
	{
		path: 'app',
		component: AdminLayoutComponent,
		children: [
			{ path: '', redirectTo: 'documents', pathMatch: 'full' },
			{ path: 'documents', loadChildren: '../components/documents/documents.module#DocumentsModule' },
			{ path: 'exports', loadChildren: '../components/exports/exports.module#ExportsModule' },
			// { path: 'settings', loadChildren: '../components/settings/settings.module#SettingsModule' },
			{ path: 'user', loadChildren: '../components/user/user.module#UserModule' },
			// { path: 'user', loadChildren: '../components/user/user.module#UserModule' }
		]
	}
	// {
	// 	path: '**', 
	// 	redirectTo: 'home'
	// }
];

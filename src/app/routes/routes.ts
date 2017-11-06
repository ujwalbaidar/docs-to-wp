import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../components/layout/layout/layout.component';

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
	// {
	// 	path: '**', 
	// 	redirectTo: 'home'
	// }
];

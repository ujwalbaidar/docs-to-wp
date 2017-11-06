import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { LayoutComponent } from './layout/layout.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

import { MenuComponent } from './layout/header/menu/menu.component';

const routes: Routes = [
	{ path: '', component: LayoutComponent }
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(routes)
	],
	exports: [
		RouterModule
	],
	declarations: [
		LayoutComponent, 
		FooterComponent, 
		HeaderComponent, 
		SidebarComponent, 
		MenuComponent
	]
})
export class LayoutModule { }

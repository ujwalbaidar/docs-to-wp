import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { WpDetailsComponent } from './wp-details/wp-details.component';
import { DomainDetailsComponent } from './domain-details/domain-details.component';

const routes: Routes = [
	{ 
		path: '', 
		component: WpDetailsComponent,
		children: [
			{ path: 'user-id/:user-id', component: DomainDetailsComponent }
	    ]
	}
];

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		RouterModule.forChild(routes)
	],
	declarations: [WpDetailsComponent, DomainDetailsComponent]
})
export class WpDetailsModule { }

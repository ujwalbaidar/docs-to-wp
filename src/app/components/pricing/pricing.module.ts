import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingComponent } from './pricing/pricing.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{ path: '', component: PricingComponent }
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(routes)
	],
	exports: [
    	RouterModule
  	],
	declarations: [PricingComponent]
})
export class PricingModule { }

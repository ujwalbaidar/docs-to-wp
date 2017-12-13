// import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

// @NgModule({
//   imports: [
//     CommonModule
//   ],
//   declarations: [PrivacyPolicyComponent]
// })
// export class PrivacyPolicyModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
	{ path: '', component: PrivacyPolicyComponent }
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(routes)
	],
	exports: [
    	RouterModule
  	],
	declarations: [PrivacyPolicyComponent]
})
export class PrivacyPolicyModule { }
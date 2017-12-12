import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleAuthsComponent } from './google-auths/google-auths.component';
import { SharedModule } from '../../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
	{ path: '', component: GoogleAuthsComponent }
];

@NgModule({
  imports: [
	    CommonModule,
	    SharedModule,
		RouterModule.forChild(routes)
	],
  declarations: [GoogleAuthsComponent]
})
export class GoogleAuthsModule { }

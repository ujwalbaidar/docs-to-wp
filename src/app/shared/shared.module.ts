import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthsService } from './service/auths.service';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { 
	MatButtonModule, 
	MatCheckboxModule, 
	MatToolbarModule,
	MatSidenavModule 
} from '@angular/material';

@NgModule({
	providers: [
		AuthsService,
		CookieService
	],
	imports: [
		CommonModule,
		MatButtonModule,
		MatCheckboxModule,
		MatToolbarModule,
		MatSidenavModule
	],
	exports: [
		MatButtonModule,
		MatCheckboxModule,
		MatToolbarModule,
		MatSidenavModule
	],
	declarations: []
})
export class SharedModule { }

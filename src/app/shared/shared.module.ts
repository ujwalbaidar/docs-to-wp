import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthsService } from './service/auths.service';

@NgModule({
	providers: [
		AuthsService
	],
	imports: [
		CommonModule
	],
	declarations: []
})
export class SharedModule { }

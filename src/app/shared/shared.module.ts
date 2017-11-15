import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthsService } from './service/auths.service';
import { WpUserService } from './service/wp-user.service';
import { ExportsService } from './service/exports.service';
import { GoogleAuthsService } from './service/google-auths.service';
import { 
	MatButtonModule, 
	MatCheckboxModule, 
	MatToolbarModule,
	MatSidenavModule,
	MatFormFieldModule,
	MatInputModule,
	MatSelectModule,
	MatSnackBarModule,
	MatTableModule,
	MatDialogModule,
	MatProgressBarModule,
	MatGridListModule
} from '@angular/material';

@NgModule({
	providers: [
		AuthsService,
		WpUserService,
		ExportsService,
		GoogleAuthsService
	],
	imports: [
		CommonModule,
		MatButtonModule,
		MatCheckboxModule,
		MatToolbarModule,
		MatSidenavModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatSnackBarModule,
		MatTableModule,
		MatDialogModule,
		MatProgressBarModule,
		MatGridListModule
	],
	exports: [
		MatButtonModule,
		MatCheckboxModule,
		MatToolbarModule,
		MatSidenavModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatSnackBarModule,
		MatTableModule,
		MatDialogModule,
		MatProgressBarModule,
		MatGridListModule
	],
	declarations: []
})
export class SharedModule { }

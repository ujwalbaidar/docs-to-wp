import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthsService } from './service/auths.service';
import { WpUserService } from './service/wp-user.service';
import { ExportsService } from './service/exports.service';
import { GoogleAuthsService } from './service/google-auths.service';
import { UserService } from './service/user.service';
import { PackagesService } from './service/packages.service';
import { BillingsService } from './service/billings.service';
import { SocketIoService } from './service/socket-io.service';

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
	MatGridListModule,
	MatCardModule,
	MatSlideToggleModule,
	MatRadioModule
} from '@angular/material';

@NgModule({
	providers: [
		AuthsService,
		WpUserService,
		ExportsService,
		GoogleAuthsService,
		UserService,
		PackagesService,
		BillingsService,
		SocketIoService
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
		MatGridListModule,
		MatCardModule,
		MatSlideToggleModule,
		MatRadioModule
		// SocketIoModule.forRoot(socketIoConfig)
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
		MatGridListModule,
		MatCardModule,
		MatSlideToggleModule,
		MatRadioModule
	],
	declarations: []
})
export class SharedModule { }

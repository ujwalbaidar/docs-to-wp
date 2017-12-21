import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { PackagesService } from '../../../shared/service/packages.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
	selector: 'app-admin-packages',
	templateUrl: './admin-packages.component.html',
	styleUrls: ['./admin-packages.component.css']
})
export class AdminPackagesComponent implements OnInit {
	public packages: any;
	public displayedColumns: any;
  	public dataSource: any;

	constructor(public dialog: MatDialog, public packageService: PackagesService, public snackBar: MatSnackBar, private router: Router) { }

	ngOnInit() {
		this.getPackages();
	}

	openPackagesModal(packageData:any){
		let dialogRepOpt = {
			width: '700px'
		};

		if(packageData !== undefined || JSON.stringify(packageData) !== '{}'){
			dialogRepOpt['data'] = {
				title: 'Edit Packge',
				packageObj: packageData
			};
		}

		let dialogRef = this.dialog.open(PackageDialog, dialogRepOpt);

		dialogRef.afterClosed().subscribe(result => {
			if(result && result.cancel === false){
				let submitData = result.submitData;
				if(packageData !== undefined && JSON.stringify(packageData) !== '{}'){
					this.editAdminPackage(submitData);
				}else{
					this.saveAdminPackage(submitData);
				}
			}
		});
	}

	saveAdminPackage(packageObj){
		this.packageService.saveAdminPackage(packageObj)
			.subscribe(savePackageResp=>{
				this.getPackages();
			}, error =>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 3000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					if(error.status === 401){
						localStorage.removeItem('currentUser');
						this.router.navigate(['/home']);
					}else{
						window.location.reload();
					}
				});
		});
	}

	editAdminPackage(packageObj){
		this.packageService.updateAdminPackage(packageObj)
			.subscribe(updatePackageResp=>{
				this.getPackages();
			}, error =>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 3000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					if(error.status === 401){
						localStorage.removeItem('currentUser');
						this.router.navigate(['/home']);
					}else{
						window.location.reload();
					}
				});
		});
	}

	getPackages(){
		this.packageService.getPackages()
			.subscribe(packagesDataObj=>{
				this.displayedColumns = ['name', 'description', 'cost', 'actions'];
				if(packagesDataObj.success == true){
					this.dataSource = new PackagesDataSource(packagesDataObj.data);
				}
			}, error =>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 3000,
				});
				snackBarRef.afterDismissed().subscribe(() => {
					if(error.status === 401){
						localStorage.removeItem('currentUser');
						this.router.navigate(['/home']);
					}else{
						window.location.reload();
					}
				});
		});
	}
}

export interface Packages {
	name: string;
	description: string;
	cost: string;
	annualCost: string;
	urlCounts: number;
	exportCounts: number;
	validityPeriod: number;
	priorityLevel: number;
	maxUrls: number;
	maxExports: number;
}


@Component({
	selector: 'package-dialog',
	templateUrl: 'package-dialog.html',
	styleUrls: ['./admin-packages.component.css']
})
export class PackageDialog implements OnInit {
	packages: Packages = <Packages>{};
	title: string = 'Add package';
	constructor(public dialogRef: MatDialogRef<PackageDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { }

	ngOnInit(){
		if(this.data && JSON.stringify(this.data) !== "{}"){
			let packageData = JSON.parse(JSON.stringify(this.data));
			this.title = packageData.title;
			this.packages = packageData.packageObj;
		}
	}

	cancelSubmit(): void {
		this.dialogRef.close({ cancel:true, submitData: {} });
	}

	submitPackage(isValid){
		if(isValid){
			this.dialogRef.close({ cancel:false, submitData: this.packages });
		}
	}
}

export class PackagesDataSource extends DataSource<any> {
	constructor(public packageLists){
		super();
	}

	connect(): Observable<Packages[]> {
		const packagesData: Packages [] = this.packageLists;
		return Observable.of(packagesData);
		
	}

	disconnect() {}
}
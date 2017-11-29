import { Component, OnInit, Inject } from '@angular/core';
import { WpUserService } from '../../../shared/service/wp-user.service';
import { GoogleAuthsService } from '../../../shared/service/google-auths.service';
import { Router } from '@angular/router';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { MatSnackBar } from '@angular/material';

export interface Doc {
	title: string;
	exportMethod: string;
}

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
	public color:string = 'primary';
	public mode:string = 'indeterminate';
	public loading:boolean = true;
	public displayedColumns: any;
  	public dataSource: any;
  	public searchValue: string;

	constructor(
		public wpUserService: WpUserService, 
		private router: Router, 
		public googleAuthService: GoogleAuthsService, 
		public dialog: MatDialog, 
		public snackBar: MatSnackBar) { }

	ngOnInit() {
		this.getWpUser();
	}

	getWpUser(){
		this.wpUserService.listWpUsers()
			.subscribe(wpUsers=>{
				if(wpUsers.success == true){
					if(wpUsers.data.length===0){
						this.router.navigate(['/app/user/wordpress_site/new']);
					}else{
						this.getGoogleDocLists();
					}
				}
			}, error =>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 2000,
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

	getGoogleDocLists(){
		this.googleAuthService.getDriveFileList()
			.subscribe(driveFiles=>{
				this.displayedColumns = ['name', 'author', 'actions'];
				if(driveFiles.success == true){
					this.loading = false;
					this.dataSource = new DriveFilesDataSource(driveFiles.data.items);
				}
			}, error =>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 2000,
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

	exportDoc(fileInfo){
		let dialogRef = this.dialog.open(ExportDocDialog, {
			width: '500px',
			data: { title: fileInfo.title }
		});
		dialogRef.afterClosed().subscribe(result => {
			if(result && result.cancel === false){
				result.submitData.fileId = fileInfo.id;
				let submitData = result.submitData;
				this.exportGoogleDoc(submitData);
			}
		});
	}

	exportGoogleDoc(data){
		this.googleAuthService.exportGoogleDoc(data)
			.subscribe(exportGoogleDocResp=>{
					if(exportGoogleDocResp.status === false){
						let snackBarRef = this.snackBar.open(exportGoogleDocResp.message, '',{
							duration: 3000
						});
					}else{
						this.router.navigate(['/app/exports']);
					}
				}, error =>{
					let errMsg = error.errBody.message || 'Failed to perform this action.';
					let snackBarRef = this.snackBar.open(errMsg, '',{
						duration: 2000,
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

	searchDocFiles(){
		this.loading = true;
		this.googleAuthService.seachDocLists([{ queryVal: this.searchValue}])
			.subscribe(driveFiles=>{
				this.loading = false;
				this.dataSource = new DriveFilesDataSource(driveFiles.data.items);
			}, error =>{
				let errMsg = error.errBody.message || 'Failed to perform this action.';
				let snackBarRef = this.snackBar.open(errMsg, '',{
					duration: 2000,
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

export interface Files {
	name: string;
	author: string;
}


export class DriveFilesDataSource extends DataSource<any> {
	constructor(public driveFiles){
		super();
	}

	connect(): Observable<Files[]> {
		const fileData: Files [] = this.driveFiles;
		return Observable.of(fileData);
		
	}

	disconnect() {}
}

@Component({
	selector: 'export-doc-dialog',
	templateUrl: 'export-doc-dialog.html'
})
export class ExportDocDialog implements OnInit {
	doc: Doc = <Doc>{};
	exportTypes = [
	    {value: 'post', viewValue: 'Post'},
	    {value: 'page', viewValue: 'Page'}
	];
	constructor(public dialogRef: MatDialogRef<ExportDocDialog>, @Inject(MAT_DIALOG_DATA) public data: any) { }

	ngOnInit(){
		this.doc['title'] = this.data.title;
		this.doc['exportMethod'] = this.exportTypes[0]['value'];
	}

	cancelSubmit(): void {
		this.dialogRef.close({ cancel:true, submitData: {} });
	}

	submitDocExport(){
		this.dialogRef.close({ cancel:false, submitData: this.doc });
	}
}
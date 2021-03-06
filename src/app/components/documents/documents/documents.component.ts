import { Component, OnInit, Inject } from '@angular/core';
import { WpUserService } from '../../../shared/service/wp-user.service';
import { GoogleAuthsService } from '../../../shared/service/google-auths.service';
import { Router } from '@angular/router';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { ExportsService } from '../../../shared/service/exports.service';

export interface Doc {
	title: string;
	exportMethod: string;
	wpAccount: string;
	wpUsers: any;
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
  	public wpUsers: any;

	constructor(
		public wpUserService: WpUserService, 
		private router: Router, 
		public googleAuthService: GoogleAuthsService, 
		public exportsService: ExportsService,
		public dialog: MatDialog, 
		public snackBar: MatSnackBar) { }

	ngOnInit() {
		this.getWpUser();
	}

	getWpUser(){
		this.wpUserService.listWpUsers()
			.subscribe(wpUsers=>{
				this.wpUsers = wpUsers.data;
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
		let dialogData = { title: fileInfo.title };
		if(this.wpUsers.length>1){
			dialogData['wpUsers'] = JSON.parse(JSON.stringify(this.wpUsers));
		}

		let dialogRef = this.dialog.open(ExportDocDialog, {
			width: '500px',
			data: dialogData
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
		this.loading = true;
		this.googleAuthService.exportGoogleDoc(data)
			.subscribe(exportGoogleDocResp=>{
				if(exportGoogleDocResp.success === true){
					let tempDiv = document.createElement('div');
					tempDiv.innerHTML = exportGoogleDocResp.data.htmlData;
					let listSpans = tempDiv.getElementsByTagName('span');
					let listatags = tempDiv.getElementsByTagName('a');
					for(let i=0; i<listSpans.length; i++){
						if(listSpans[i].style.fontWeight !== undefined && parseInt(listSpans[i].style.fontWeight)>500){
							listSpans[i].innerHTML = `<strong>${listSpans[i].innerHTML}</strong>`;
						}

						if(listSpans[i].style.fontStyle !== undefined && listSpans[i].style.fontStyle === 'italic'){
							listSpans[i].innerHTML = `<i>${listSpans[i].innerHTML}</i>`;
						}

						if(listSpans[i].style.textDecoration !== undefined && listSpans[i].style.textDecoration === 'underline'){
							if(listSpans[i].firstElementChild === null){
								listSpans[i].innerHTML = `<u>${listSpans[i].innerHTML}</u>`;
							}
						}
					}

					for(let i=0; i<listatags.length; i++){
						let aTagHashVal = listatags[i].hash;
						let aTagHrefVal = listatags[i].href;
						if(aTagHrefVal.includes('https://www.google.com/url?q=') === true){
							listatags[i].href=aTagHrefVal.split('q=')[1];
							if(listatags[i].href.includes("&sa=D&ust")){
								listatags[i].href = listatags[i].href.split("&sa=D&ust")[0];
							}
						}
						if(aTagHrefVal.includes("#cmnt") === true){
							let aTagParentElement = listatags[i].parentElement;
							let aTagParentElementTagName = aTagParentElement.tagName;
							if(listatags[i].parentElement.tagName === 'SUP'){
								listatags[i].parentElement.className = "remove_element";
							}
							while(aTagParentElementTagName !== 'DIV'){
								aTagParentElement = aTagParentElement.parentElement;
								if(aTagParentElement.tagName === 'DIV'){
									break;
								}
							}
							aTagParentElement.className = "remove_element";
						}
					}
					let removeElements = tempDiv.getElementsByClassName("remove_element");
					while (removeElements.length > 0) removeElements[0].remove();
					exportGoogleDocResp.data.htmlData = tempDiv.innerHTML.trim();
					this.exportToWp(exportGoogleDocResp.data);
				}else{
					let snackBarRef = this.snackBar.open(exportGoogleDocResp.message, '',{
						duration: 2000,
					});
					snackBarRef.afterDismissed().subscribe(() => {
						window.location.reload();
					});
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

	exportToWp(exportElement){
		this.exportsService.exportDocToWp(exportElement)
			.subscribe(exportDoc=>{
				if(exportDoc.status === false){
					let snackBarRef = this.snackBar.open(exportDoc.message, '',{
						duration: 3000
					});
				}else{
					this.loading = false;
					this.router.navigate(['/app/exports']);
				}
			}, error =>{
				this.loading = false;
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
		if(this.data.wpUsers !== undefined && this.data.wpUsers.length>1){
			this.doc['wpUsers'] = JSON.parse(JSON.stringify(this.data.wpUsers));
			this.doc['wpAccount'] = this.doc['wpUsers'][0];
		}
	}

	cancelSubmit(): void {
		this.dialogRef.close({ cancel:true, submitData: {} });
	}

	submitDocExport(){
		this.dialogRef.close({ cancel:false, submitData: this.doc });
	}
}
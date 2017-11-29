import { Component, OnInit } from '@angular/core';
import { ExportsService } from '../../../shared/service/exports.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-exports',
  templateUrl: './exports.component.html',
  styleUrls: ['./exports.component.css']
})
export class ExportsComponent implements OnInit {
	public displayedColumns: any;
  	public dataSource: any;

	constructor(public exportsService: ExportsService, private router: Router, public snackBar: MatSnackBar) { }

	ngOnInit() {
		this.listExportFiles();
	}

	listExportFiles(){
		this.exportsService.listExportFiles()
			.subscribe(exportsList=>{
				this.displayedColumns = ['docFileTitle', 'publishType', 'createdDate'];
				if(exportsList.success == true){
					this.dataSource = new ExportFilesDataSource(exportsList.data);
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

}


export interface FileExports {
	docFileTitle: string;
	publishType: string;
	createdDate: Date;
}

export class ExportFilesDataSource extends DataSource<any> {
	constructor(public exportsData){
		super();
	}

	connect(): Observable<FileExports[]> {
		const fileExports: FileExports [] = this.exportsData;
		return Observable.of(fileExports);
		
	}

	disconnect() {}
}
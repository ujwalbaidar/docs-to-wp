import { Component, OnInit } from '@angular/core';
import { ExportsService } from '../../../shared/service/exports.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-exports',
  templateUrl: './exports.component.html',
  styleUrls: ['./exports.component.css']
})
export class ExportsComponent implements OnInit {
	public displayedColumns: any;
  	public dataSource: any;

	constructor(public exportsService: ExportsService) { }

	ngOnInit() {
		this.listExportFiles();
	}

	listExportFiles(){
		this.exportsService.listExportFiles()
			.subscribe(exportsList=>{
				this.displayedColumns = ['docFileTitle', 'publishType', 'createdDate'];
				if(exportsList.success == true){
					console.log(exportsList.data)
					this.dataSource = new ExportFilesDataSource(exportsList.data);
				}
			}, exportsListErr=>{
				console.log(exportsListErr);
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
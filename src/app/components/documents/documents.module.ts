import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentsComponent, ExportDocDialog } from './documents/documents.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule }   from '@angular/forms';

const routes: Routes = [
	{ path: '', component: DocumentsComponent }
];
@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		FormsModule,
		RouterModule.forChild(routes)
	],
	declarations: [DocumentsComponent, ExportDocDialog],
	entryComponents: [ExportDocDialog]
})
export class DocumentsModule { }

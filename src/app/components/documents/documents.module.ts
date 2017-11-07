import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentsComponent } from './documents/documents.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
const routes: Routes = [
	{ path: '', component: DocumentsComponent }
];
@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		RouterModule.forChild(routes)
	],
		declarations: [DocumentsComponent]
	})
export class DocumentsModule { }

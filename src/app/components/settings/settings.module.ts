import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
	{ path: '', component: SettingsComponent }
];

/*@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SettingsComponent]
})*/
@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		RouterModule.forChild(routes)
	],
		declarations: [SettingsComponent]
	})
export class SettingsModule { }

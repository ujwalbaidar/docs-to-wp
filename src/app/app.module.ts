import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { RoutesModule } from './routes/routes.module';

import { LayoutModule } from './components/layout/layout.module';
import { SharedModule } from './shared/shared.module';
import { HttpModule } from '@angular/http';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		HttpModule,
		RoutesModule,
		LayoutModule,
		BrowserAnimationsModule,
		SharedModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }

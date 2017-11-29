import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { UserComponent } from './user/user.component';
import { UserCreateComponent } from './user-create/user-create.component';
import { UserListComponent } from './user-list/user-list.component';
import { FormsModule }   from '@angular/forms';
import { WpUserEditComponent } from './wp-user-edit/wp-user-edit.component';
import { UserEditComponent } from './user-edit/user-edit.component';

const routes: Routes = [
	{ 
		path: '', 
		component: UserComponent,
		children: [
			{ path: '', redirectTo: 'lists', pathMatch: 'full' },
			{ path: 'lists', component: UserListComponent },
			{ path: 'edit', component: UserEditComponent },
			{ path: 'wordpress_site/new', component: UserCreateComponent },
			{ path: 'wordpress_sites/:wpUserId/edit', component: WpUserEditComponent }
	    ]
	}
];

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		RouterModule.forChild(routes),
		FormsModule
	],
  	declarations: [UserComponent, UserCreateComponent, UserListComponent, WpUserEditComponent, UserEditComponent]
})

export class UserModule { }

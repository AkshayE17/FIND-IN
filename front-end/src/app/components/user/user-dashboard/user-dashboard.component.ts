import { Component } from '@angular/core';
import { SideBarComponent } from '../../admin/side-bar/side-bar.component';
import { UserSidebarComponent } from '../user-sidebar/user-sidebar.component';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../common/header/header.component';
import { FooterComponent } from '../../common/footer/footer.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [UserSidebarComponent,RouterOutlet,HeaderComponent,FooterComponent],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent {

}

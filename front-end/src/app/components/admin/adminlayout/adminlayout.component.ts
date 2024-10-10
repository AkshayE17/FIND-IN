import { Component } from '@angular/core';
import { RouterModule} from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SideBarComponent } from '../side-bar/side-bar.component';
@Component({
  selector: 'app-adminlayout',
  standalone: true,
  imports: [RouterModule,HeaderComponent,SideBarComponent],
  templateUrl: './adminlayout.component.html',
  styleUrl: './adminlayout.component.scss'
})
export class AdminlayoutComponent {
  handleLogout() {
    // Implement logout logic here
    console.log('Logout clicked');
  }
}

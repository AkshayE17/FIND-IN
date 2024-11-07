import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../common/header/header.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { RecruiterSidebarComponent } from '../recruiter-sidebar/recruiter-sidebar.component';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent,FooterComponent,RecruiterSidebarComponent],
  templateUrl: './recruiter-dashboard.component.html',
  styleUrl: './recruiter-dashboard.component.scss'
})
export class RecruiterDashboardComponent {

}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.scss'
})
export class SideBarComponent {
  menuItems = [
    { label: 'Dashboard', link: '/admin/dashboard', icon: '📊' },
    { label: 'Recruiters', link: '/admin/recruiters', icon: '👥' },
    { label: 'Verified', link: '/admin/verified-recruiters', icon: '✅' },
    { label: 'Users', link: '/admin/users', icon: '👤' },
    { label: 'Categories', link: '/admin/jobcategory', icon: '📁' },
    { label: 'Jobs', link: '/admin/jobs', icon: '💼' },
    { label: 'Reports', link: '/admin/report', icon: '📈' }
  ];
}

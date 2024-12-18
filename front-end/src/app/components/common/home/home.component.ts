import { Component, HostBinding } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SearchComponent } from '../search/search.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { categoryAnimations, featureAnimations, pageAnimations } from '../../../config/animation';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    SearchComponent,
    CommonModule,
    FormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [pageAnimations, categoryAnimations, featureAnimations]
})
export class HomeComponent {
  // Enhanced job categories with more vibrant colors
  jobCategories = [
    {
      icon: 'fas fa-clock',
      title: 'Full Time',
      description: 'Stable Positions with Career Growth',
      color: '#4a6cf7' // Primary blue
    },
    {
      icon: 'fas fa-calendar-alt',
      title: 'Part Time',
      description: 'Flexible Work Opportunities',
      color: '#3b82f6' // Accent blue
    },
    {
      icon: 'fas fa-globe',
      title: 'Remote',
      description: 'Global Workspace Freedom',
      color: '#6366f1' // Indigo
    },
    {
      icon: 'fas fa-building',
      title: 'Hybrid',
      description: 'Balanced Work Environment',
      color: '#22d3ee' // Cyan
    }
  ];

  // Updated features with more descriptive content
  features = [
    {
      icon: 'fas fa-magic',
      title: 'Smart Matching',
      description: 'AI-Powered Job Recommendations Tailored to Your Skills',
      color: '#4a6cf7' // Blue
    },
    {
      icon: 'fas fa-video',
      title: 'Interactive Interviews',
      description: 'Seamless Video Screening and Assessment Platform',
      color: '#10b981' // Green
    },
    {
      icon: 'fas fa-paper-plane',
      title: 'Instant Communication',
      description: 'Real-Time Messaging and Collaboration Tools',
      color: '#6366f1' // Indigo
    }
  ];

  @HostBinding('@pageAnimations') animatePage = true;

  handleSearch(searchTerm: string) {
    console.log('Searching for:', searchTerm);
    // Implement your search logic here
  }
}
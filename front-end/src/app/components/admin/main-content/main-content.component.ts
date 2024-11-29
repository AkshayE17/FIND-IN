import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { Chart, registerables } from 'chart.js'; // Import Chart and registerables
import { JobService } from '../../../services/job.service'; // Adjust import path

// Import necessary interfaces
interface JobStatistics {
  totalJobs: number;
  totalApplicants: number;
  jobsByCategory: { category: string, count: number }[];
  applicantsBySkill: { skill: string, count: number }[];
}

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  standalone: true, // Make it a standalone component
  imports: [CommonModule], // Import CommonModule
  styleUrls: ['./main-content.component.scss']
})
export class MainContentComponent implements OnInit {
  @ViewChild('jobCategoryChart') jobCategoryChart!: ElementRef;
  @ViewChild('applicantSkillChart') applicantSkillChart!: ElementRef;

  totalJobs: number = 0;
  totalApplicants: number = 0;
  recentJobs: any[] = [];
  jobCategoryChartInstance: Chart<"pie", number[], string> | null = null;
  applicantSkillChartInstance: Chart | null = null;

  constructor(private jobService: JobService) {
    console.log('MainContentComponent initialized.');
    Chart.register(...registerables); 
  }

  ngOnInit() {
    console.log('ngOnInit called.');
    this.loadDashboardData();
  }

  loadDashboardData() {
    console.log('Loading dashboard data...');

    // Fetch dashboard statistics
    this.jobService.getDashboardStatistics().subscribe({
      next: (stats: JobStatistics) => {
        console.log('Dashboard statistics fetched:', stats);
        this.totalJobs = stats.totalJobs;
        this.totalApplicants = stats.totalApplicants;

        console.log('Rendering job category chart with data:', stats.jobsByCategory);
        this.renderJobCategoryChart(stats.jobsByCategory);

        console.log('Rendering applicant skill chart with data:', stats.applicantsBySkill);
        this.renderApplicantSkillChart(stats.applicantsBySkill);
      },
      error: (error) => {
        console.error('Error fetching dashboard statistics', error);
      }
    });

    // Fetch recent jobs
    this.jobService.getRecentJobs(10).subscribe({
      next: (jobs: any[]) => {
        console.log('Recent jobs fetched:', jobs);
        this.recentJobs = jobs;
      },
      error: (error) => {
        console.error('Error fetching recent jobs', error);
      }
    });
  }

  renderJobCategoryChart(jobsByCategory: { category: string, count: number }[]) {
    if (this.jobCategoryChart) {
      const ctx = this.jobCategoryChart.nativeElement.getContext('2d');
      console.log('Job category chart context obtained.');

      // Destroy existing chart if it exists
      if (this.jobCategoryChartInstance) {
        console.log('Destroying existing job category chart.');
        this.jobCategoryChartInstance.destroy();
      }

      console.log('Creating new job category chart.');
      this.jobCategoryChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: jobsByCategory.map(cat => cat.category),
          datasets: [{
            data: jobsByCategory.map(cat => cat.count),
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', 
              '#4BC0C0', '#9966FF', '#FF9F40'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Jobs by Category'
            }
          }
        }
      });
    } else {
      console.warn('Job category chart element not found.');
    }
  }

  renderApplicantSkillChart(applicantsBySkill: { skill: string, count: number }[]) {
    if (this.applicantSkillChart) {
      const ctx = this.applicantSkillChart.nativeElement.getContext('2d');
      console.log('Applicant skill chart context obtained.');

      // Destroy existing chart if it exists
      if (this.applicantSkillChartInstance) {
        console.log('Destroying existing applicant skill chart.');
        this.applicantSkillChartInstance.destroy();
      }

      console.log('Creating new applicant skill chart.');
      this.applicantSkillChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: applicantsBySkill.map(skill => skill.skill),
          datasets: [{
            label: 'Applicants by Skill',
            data: applicantsBySkill.map(skill => skill.count),
            backgroundColor: '#36A2EB'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Applicants by Skill'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    } else {
      console.warn('Applicant skill chart element not found.');
    }
  }
}

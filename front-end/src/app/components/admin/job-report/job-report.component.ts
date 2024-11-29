import { Component, OnInit } from '@angular/core';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { JobService } from '../../../services/job.service';
import { IJobCategory } from '../../../state/job/job.state';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface JobReport {
  jobTitle: string;
  companyName: string;
  totalApplicants: number;
  averageSalary: number;
  topSkills: string[];
}

@Component({
  selector: 'app-job-report',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './job-report.component.html',
  styleUrl: './job-report.component.scss'
})
export class JobReportComponent implements OnInit {
  jobReports: JobReport[] = [];
  jobCategories: string[] = [];
  selectedCategory: string = '';

  constructor(private jobService: JobService) {}

  ngOnInit() {
    this.loadJobCategories();
    this.generateReport();
  }

  loadJobCategories() {
    this.jobService.getJobCategories().subscribe(
      (categories: IJobCategory[]) => {
        this.jobCategories = categories.map(category => category.name); 
        console.log('Job categories loaded:', this.jobCategories);
      }
    );
  }
  generateReport() {
    this.jobService.generateJobReport(this.selectedCategory).subscribe(
      reports => {
        console.log('Job reports generated:', reports); // Log the reports
        this.jobReports = reports;
      },
      error => console.error('Error generating job reports:', error) // Optional error handling
    );
  }
  
  downloadPdfReport() {
    const doc = new jsPDF();
    doc.text('Job Market Report', 14, 15);

    const tableColumn = ['Job Title', 'Company', 'Applicants', 'Avg Salary', 'Top Skills'];
    const tableRows: any[] = [];

    this.jobReports.forEach(report => {
      const reportData = [
        report.jobTitle,
        report.companyName,
        report.totalApplicants,
        `₹${report.averageSalary}`,
        report.topSkills.join(', ')
      ];
      tableRows.push(reportData);
    });

    (doc as any).autoTable(tableColumn, tableRows, { startY: 25 });
    doc.save('job_market_report.pdf');
  }
}

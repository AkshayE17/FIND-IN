import { Component, OnInit } from '@angular/core';
import { JobService } from '../../../services/job.service';
import { IJobResponse } from '../../../state/job/job.state'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-candidates',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './job-candidates.component.html',
  styleUrls: ['./job-candidates.component.scss']
})
export class JobCandidatesComponent  {
  jobDetails: IJobResponse | null = null;
  error: string | null = null;

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    this.fetchJobDetails('someJobId');
  }

  fetchJobDetails(jobId: string): void {
    this.jobService.getJobDetails(jobId).subscribe(
      (details) => {
        this.jobDetails = details;
      },
      (error) => {
        this.error = "Error fetching job details.";
        console.error("Error fetching job details:", error);
      }
    );
  }
}

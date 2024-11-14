import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';
import { JobService } from '../../../services/job.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface IApplicant {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    mobile: number;
    gender: string;
    password: string;
    isVerified: boolean;
    isBlocked: boolean;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    jobs: string[];
    professionalDetails: {
      _id: string;
      userId: string;
      title: string;
      skills: string[];
      experience: number;
      currentLocation: string;
      expectedSalary: number;
      about: string;
      resumeUrl: string;
      __v: number;
    };
  };


  appliedDate: string;
  applicationStatus: "applied" | "shortlisted" | "rejected";
}
@Component({
  selector: 'app-applied-candidates',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './applied-candidates.component.html',
  styleUrl: './applied-candidates.component.scss'
})
export class AppliedCandidatesComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() jobId: string = '';
  @Input() applicants: IApplicant[] = [];
  @Output() closeModal = new EventEmitter<void>();

  statusFilter: string = 'all';
  filteredApplicants: IApplicant[] = [];

  constructor(private jobService: JobService) {}

  ngOnInit() {
    this.filterApplicants();
  }

  filterApplicants() {
    this.filteredApplicants = this.statusFilter === 'all'
      ? this.applicants
      : this.applicants.filter(a => a.applicationStatus === this.statusFilter);
  }

  updateStatus(applicantId: string, status: 'shortlisted' | 'rejected') {
    this.jobService.updateApplicationStatus(this.jobId, applicantId, status).subscribe({
      next: () => {
        const applicant = this.applicants.find(a => a._id === applicantId);
        if (applicant) {
          applicant.applicationStatus = status;
          this.filterApplicants();
        }
        Swal.fire('Success', `Application ${status} successfully`, 'success');
      },
      error: (error: Error) => {
        console.error('Error updating application status:', error);
        Swal.fire('Error', 'Failed to update application status', 'error');
      }
    });
  }

  viewResume(resumeUrl?: string) {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    }
  }

  close() {
    this.closeModal.emit();
  }
}

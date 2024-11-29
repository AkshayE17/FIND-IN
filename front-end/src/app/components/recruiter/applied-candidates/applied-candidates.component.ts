
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JobService } from '../../../services/job.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

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

  constructor(private jobService: JobService,private chatService: ChatService,private authService: AuthService) {}

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
        // Find the index of the applicant instead of just finding the applicant
        const applicantIndex = this.applicants.findIndex(a => a._id === applicantId);
        
        if (applicantIndex !== -1) {
          // Create a new array with the updated applicant
          this.applicants = [
            ...this.applicants.slice(0, applicantIndex),
            {
              ...this.applicants[applicantIndex],
              applicationStatus: status
            },
            ...this.applicants.slice(applicantIndex + 1)
          ];
  
          // Re-apply the filter to update the view
          this.filterApplicants();
        }
    
        Swal.fire({
          title: `Applicant ${status === 'shortlisted' ? 'Shortlisted' : 'Rejected'}`,
          text: `The applicant has been successfully ${status}.`,
          icon: status === 'shortlisted' ? 'success' : 'warning',
          confirmButtonText: 'OK'
        });
    
        if (status === 'shortlisted') {
          console.log("calling the create chat room");
          this.createChatRoom(applicantId);
        }
      },
      error: (error: Error) => {
        Swal.fire({
          title: 'Error',
          text: 'Failed to update the application status. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }
  
  

  createChatRoom(applicantId: string) {

    const recruiterId = this.authService.getRecruiterId();
    const jobSeekerId = applicantId;
  

    console.log("job seeker id",jobSeekerId);
    console.log("recruiter id",recruiterId);

    
    this.chatService.createChatRoom({
      recruiterId,
      jobSeekerId
    }).subscribe({
      next: () => {
        console.log('Chat room created successfully');
      },
      error: (error: Error) => {
        console.error('Error creating chat room:', error);
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

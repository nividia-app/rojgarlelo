export type UserRole = 'super_admin' | 'recruiter' | 'hr' | 'candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  otp?: string;
  createdAt: string;
  companyId?: string; // Optional: associated with a company
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  branchLocations: string[];
  hrContacts: { name: string; email: string; phone?: string }[];
  recruitmentTeams: string[];
  createdAt: string;
}

export interface BenefitDetails {
  pfDetails?: string;
  esiDetails?: string;
  insurance?: string;
  incentives?: string;
  bonus?: string;
  leavePolicy?: string;
  foodAllowance?: string;
  transportAllowance?: string;
  otherPerks?: string;
}

export interface RecruitmentDetails {
  interviewRounds: string[]; // e.g. ["Aptitude Test", "Technical Round", "HR Assessment"]
  selectionProcess?: string;
  joiningDate?: string;
  bondDetails?: string;
  shiftInfo?: string;
  workMode: 'remote' | 'hybrid' | 'on-site';
  requiredDocuments: string[]; // e.g. ["Aadhaar Card", "PAN Card", "Degree Certificate", "Experience Letter"]
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  salary: string;
  experience: string;
  qualification: string;
  location: string;
  vacancies: number;
  skillsRequired: string[];
  benefits: BenefitDetails;
  recruitment: RecruitmentDetails;
  lastDate?: string;
  contactInformation: string;
  jobDescription: string;
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
}

export interface ApplicationDocument {
  name: string;
  type: string; // "Aadhaar" | "PAN" | "Resume" | "Certificate" | "Experience Letter" | "Other"
  fileUrl: string; // or base64
  uploadedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: 'applied' | 'screening' | 'interview' | 'selected' | 'rejected';
  resumeUrl: string;
  resumeFileName?: string;
  documents: ApplicationDocument[];
  interviewSchedule?: {
    roundName: string;
    dateTime: string;
    meetingLink?: string;
    interviewerName?: string;
    feedback?: string;
  }[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'email_verification' | 'otp_verification' | 'application_update' | 'interview_notification' | 'job_expiry' | 'recruiter_alert';
  read: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalJobs: number;
  totalCompanies: number;
  totalCandidates: number;
  totalApplications: number;
  byStatus: {
    applied: number;
    screening: number;
    interview: number;
    selected: number;
    rejected: number;
  };
  byLocation: { name: string; count: number }[];
  candidateEngagement: { month: string; applications: number; jobViews: number }[];
  recruiterPerformance: { name: string; jobsOwned: number; interviewsConducted: number; conversions: number }[];
}

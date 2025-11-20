/**
 * RecruitFlow - Candidate Data Types
 */

export type CandidateStatus = 
  | 'new'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn';

export type CandidateStage = 
  | 'Applied'
  | 'Phone Screen'
  | 'Technical Interview'
  | 'Onsite Interview'
  | 'Final Interview'
  | 'Offer Extended'
  | 'Offer Accepted'
  | 'Rejected'
  | 'Withdrawn';

export interface CandidateSkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface CandidateExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface CandidateEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationYear: string;
}

export interface CandidateNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
  type: 'general' | 'interview' | 'phone_screen' | 'reference';
}

export interface CandidateActivity {
  id: string;
  type: 'status_change' | 'note_added' | 'interview_scheduled' | 'email_sent' | 'call_made';
  description: string;
  timestamp: string;
  user: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  
  // Professional Info
  currentPosition?: string;
  currentCompany?: string;
  yearsOfExperience: number;
  expectedSalary?: string;
  citizenship?: string;
  
  // Application Info
  position: string;
  department: string;
  status: CandidateStatus;
  stage: CandidateStage;
  appliedDate: string;
  source: string;
  resumeReceived?: boolean;
  qualified?: 'qualified' | 'not_qualified' | 'pending';
  
  // Profile
  avatar?: string;
  linkedIn?: string;
  portfolio?: string;
  resumeUrl?: string;
  
  // Details
  skills: CandidateSkill[];
  experience: CandidateExperience[];
  education: CandidateEducation[];
  
  // Engagement
  rating?: number; // 1-5
  notes: CandidateNote[];
  activities: CandidateActivity[];
  
  // Metadata
  recruiter: string;
  hiringManager?: string;
  viewed?: boolean; // Track if candidate has been viewed
  createdAt: string;
  updatedAt: string;
}

export interface CandidateListItem {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  status: CandidateStatus;
  stage: CandidateStage;
  rating?: number;
  appliedDate: string;
  avatar?: string;
}

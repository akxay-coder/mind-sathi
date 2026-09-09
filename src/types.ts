export type MoodLevel = 'great' | 'good' | 'okay' | 'low' | 'very_low';

export interface MoodOption {
  level: MoodLevel;
  emoji: string;
  label: string;
  color: string;
  textColor: string;
  response: string;
}

export type CaseStage = 'registration' | 'investigation' | 'trial' | 'rehabilitation' | 'compensation';

export interface CaseTimelineStep {
  stage: CaseStage;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
  officerNote?: string;
}

export interface CaseData {
  id: string;
  caseNumber: string;
  complainantName: string;
  age: number;
  incidentType: string;
  registrationDate: string;
  currentStage: CaseStage;
  nextHearingDate: string;
  assignedCounsellor: string;
  assignedOfficer: string;
  districtLegalAid: string;
  compensationStatus: {
    totalEligible: string;
    interimDisbursed: string;
    finalPending: string;
  };
  contactPreference: 'call' | 'whatsapp' | 'sms' | 'silent';
  preferredTime: string;
  language: string;
  distressLevel: 'Normal' | 'Moderate' | 'High';
  timeline: CaseTimelineStep[];
}

export interface DailyCheckInRecord {
  id: string;
  date: string;
  mood: MoodLevel;
  energyLevel: number; // 1-5
  sleepQuality: 'good' | 'fair' | 'poor' | 'disturbed';
  notes?: string;
  tags: string[];
  flaggedForCounsellor?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'counsellor';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  isCrisisAlert?: boolean;
}

export type ResourceCategory = 'emotional' | 'self_care' | 'legal' | 'helpline' | 'crisis';

export interface ResourceItem {
  id: string;
  title: string;
  category: ResourceCategory;
  categoryLabel: string;
  readTime: string;
  summary: string;
  content: string[];
  keyContacts?: { name: string; number: string; description: string }[];
  tags: string[];
  iconName: string;
}

export interface CounsellorAlert {
  id: string;
  caseId: string;
  caseNumber: string;
  complainantName: string;
  severity: 'High' | 'Moderate' | 'Low';
  reason: string;
  timestamp: string;
  status: 'Open' | 'Under Review' | 'Resolved';
  resolutionNotes?: string;
}

export interface InterventionNote {
  id: string;
  caseId: string;
  date: string;
  counsellorName: string;
  note: string;
  actionTaken: string;
  followUpDate?: string;
}

export interface UserProfile {
  name: string;
  caseId: string;
  phone: string;
  age: number;
  contactPreference: 'call' | 'whatsapp' | 'sms' | 'silent';
  preferredTime: string;
  language: string;
  biometricEnabled: boolean;
  confidentialMode: boolean;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
}

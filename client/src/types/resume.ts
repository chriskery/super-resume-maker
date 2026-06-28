export interface PersonalInfo {
  name: string;
  phone: string;
  email: string;
  title: string;
  photo?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  department: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

export interface ProjectExperience {
  id: string;
  name: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

export interface OrganizationExperience {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

export interface Skill {
  category: string;
  items: string;
}

export interface Resume {
  id: string;
  title: string;
  templateId: string;
  personalInfo: PersonalInfo;
  summary: string;
  workExperience: WorkExperience[];
  projectExperience: ProjectExperience[];
  organizationExperience: OrganizationExperience[];
  awards: string[];
  skills: Skill[];
  createdAt: string;
  updatedAt: string;
}

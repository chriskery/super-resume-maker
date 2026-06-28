export interface PersonalInfo {
  name: string;
  phone: string;
  email: string;
  title: string;
  city?: string;
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

export interface Education {
  id: string;
  school: string;      // 学校名称
  degree: string;      // 学历（本科/硕士/博士等）
  major: string;       // 专业
  startDate: string;
  endDate: string;
  highlights: string[]; // 在校成就/描述
  tags: string[];       // 学校标签（如 985、211、双一流、C9）
}

export interface OtherInfo {
  skills: Skill[];           // 专业技能
  certificates: string[];  // 证书/执照
  languages: string[];     // 语言
  hobbies: string[];       // 兴趣爱好
  activities: string[];    // 活动
}

export interface Resume {
  id: string;
  title: string;
  templateId: string;
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  workExperience: WorkExperience[];
  projectExperience: ProjectExperience[];
  organizationExperience: OrganizationExperience[];
  awards: string[];
  skills?: Skill[];
  others: OtherInfo;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

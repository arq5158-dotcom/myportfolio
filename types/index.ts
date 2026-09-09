export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  features: string[];
  githubLink?: string;
  liveLink?: string;
  screenshots: string[];
  thumbnail: string;
  tags: string[];
}

export interface Experience {
  id?: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface Education {
  id?: string;
  degree: string;
  institution: string;
  period: string;
  gpa?: string;
}

export interface Certification {
  id?: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
  image?: string;
  link?: string;
}

export interface ImpactMetric {
  id?: string;
  value: string;
  label: string;
  description: string;
}

export interface SocialLinks {
  github: string;
  linkedin: string;
  email: string;
  twitter?: string;
  phone?: string;
  phone2?: string;
}

export interface HeroContent {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  status: string;
  location: string;
  socialLinks: SocialLinks;
  impactMetrics: ImpactMetric[];
  aboutTitle?: string;
  aboutSubtitle?: string;
  aboutText?: string;
  aboutScopeTag?: string;
  neuralPatternsTitle?: string;
  neuralPatternsYear?: string;
  cogVisionTitle?: string;
  cogVisionYear?: string;
  cogVisionSubtitle?: string;
  specialtiesTags?: string[];
  awardsTitle?: string;
  awardsSubtitle?: string;
  awardItem?: string;
  awardBadge?: string;
}

export interface SectionVisibility {
  /** Measurable Performance & Evidence stats band */
  impactMetrics: boolean;
  /** Featured AI Engineering Projects showcase */
  projects: boolean;
  /** Career & Academic Chronology timeline */
  journey: boolean;
  /** Verified Credentials cards */
  certifications: boolean;
  /** Direct Transmission contact block */
  contact: boolean;
  /** Luxury footer with discreet admin access */
  footer: boolean;
}

export interface PortfolioContent {
  hero: HeroContent;
  projects: Project[];
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  /** Toggle entire page sections on/off (admin-controlled). Missing flags default to visible. */
  sectionVisibility?: Partial<SectionVisibility>;
}

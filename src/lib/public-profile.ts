import { loadProfile } from "./profile";
import type { ProfileData, Period } from "./profile";

// --- Public types (whitelist — only these fields are exposed) ---

export interface PublicContacts {
  github: { username: string; url: string };
  linkedin: { url: string };
}

export interface PublicProfile {
  name: { ko: string };
  positioningTitle: string;
  contacts: PublicContacts;
}

export interface PublicCareerSummary {
  asOf: string;
  totalCareer: { label: string; start: { value: string; precision: string } };
  constructionCm: { label: string; period: Period };
  aiIt: { label: string; period: Period };
}

export interface PublicCurrentStatus {
  employmentState: string;
  label: string;
  display: string;
}

export interface PublicOrganization {
  id: string;
  displayName: string;
}

export interface PublicEmployment {
  id: string;
  organizationId: string;
  roleTitle: string;
  domain: string;
  period: Period;
  statusAtBasisDate: string;
}

export interface PublicProject {
  id: string;
  canonicalName: string;
  classification: string;
  organizationId: string | null;
  role: string;
  teamSize?: number;
  period: Period;
  statusAtBasisDate: string;
}

export interface PublicEducation {
  id: string;
  degree: string;
  institution: string;
  department: string;
  major: string;
  period: Period;
}

export interface PublicCertification {
  name: string;
}

export interface PublicProfileData {
  profile: PublicProfile;
  careerSummary: PublicCareerSummary;
  currentStatus: PublicCurrentStatus;
  organizations: PublicOrganization[];
  employmentTimeline: PublicEmployment[];
  projects: {
    core: PublicProject[];
    supporting: PublicProject[];
  };
  education: PublicEducation[];
  certifications: PublicCertification[];
}

// --- Anonymization ---

function anonymizeProject(p: {
  id: string;
  canonicalName: string;
  classification: string;
  organizationId: string | null;
  role: string;
  teamSize?: number;
  period: Period;
  statusAtBasisDate: string;
}): PublicProject {
  return {
    id: p.id,
    canonicalName: p.canonicalName,
    classification: p.classification,
    organizationId: p.organizationId,
    role: p.role,
    ...(p.teamSize !== undefined ? { teamSize: p.teamSize } : {}),
    period: p.period,
    statusAtBasisDate: p.statusAtBasisDate,
  };
}

export function anonymize(data: ProfileData): PublicProfileData {
  return {
    profile: {
      name: { ko: data.profile.name.ko },
      positioningTitle: data.profile.positioningTitle,
      contacts: {
        github: { ...data.profile.contacts.github },
        linkedin: { ...data.profile.contacts.linkedin },
      },
    },

    careerSummary: {
      asOf: data.careerSummary.asOf,
      totalCareer: {
        label: data.careerSummary.totalCareer.label,
        start: { ...data.careerSummary.totalCareer.start },
      },
      constructionCm: {
        label: data.careerSummary.constructionCm.label,
        period: { ...data.careerSummary.constructionCm.period },
      },
      aiIt: {
        label: data.careerSummary.aiIt.label,
        period: { ...data.careerSummary.aiIt.period },
      },
    },

    currentStatus: {
      employmentState: data.currentStatus.employmentState,
      label: data.currentStatus.label,
      display: data.currentStatus.display,
    },

    organizations: data.organizations.map((org) => ({
      id: org.id,
      displayName: org.displayName,
    })),

    employmentTimeline: data.employmentTimeline.map((emp) => ({
      id: emp.id,
      organizationId: emp.organizationId,
      roleTitle: emp.roleTitle,
      domain: emp.domain,
      period: { ...emp.period },
      statusAtBasisDate: emp.statusAtBasisDate,
    })),

    projects: {
      core: data.projects.core.map(anonymizeProject),
      supporting: data.projects.supporting.map(anonymizeProject),
    },

    education: data.education.map((edu) => ({
      id: edu.id,
      degree: edu.degree,
      institution: edu.institution,
      department: edu.department,
      major: edu.major,
      period: { ...edu.period },
    })),

    certifications: data.certifications.map((cert) => ({
      name: cert.name,
    })),
  };
}

// --- Public loader ---

let cached: PublicProfileData | null = null;

export function getPublicProfile(): PublicProfileData {
  if (cached) return cached;
  cached = anonymize(loadProfile());
  return cached;
}

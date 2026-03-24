import { z } from "zod";
import profileJson from "../data/profile.normalized.json";

// --- Sub-schemas ---

const DatePointSchema = z.object({
  value: z.string(),
  precision: z.enum(["year", "month", "day"]),
});

const PeriodSchema = z.object({
  start: DatePointSchema.nullable(),
  end: DatePointSchema.nullable(),
  display: z.string().nullable(),
  dateKnown: z.boolean(),
  ongoing: z.boolean().nullable(),
  asOf: z.string().optional(),
});

const MetaSchema = z.object({
  schemaVersion: z.number(),
  canonicalFile: z.string(),
  basisDate: z.string(),
  datePrecisionConvention: z.object({
    year: z.string(),
    month: z.string(),
    day: z.string(),
  }),
  displayPeriodConvention: z.string(),
  sourceDocuments: z.array(z.string()),
});

const ContactsSchema = z.object({
  email: z.string(),
  github: z.object({ username: z.string(), url: z.string() }),
  linkedin: z.object({ url: z.string() }),
});

const ProfileSectionSchema = z.object({
  name: z.object({ ko: z.string() }),
  positioningTitle: z.string(),
  contacts: ContactsSchema,
  sourceRefs: z.array(z.string()),
});

const CareerPeriodSchema = z.object({
  label: z.string(),
  period: PeriodSchema,
});

const CareerSummarySchema = z.object({
  asOf: z.string(),
  totalCareer: z.object({
    label: z.string(),
    start: DatePointSchema,
  }),
  constructionCm: CareerPeriodSchema,
  aiIt: CareerPeriodSchema,
  sourceRefs: z.array(z.string()),
});

const CurrentStatusSchema = z.object({
  employmentState: z.string(),
  label: z.string(),
  since: z.string(),
  basisDate: z.string(),
  display: z.string(),
  notes: z.array(z.string()),
  sourceRefs: z.array(z.string()),
});

const OrganizationSchema = z.object({
  id: z.string(),
  canonicalName: z.string(),
  displayName: z.string(),
  aliases: z.array(z.string()),
  sourceRefs: z.array(z.string()),
});

const EmploymentSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  roleTitle: z.string(),
  domain: z.string(),
  period: PeriodSchema,
  statusAtBasisDate: z.string(),
  sourceRefs: z.array(z.string()),
});

const CoreProjectSchema = z.object({
  id: z.string(),
  canonicalName: z.string(),
  aliases: z.array(z.string()),
  classification: z.string(),
  organizationId: z.string().nullable(),
  role: z.string(),
  teamSize: z.number().optional(),
  period: PeriodSchema,
  statusAtBasisDate: z.string(),
  sourceRefs: z.array(z.string()),
});

const SupportingProjectSchema = z.object({
  id: z.string(),
  canonicalName: z.string(),
  aliases: z.array(z.string()),
  classification: z.string(),
  organizationId: z.string().nullable(),
  role: z.string(),
  period: PeriodSchema,
  statusAtBasisDate: z.string(),
  sourceRefs: z.array(z.string()),
});

const EducationSchema = z.object({
  id: z.string(),
  degree: z.string(),
  institution: z.string(),
  department: z.string(),
  major: z.string(),
  period: PeriodSchema,
  sourceRefs: z.array(z.string()),
});

const CertificationSchema = z.object({
  name: z.string(),
  sourceRefs: z.array(z.string()),
});

const NormalizationNoteSchema = z.object({
  id: z.string(),
  decision: z.string(),
  impact: z.array(z.string()),
  sourceRefs: z.array(z.string()),
});

// --- Top-level schema ---

export const ProfileDataSchema = z.object({
  meta: MetaSchema,
  profile: ProfileSectionSchema,
  careerSummary: CareerSummarySchema,
  currentStatus: CurrentStatusSchema,
  organizations: z.array(OrganizationSchema),
  employmentTimeline: z.array(EmploymentSchema),
  projects: z.object({
    core: z.array(CoreProjectSchema),
    supporting: z.array(SupportingProjectSchema),
  }),
  education: z.array(EducationSchema),
  certifications: z.array(CertificationSchema),
  normalizationNotes: z.array(NormalizationNoteSchema),
});

// --- TypeScript types ---

export type DatePoint = z.infer<typeof DatePointSchema>;
export type Period = z.infer<typeof PeriodSchema>;
export type Contacts = z.infer<typeof ContactsSchema>;
export type ProfileSection = z.infer<typeof ProfileSectionSchema>;
export type CareerSummary = z.infer<typeof CareerSummarySchema>;
export type CurrentStatus = z.infer<typeof CurrentStatusSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type Employment = z.infer<typeof EmploymentSchema>;
export type CoreProject = z.infer<typeof CoreProjectSchema>;
export type SupportingProject = z.infer<typeof SupportingProjectSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type NormalizationNote = z.infer<typeof NormalizationNoteSchema>;
export type ProfileData = z.infer<typeof ProfileDataSchema>;

// --- Loader ---

let cached: ProfileData | null = null;

export function loadProfile(): ProfileData {
  if (cached) return cached;
  cached = ProfileDataSchema.parse(profileJson);
  return cached;
}

import mongoose, { Schema, type InferSchemaType, type Model, type Types } from 'mongoose'

export interface Metadata {
  completionDate: string
  trackingNumber?: string
  submissionId: string
}

export interface Manufacturer {
  companyName: string
  responsiblePerson: string
  registrationNumber?: string
  nationalId?: string
  economicCode?: string
  postalCode?: string
  companyType?: string
  website?: string
  email?: string
  landline?: string
  fax?: string
  melliBankContractNumber?: string
  address?: string
}

export interface TechnicalRepresentative {
  fullName: string
  mobile: string
  email?: string
  landline?: string
}

export interface Product {
  productName: string
  version: string
  ownerDepartment?: string
  md5Hash?: string
  targetDatacenter?: string
  overview?: string
}

export interface AssessmentContext {
  category: string
  otherCategory?: string
  companyHasPreviousAssessment?: boolean | null
  productPreviouslyAssessed?: boolean | null
  vulnerabilitiesRemediated?: boolean | null
  usedSecurityConsultant?: boolean | null
  consultantName?: string
  hasRemediationTime?: boolean | null
}

export interface TechnicalDelivery {
  linuxRootPassword?: string
  linuxOraclePassword?: string
  windowsAdministratorPassword?: string
}

export interface TestAccount {
  role: string
  username: string
  password: string
}

export interface TestAccounts {
  admin: TestAccount
  limited: TestAccount
}

export interface ApiInventory {
  apiTypes?: string[]
  otherApiType?: string
  endpointCount?: string
  documentationAvailable?: boolean | null
  documentationTypes?: string[]
  otherDocumentationType?: string
  documentationVersion?: string
  allDocumentedInScope?: boolean | null
  outOfScopeEndpoints?: string
}

export interface Documents {
  aftaCertificateAttached: boolean
  installationGuideAttached: boolean
  userTrainingDocumentationAttached: boolean
}

export interface Trainer {
  fullName?: string
  mobile?: string
  email?: string
  landline?: string
}

export interface FinalApproval {
  signerName: string
  date: string
  companySeal?: string
}

export interface Payload {
  metadata: Metadata
  manufacturer: Manufacturer
  technicalRepresentative: TechnicalRepresentative
  product: Product
  assessmentContext: AssessmentContext
  technicalDelivery: TechnicalDelivery
  testAccounts: TestAccounts
  technicalDetails?: string
  apiInventory: ApiInventory
  documents: Documents
  trainer: Trainer
  finalApproval: FinalApproval
}

export interface ProjectPassportShape {
  projectId: Types.ObjectId
  packageType: string
  packageVersion: string
  schemaVersion: string
  formVersion: string
  appVersion: string
  submissionId: string
  exportedAt: string
  locale: string
  submission: Metadata
  producer: Manufacturer
  technicalRepresentative: TechnicalRepresentative
  product: Product
  classification: AssessmentContext
  testAccounts: TestAccounts
  serverCredentials: TechnicalDelivery
  technicalDetails?: string
  apiInventory: ApiInventory
  documents: Documents
  trainer: Trainer
  approval: FinalApproval
  payload: Payload
}

const nestedOptions = {
  _id: false,
  id: false,
  minimize: false,
  strict: true
} as const

const metadataSchema = new Schema<Metadata>({
  completionDate: { type: String, required: true },
  trackingNumber: { type: String },
  submissionId: { type: String, required: true }
}, nestedOptions)

const manufacturerSchema = new Schema<Manufacturer>({
  companyName: { type: String, required: true },
  responsiblePerson: { type: String, required: true },
  registrationNumber: { type: String },
  nationalId: { type: String },
  economicCode: { type: String },
  postalCode: { type: String },
  companyType: { type: String },
  website: { type: String },
  email: { type: String },
  landline: { type: String },
  fax: { type: String },
  melliBankContractNumber: { type: String },
  address: { type: String }
}, nestedOptions)

const technicalRepresentativeSchema = new Schema<TechnicalRepresentative>({
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  landline: { type: String }
}, nestedOptions)

const productSchema = new Schema<Product>({
  productName: { type: String, required: true },
  version: { type: String, required: true },
  ownerDepartment: { type: String },
  md5Hash: { type: String },
  targetDatacenter: { type: String },
  overview: { type: String }
}, nestedOptions)

const assessmentContextSchema = new Schema<AssessmentContext>({
  category: { type: String, required: true },
  otherCategory: { type: String },
  companyHasPreviousAssessment: { type: Boolean },
  productPreviouslyAssessed: { type: Boolean },
  vulnerabilitiesRemediated: { type: Boolean },
  usedSecurityConsultant: { type: Boolean },
  consultantName: { type: String },
  hasRemediationTime: { type: Boolean }
}, nestedOptions)

const technicalDeliverySchema = new Schema<TechnicalDelivery>({
  linuxRootPassword: { type: String },
  linuxOraclePassword: { type: String },
  windowsAdministratorPassword: { type: String }
}, nestedOptions)

const testAccountSchema = new Schema<TestAccount>({
  role: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
}, nestedOptions)

const testAccountsSchema = new Schema<TestAccounts>({
  admin: { type: testAccountSchema, required: true },
  limited: { type: testAccountSchema, required: true }
}, nestedOptions)

const apiInventorySchema = new Schema<ApiInventory>({
  apiTypes: { type: [String], default: undefined },
  otherApiType: { type: String },
  endpointCount: { type: String },
  documentationAvailable: { type: Boolean },
  documentationTypes: { type: [String], default: undefined },
  otherDocumentationType: { type: String },
  documentationVersion: { type: String },
  allDocumentedInScope: { type: Boolean },
  outOfScopeEndpoints: { type: String }
}, nestedOptions)

const documentsSchema = new Schema<Documents>({
  aftaCertificateAttached: { type: Boolean, required: true },
  installationGuideAttached: { type: Boolean, required: true },
  userTrainingDocumentationAttached: { type: Boolean, required: true }
}, nestedOptions)

const trainerSchema = new Schema<Trainer>({
  fullName: { type: String },
  mobile: { type: String },
  email: { type: String },
  landline: { type: String }
}, nestedOptions)

const finalApprovalSchema = new Schema<FinalApproval>({
  signerName: { type: String, required: true },
  date: { type: String, required: true },
  companySeal: { type: String }
}, nestedOptions)

const payloadSchema = new Schema<Payload>({
  metadata: { type: metadataSchema, required: true },
  manufacturer: { type: manufacturerSchema, required: true },
  technicalRepresentative: { type: technicalRepresentativeSchema, required: true },
  product: { type: productSchema, required: true },
  assessmentContext: { type: assessmentContextSchema, required: true },
  technicalDelivery: { type: technicalDeliverySchema, required: true },
  testAccounts: { type: testAccountsSchema, required: true },
  technicalDetails: { type: String },
  apiInventory: { type: apiInventorySchema, required: true },
  documents: { type: documentsSchema, required: true },
  trainer: { type: trainerSchema, required: true },
  finalApproval: { type: finalApprovalSchema, required: true }
}, nestedOptions)

export const projectPassportSchema = new Schema<ProjectPassportShape>({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  packageType: { type: String, required: true },
  packageVersion: { type: String, required: true },
  schemaVersion: { type: String, required: true },
  formVersion: { type: String, required: true },
  appVersion: { type: String, required: true },
  submissionId: { type: String, required: true },
  exportedAt: { type: String, required: true },
  locale: { type: String, required: true },
  submission: { type: metadataSchema, required: true },
  producer: { type: manufacturerSchema, required: true },
  technicalRepresentative: { type: technicalRepresentativeSchema, required: true },
  product: { type: productSchema, required: true },
  classification: { type: assessmentContextSchema, required: true },
  testAccounts: { type: testAccountsSchema, required: true },
  serverCredentials: { type: technicalDeliverySchema, required: true },
  technicalDetails: { type: String },
  apiInventory: { type: apiInventorySchema, required: true },
  documents: { type: documentsSchema, required: true },
  trainer: { type: trainerSchema, required: true },
  approval: { type: finalApprovalSchema, required: true },
  payload: { type: payloadSchema, required: true }
}, {
  strict: true,
  minimize: false,
  versionKey: false
})

export type ProjectPassport = InferSchemaType<typeof projectPassportSchema>

// Avoid OverwriteModelError when this module is reloaded by a development
// server or a test runner.
export const ProjectPassport: Model<ProjectPassport> = mongoose.models.ProjectPassport as Model<ProjectPassport> || mongoose.model<ProjectPassport>('ProjectPassport', projectPassportSchema)

export default ProjectPassport

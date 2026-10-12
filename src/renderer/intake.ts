export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export type AnyRecord = Record<string, any>

export const initialData: AnyRecord = {
  metadata: { completionDate: localDate(), trackingNumber: '', submissionId: '' },
  manufacturer: { companyName: '', responsiblePerson: '', registrationNumber: '', nationalId: '', economicCode: '', postalCode: '', companyType: 'سهامی خاص', website: '', email: '', landline: '', fax: '', melliBankContractNumber: '', address: '' },
  technicalRepresentative: { fullName: '', mobile: '', email: '', landline: '' },
  product: { productName: '', version: '', ownerDepartment: '', md5Hash: '', targetDatacenter: '', overview: '' },
  assessmentContext: { category: '', otherCategory: '', companyHasPreviousAssessment: '', productPreviouslyAssessed: '', vulnerabilitiesRemediated: '', usedSecurityConsultant: '', consultantName: '', hasRemediationTime: '' },
  technicalDelivery: { linuxRootPassword: '', linuxOraclePassword: '', windowsAdministratorPassword: '' },
  testAccounts: {
    admin: { role: 'مدیر (ادمین)', username: 'admin-slb', password: 'S!8@2229!@2229' },
    limited: { role: 'کاربر محدود', username: 'user-slb', password: 'S!81@2229!@2229' }
  },
  technicalDetails: '',
  apiInventory: { apiTypes: [], otherApiType: '', endpointCount: '', documentationAvailable: '', documentationTypes: [], otherDocumentationType: '', documentationVersion: '', allDocumentedInScope: '', outOfScopeEndpoints: '' },
  documents: { aftaCertificateAttached: false, installationGuideAttached: false, userTrainingDocumentationAttached: false },
  trainer: { fullName: '', mobile: '', email: '', landline: '' },
  finalApproval: { signerName: '', date: localDate(), companySeal: '' }
}

export const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

export function setAtPath(source: AnyRecord, path: string, value: any) {
  const next = clone(source)
  const parts = path.split('.')
  let target = next
  parts.forEach((part, index) => {
    if (index === parts.length - 1) target[part] = value
    else { target[part] ??= {}; target = target[part] }
  })
  return next
}

export function getAtPath(source: AnyRecord, path: string): any {
  return path.split('.').reduce((value, key) => value?.[key], source)
}

export function mergeDefaults(defaults: AnyRecord, saved: unknown): AnyRecord {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return clone(defaults)
  const input = saved as AnyRecord
  const result = clone(defaults)
  for (const [key, fallback] of Object.entries(defaults)) {
    const candidate = Object.hasOwn(input, key) ? input[key] : undefined
    if (Array.isArray(fallback)) {
      if (Array.isArray(candidate) && candidate.every(item => typeof item === 'string')) result[key] = [...candidate]
    } else if (fallback && typeof fallback === 'object') {
      result[key] = mergeDefaults(fallback, candidate)
    } else if (typeof candidate === typeof fallback) {
      result[key] = candidate
    }
  }
  return result
}

export function newSubmissionId() {
  return `SUB-${new Date().getFullYear()}-${crypto.randomUUID().toUpperCase()}`
}

export function createInitialData() {
  const data = clone(initialData)
  data.metadata.completionDate = localDate()
  data.finalApproval.date = localDate()
  data.metadata.submissionId = newSubmissionId()
  return data
}

export function restoreDraft(saved: unknown) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) throw new Error('invalid-draft')
  const source = saved as AnyRecord
  // Accept legacy raw drafts and previously exported JSON packages.
  const payload = source.payload && typeof source.payload === 'object' ? source.payload : source
  if (!payload.manufacturer || typeof payload.manufacturer !== 'object' || Array.isArray(payload.manufacturer)) throw new Error('invalid-draft')
  const restored = mergeDefaults(initialData, payload)
  restored.metadata.submissionId ||= typeof source.submissionId === 'string' && source.submissionId ? source.submissionId : restored.metadata.trackingNumber || newSubmissionId()
  return restored
}

export type ValidationIssue = { path: string; label: string; step: number }
export const requiredFields: ValidationIssue[] = [
  { path: 'manufacturer.companyName', label: 'نام شرکت / واحد', step: 0 },
  { path: 'manufacturer.responsiblePerson', label: 'نام مدیرعامل / مسئول', step: 0 },
  { path: 'technicalRepresentative.fullName', label: 'نام رابط فنی', step: 1 },
  { path: 'technicalRepresentative.mobile', label: 'تلفن همراه رابط فنی', step: 1 },
  { path: 'product.productName', label: 'نام محصول', step: 1 },
  { path: 'product.version', label: 'نسخه محصول', step: 1 },
  { path: 'assessmentContext.category', label: 'دسته‌بندی محصول', step: 2 },
  { path: 'finalApproval.signerName', label: 'نام و امضای مسئول شرکت', step: 5 }
]

export function validateForm(data: AnyRecord): ValidationIssue[] {
  const issues = requiredFields.filter(({ path }) => !String(getAtPath(data, path) ?? '').trim())
  if (data.assessmentContext.category === 'سایر' && !data.assessmentContext.otherCategory.trim()) {
    issues.push({ path: 'assessmentContext.otherCategory', label: 'شرح دسته‌بندی سایر', step: 2 })
  }
  for (const [path, label, step] of [
    ['manufacturer.email', 'ایمیل شرکت', 0],
    ['technicalRepresentative.email', 'ایمیل رابط فنی', 1],
    ['trainer.email', 'ایمیل کارشناس آموزش', 4]
  ] as const) {
    const email = String(getAtPath(data, path) ?? '').trim()
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) issues.push({ path, label: `${label} معتبر نیست`, step })
  }
  const md5 = data.product.md5Hash.trim()
  if (md5 && !/^[a-fA-F0-9]{32}$/.test(md5)) issues.push({ path: 'product.md5Hash', label: 'هش MD5 باید ۳۲ رقم هگزادسیمال باشد', step: 1 })
  const count = data.apiInventory.endpointCount.trim().replace(/[۰-۹]/g, (d: string) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d: string) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  if (count && !/^\d+$/.test(count)) issues.push({ path: 'apiInventory.endpointCount', label: 'تعداد Endpointها باید عدد صحیح و نامنفی باشد', step: 4 })
  return issues.sort((a, b) => a.step - b.step)
}

export function completionPercent(data: AnyRecord) {
  const fields = [...requiredFields]
  if (data.assessmentContext.category === 'سایر') fields.push({ path: 'assessmentContext.otherCategory', label: '', step: 2 })
  return Math.round(fields.filter(({ path }) => String(getAtPath(data, path) ?? '').trim()).length / fields.length * 100)
}

export function buildPackage(data: AnyRecord, now = new Date()) {
  const payload = clone(data)
  // Normalize optional validation fields without changing passwords or other text.
  for (const path of ['manufacturer.email', 'technicalRepresentative.email', 'trainer.email', 'product.md5Hash']) {
    const parts = path.split('.')
    payload[parts[0]][parts[1]] = String(getAtPath(payload, path) ?? '').trim()
  }
  return {
    packageType: 'project-passport', packageVersion: '1.1.0', schemaVersion: '1.1.0',
    formVersion: 'project-intake-1.1.0', appVersion: '0.2.0',
    submissionId: payload.metadata.submissionId, exportedAt: now.toISOString(), locale: 'fa-IR',
    submission: payload.metadata, producer: payload.manufacturer,
    technicalRepresentative: payload.technicalRepresentative, product: payload.product,
    classification: payload.assessmentContext, testAccounts: payload.testAccounts,
    serverCredentials: payload.technicalDelivery, technicalDetails: payload.technicalDetails,
    apiInventory: payload.apiInventory, documents: payload.documents,
    trainer: payload.trainer, approval: payload.finalApproval, payload
  }
}

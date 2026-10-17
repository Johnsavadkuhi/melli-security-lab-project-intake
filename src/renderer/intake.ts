export type JalaliDate = { year: number; month: number; day: number }

function toJalali(year: number, month: number, day: number): JalaliDate {
  const monthDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let jy = year <= 1600 ? 0 : 979
  const gy = year <= 1600 ? year - 621 : year - 1600
  const gy2 = month > 2 ? gy + 1 : gy
  let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + day + monthDays[month - 1]
  jy += 33 * Math.floor(days / 12053)
  days %= 12053
  jy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365 }
  return { year: jy, month: days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30), day: 1 + (days < 186 ? days % 31 : (days - 186) % 30) }
}

function fromJalali(year: number, month: number, day: number): JalaliDate {
  let gy = year <= 979 ? 621 : 1600
  const jy = year <= 979 ? year : year - 979
  let days = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4) + 78 + day + (month < 7 ? (month - 1) * 31 : (month - 7) * 30 + 186)
  gy += 400 * Math.floor(days / 146097)
  days %= 146097
  if (days > 36524) { gy += 100 * Math.floor(--days / 36524); days %= 36524; if (days >= 365) days++ }
  gy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) { gy += Math.floor((days - 1) / 365); days = (days - 1) % 365 }
  const leap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0
  const monthDays = [0, 31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let gregorianDay = days + 1
  let gregorianMonth = 0
  while (gregorianMonth < 12 && gregorianDay > monthDays[gregorianMonth + 1]) gregorianDay -= monthDays[++gregorianMonth]
  return { year: gy, month: gregorianMonth + 1, day: gregorianDay }
}

function formatDate(date: JalaliDate) {
  return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

function isValidJalali(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  if (month < 1 || month > 12 || day < 1) return false
  if (month <= 6) return day <= 31
  if (month <= 11) return day <= 30
  const next = fromJalali(year + 1, 1, 1)
  const current = fromJalali(year, 1, 1)
  const leap = Date.UTC(next.year, next.month - 1, next.day) - Date.UTC(current.year, current.month - 1, current.day) === 366 * 86400000
  return day <= (leap ? 30 : 29)
}

function normalizeDate(value: unknown) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return ''
  const [year, month, day] = value.split('-').map(Number)
  return year >= 1700 ? formatDate(toJalali(year, month, day)) : isValidJalali(value) ? value : ''
}

export function localDate(date = new Date()) {
  return formatDate(toJalali(date.getFullYear(), date.getMonth() + 1, date.getDate()))
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
  restored.metadata.completionDate = normalizeDate(restored.metadata.completionDate) || localDate()
  restored.finalApproval.date = normalizeDate(restored.finalApproval.date) || localDate()
  restored.metadata.submissionId ||= typeof source.submissionId === 'string' && source.submissionId ? source.submissionId : restored.metadata.trackingNumber || newSubmissionId()
  return restored
}

export type ValidationIssue = { path: string; label: string; step: number }

/**
 * Product versions are numeric, dot-separated release identifiers.
 *
 * The leading `v` is part of the value shown in the form and at least the
 * major/minor/patch components are required. Additional numeric components
 * are allowed so versions such as `v1.0.0.1.2` remain valid.
 */
export function isValidProductVersion(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const normalized = value.trim()
    .replace(/[۰-۹]/g, (digit: string) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit: string) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
  return /^v\d+(?:\.\d+){2,}$/i.test(normalized)
}

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
  const version = String(getAtPath(data, 'product.version') ?? '').trim()
  if (version && !isValidProductVersion(version)) {
    issues.push({ path: 'product.version', label: 'نسخه محصول باید مانند v1.0.0 باشد و فقط بخش‌های عددی جداشده با نقطه داشته باشد', step: 1 })
  }
  const count = data.apiInventory.endpointCount.trim().replace(/[۰-۹]/g, (d: string) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d: string) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
  if (count && !/^\d+$/.test(count)) issues.push({ path: 'apiInventory.endpointCount', label: 'تعداد Endpointها باید عدد صحیح و نامنفی باشد', step: 4 })
  for (const [path, label, step] of [
    ['metadata.completionDate', 'تاریخ تکمیل', 0],
    ['finalApproval.date', 'تاریخ تأیید نهایی', 5]
  ] as const) {
    const date = getAtPath(data, path)
    if (date && !isValidJalali(date)) issues.push({ path, label: `${label} معتبر نیست`, step })
  }
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

/**
 * Database-facing values for the project intake form.
 *
 * Persian labels belong to the UI only. Exported JSON uses these stable
 * lowercase snake_case codes so the database contract does not depend on the
 * language used by the form.
 */

export type NullableBoolean = boolean | null

export const PRODUCT_CATEGORY_CODES = {
  desktopStandalone: 'desktop_standalone',
  windowsClientServer: 'windows_client_server',
  webBased: 'web_based',
  mobileAndroid: 'mobile_android',
  mobileIos: 'mobile_ios',
  other: 'other'
} as const

export type ProductCategoryCode = typeof PRODUCT_CATEGORY_CODES[keyof typeof PRODUCT_CATEGORY_CODES]

const productCategoryByLabel: Record<string, ProductCategoryCode> = {
  'تک‌کاره رومیزی (Desktop)': PRODUCT_CATEGORY_CODES.desktopStandalone,
  'ویندوزی تحت شبکه (Client/Server)': PRODUCT_CATEGORY_CODES.windowsClientServer,
  'سامانه تحت وب (Web-Based)': PRODUCT_CATEGORY_CODES.webBased,
  'اپلیکیشن موبایل – اندروید': PRODUCT_CATEGORY_CODES.mobileAndroid,
  'اپلیکیشن موبایل – iOS': PRODUCT_CATEGORY_CODES.mobileIos,
  'سایر': PRODUCT_CATEGORY_CODES.other
}

export const COMPANY_TYPE_CODES = {
  privateJointStock: 'private_joint_stock',
  publicJointStock: 'public_joint_stock',
  limitedLiability: 'limited_liability',
  cooperative: 'cooperative',
  other: 'other'
} as const

export type CompanyTypeCode = typeof COMPANY_TYPE_CODES[keyof typeof COMPANY_TYPE_CODES]

const companyTypeByLabel: Record<string, CompanyTypeCode> = {
  'سهامی خاص': COMPANY_TYPE_CODES.privateJointStock,
  'سهامی عام': COMPANY_TYPE_CODES.publicJointStock,
  'با مسئولیت محدود': COMPANY_TYPE_CODES.limitedLiability,
  'تعاونی': COMPANY_TYPE_CODES.cooperative,
  'سایر': COMPANY_TYPE_CODES.other
}

export const API_TYPE_CODES = {
  rest: 'rest',
  soap: 'soap',
  graphql: 'graphql',
  grpc: 'grpc'
} as const
export type ApiTypeCode = typeof API_TYPE_CODES[keyof typeof API_TYPE_CODES]

export const DOCUMENTATION_TYPE_CODES = {
  swaggerOpenapi: 'swagger_openapi',
  postmanCollection: 'postman_collection',
  wsdl: 'wsdl',
  custom: 'custom'
} as const
export type DocumentationTypeCode = typeof DOCUMENTATION_TYPE_CODES[keyof typeof DOCUMENTATION_TYPE_CODES]

export const TEST_ACCOUNT_ROLE_CODES = {
  admin: 'admin',
  limited: 'limited'
} as const
export type TestAccountRoleCode = typeof TEST_ACCOUNT_ROLE_CODES[keyof typeof TEST_ACCOUNT_ROLE_CODES]

const apiTypeByLabel: Record<string, string> = {
  REST: API_TYPE_CODES.rest,
  SOAP: API_TYPE_CODES.soap,
  GraphQL: API_TYPE_CODES.graphql,
  gRPC: API_TYPE_CODES.grpc
}

const documentationTypeByLabel: Record<string, string> = {
  'Swagger / OpenAPI': DOCUMENTATION_TYPE_CODES.swaggerOpenapi,
  'Postman Collection': DOCUMENTATION_TYPE_CODES.postmanCollection,
  WSDL: DOCUMENTATION_TYPE_CODES.wsdl,
  'مستندات اختصاصی': DOCUMENTATION_TYPE_CODES.custom
}

const booleanByLabel: Record<string, boolean> = { بله: true, خیر: false }
const labelByBoolean: Record<string, string> = { true: 'بله', false: 'خیر' }

/** Converts the two Persian UI labels to actual JSON booleans. */
export function toNullableBoolean(value: unknown): NullableBoolean {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  if (Object.hasOwn(booleanByLabel, normalized)) return booleanByLabel[normalized]
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return null
}

/** Converts database booleans back to the Persian labels used by the form. */
export function toUiBoolean(value: unknown): string {
  if (typeof value === 'boolean') return labelByBoolean[String(value)]
  if (value === 'بله' || value === 'خیر') return value
  return ''
}

/** Converts a category label or an already standardized code. */
export function toProductCategoryCode(value: unknown): ProductCategoryCode | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  if (Object.values(PRODUCT_CATEGORY_CODES).includes(normalized as ProductCategoryCode)) return normalized as ProductCategoryCode
  return productCategoryByLabel[normalized] ?? null
}

const productCategoryLabelByCode = Object.fromEntries(Object.entries(productCategoryByLabel).map(([label, code]) => [code, label])) as Record<ProductCategoryCode, string>
const companyTypeLabelByCode = Object.fromEntries(Object.entries(companyTypeByLabel).map(([label, code]) => [code, label])) as Record<CompanyTypeCode, string>
const apiTypeLabelByCode = Object.fromEntries(Object.entries(apiTypeByLabel).map(([label, code]) => [code, label])) as Record<string, string>
const documentationTypeLabelByCode = Object.fromEntries(Object.entries(documentationTypeByLabel).map(([label, code]) => [code, label])) as Record<string, string>

/** Converts database codes back to labels when an exported package is reopened as a draft. */
export function restoreFormValues<T extends Record<string, any>>(payload: T): T {
  const assessmentContext = payload.assessmentContext
  if (assessmentContext && typeof assessmentContext === 'object') {
    assessmentContext.category = productCategoryLabelByCode[assessmentContext.category as ProductCategoryCode] ?? assessmentContext.category
    for (const key of ['companyHasPreviousAssessment', 'productPreviouslyAssessed', 'vulnerabilitiesRemediated', 'usedSecurityConsultant', 'hasRemediationTime']) {
      assessmentContext[key] = toUiBoolean(assessmentContext[key])
    }
  }

  const manufacturer = payload.manufacturer
  if (manufacturer && typeof manufacturer === 'object') manufacturer.companyType = companyTypeLabelByCode[manufacturer.companyType as CompanyTypeCode] ?? manufacturer.companyType

  const apiInventory = payload.apiInventory
  if (apiInventory && typeof apiInventory === 'object') {
    apiInventory.apiTypes = Array.isArray(apiInventory.apiTypes) ? apiInventory.apiTypes.map((item: unknown) => apiTypeLabelByCode[String(item)] ?? item) : []
    apiInventory.documentationTypes = Array.isArray(apiInventory.documentationTypes) ? apiInventory.documentationTypes.map((item: unknown) => documentationTypeLabelByCode[String(item)] ?? item) : []
    apiInventory.documentationAvailable = toUiBoolean(apiInventory.documentationAvailable)
    apiInventory.allDocumentedInScope = toUiBoolean(apiInventory.allDocumentedInScope)
  }

  const testAccounts = payload.testAccounts
  if (testAccounts && typeof testAccounts === 'object') {
    for (const account of Object.values(testAccounts)) {
      if (account && typeof account === 'object') {
        const accountRecord = account as Record<string, any>
        if (accountRecord.role === TEST_ACCOUNT_ROLE_CODES.admin) accountRecord.role = 'مدیر (ادمین)'
        if (accountRecord.role === TEST_ACCOUNT_ROLE_CODES.limited) accountRecord.role = 'کاربر محدود'
      }
    }
  }

  return payload
}

function mapCode(value: unknown, labels: Record<string, string>) {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  return labels[normalized] ?? normalized.toLowerCase().replace(/\s+/g, '_')
}

function mapList(value: unknown, labels: Record<string, string>) {
  if (!Array.isArray(value)) return []
  return value.map(item => mapCode(item, labels)).filter((item): item is string => Boolean(item))
}

/**
 * Applies the database contract to a cloned form payload before export.
 * Free-text fields remain untouched; only enumerations and yes/no answers are
 * converted here.
 */
export function standardizeForDatabase<T extends Record<string, any>>(payload: T): T {
  const assessmentContext = payload.assessmentContext
  if (assessmentContext && typeof assessmentContext === 'object') {
    assessmentContext.category = toProductCategoryCode(assessmentContext.category)
    for (const key of ['companyHasPreviousAssessment', 'productPreviouslyAssessed', 'vulnerabilitiesRemediated', 'usedSecurityConsultant', 'hasRemediationTime']) {
      assessmentContext[key] = toNullableBoolean(assessmentContext[key])
    }
  }

  const manufacturer = payload.manufacturer
  if (manufacturer && typeof manufacturer === 'object') manufacturer.companyType = companyTypeByLabel[manufacturer.companyType] ?? manufacturer.companyType

  const apiInventory = payload.apiInventory
  if (apiInventory && typeof apiInventory === 'object') {
    apiInventory.apiTypes = mapList(apiInventory.apiTypes, apiTypeByLabel)
    apiInventory.documentationTypes = mapList(apiInventory.documentationTypes, documentationTypeByLabel)
    apiInventory.documentationAvailable = toNullableBoolean(apiInventory.documentationAvailable)
    apiInventory.allDocumentedInScope = toNullableBoolean(apiInventory.allDocumentedInScope)
  }

  const testAccounts = payload.testAccounts
  if (testAccounts && typeof testAccounts === 'object') {
    for (const account of Object.values(testAccounts)) {
      if (account && typeof account === 'object') {
        const accountRecord = account as Record<string, any>
        if (typeof accountRecord.role === 'string') {
          accountRecord.role = accountRecord.role === 'مدیر (ادمین)' ? TEST_ACCOUNT_ROLE_CODES.admin : accountRecord.role === 'کاربر محدود' ? TEST_ACCOUNT_ROLE_CODES.limited : accountRecord.role
        }
      }
    }
  }

  return payload
}

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowLeft, ArrowRight, Building2, Check, CheckCircle2, ChevronDown, CircleHelp,
  ClipboardCheck, CloudDownload, FileJson, FileText, HardDriveDownload, Info,
  Landmark, LockKeyhole, Menu, RotateCcw, Save, ShieldCheck, Sparkles,
  X
} from 'lucide-react'
import logo from './assets/melli-bank-logo.png'

import { buildPackage, completionPercent, createInitialData, getAtPath, restoreDraft, setAtPath, validateForm } from './intake'
import type { AnyRecord } from './intake'
import { downloadJson, loadDraft as readDraft, saveDraft as persistDraft } from './storage'

function PersianNumber({ children }: { children: ReactNode }) {
  return <span>{String(children).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])}</span>
}

function Welcome({ onStart, onResume, loading }: { onStart: () => void; onResume: () => void; loading: boolean }) {
  return <main className="welcome-page">
    <div className="welcome-glow glow-one" /><div className="welcome-glow glow-two" />
    <header className="welcome-topbar"><div className="brand-mini"><div className="brand-mark"><Landmark size={20}/></div><div><strong>سامانه آفلاین دریافت شناسنامه پروژه</strong><span>نسخه سازمانی آزمایشگاه</span></div></div><span className="secure-pill"><LockKeyhole size={15}/> اجرای کاملاً آفلاین</span></header>
    <section className="hero-grid">
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={16}/> آزمایشگاه امنیت و کیفیت نرم‌افزار</div>
        <h1>شناسنامه پروژه خود را<br/><em>مطمئن و حرفه‌ای</em> تکمیل کنید</h1>
        <p>این نرم‌افزار آفلاین برای دریافت اطلاعات محصولات متقاضی ارزیابی امنیتی طراحی شده است. اطلاعات شما روی همین رایانه ذخیره می‌شود و فقط پس از تأیید شما به‌صورت فایل خروجی در اختیار آزمایشگاه قرار می‌گیرد.</p>
        <div className="hero-actions"><button className="primary-cta" onClick={onStart}><span>شروع تکمیل فرم</span><ArrowLeft size={19}/></button><button className="secondary-cta" disabled={loading} onClick={onResume}><RotateCcw size={17}/> {loading ? 'در حال بازیابی…' : 'بازیابی پیش‌نویس قبلی'}</button></div>
        <div className="hero-assurance"><div><ShieldCheck size={18}/><span>ذخیره محلی و امن</span></div><div><ClipboardCheck size={18}/><span>اعتبارسنجی پیش از خروجی</span></div><div><FileJson size={18}/><span>خروجی استاندارد JSON</span></div></div>
      </div>
      <div className="institution-card">
        <div className="logo-stage"><div className="logo-frame"><img src={logo} alt="لوگوی بانک ملی ایران"/></div></div>
        <div className="institution-copy">
          <div className="institution-name">آزمایشگاه امنیت و کیفیت نرم‌افزار</div>
          <div className="institution-owner">وابسته به بانک ملی ایران</div>
          <div className="institution-rule"/><div className="institution-note">مرجع دریافت اطلاعات اولیه پروژه‌های ارزیابی امنیتی و کیفیت نرم‌افزار</div>
          <div className="trust-row"><span><CheckCircle2 size={16}/> فارسی و راست‌چین</span><span><CheckCircle2 size={16}/> قابل استفاده بدون اینترنت</span></div>
        </div>
      </div>
    </section>
    <footer className="welcome-footer"><span>© آزمایشگاه امنیت و کیفیت نرم‌افزار بانک ملی ایران</span><span>این نسخه برای تکمیل و ارسال امن اطلاعات پروژه تهیه شده است.</span></footer>
  </main>
}

function Field({ path, label, value, onChange, placeholder, type = 'text', required = false, wide = false, readOnly = false }: { path?: string; label: string; value: any; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean; wide?: boolean; readOnly?: boolean }) {
  return <label data-field={path} className={`field ${wide ? 'field-wide' : ''}`}><span>{label}{required && <b className="required">*</b>}</span><input aria-required={required} type={type} value={value ?? ''} placeholder={placeholder} readOnly={readOnly} onChange={e => onChange(e.target.value)}/></label>
}

function TextareaField({ label, value, onChange, placeholder, rows = 4 }: { label: string; value: any; onChange: (value: string) => void; placeholder?: string; rows?: number }) {
  return <label className="field field-wide"><span>{label}</span><textarea rows={rows} value={value ?? ''} placeholder={placeholder} onChange={e => onChange(e.target.value)}/></label>
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="field"><span>{label}</span><div className="select-wrap"><select value={value} onChange={e => onChange(e.target.value)}>{options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={17}/></div></label>
}

function RadioGroup({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <div className="choice-block" role="radiogroup" aria-label={label}><span className="choice-label">{label}</span><div className="choice-row">{options.map(option => <label className={`choice ${value === option ? 'selected' : ''}`} key={option}><input type="radio" name={label} checked={value === option} onChange={() => onChange(option)}/><span>{option}</span></label>)}</div></div>
}

function CheckGroup({ label, values, options, onChange }: { label: string; values: string[]; options: string[]; onChange: (values: string[]) => void }) {
  return <div className="choice-block" role="radiogroup" aria-label={label}><span className="choice-label">{label}</span><div className="choice-row">{options.map(option => <label className={`choice ${values.includes(option) ? 'selected' : ''}`} key={option}><input type="checkbox" checked={values.includes(option)} onChange={() => onChange(values.includes(option) ? values.filter(v => v !== option) : [...values, option])}/><span>{option}</span></label>)}</div></div>
}

function Section({ number, title, icon, children }: { number: string; title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="form-section"><div className="section-heading"><div className="section-number">{number}</div><div><h2>{title}</h2><p>اطلاعات این بخش را با دقت تکمیل کنید.</p></div><div className="section-icon">{icon}</div></div><div className="section-content">{children}</div></section>
}

const steps = ['اطلاعات سازمان', 'نماینده و محصول', 'زمینه ارزیابی', 'الزامات فنی', 'API و مدارک', 'تأیید نهایی']

function App() {
  const [screen, setScreen] = useState<'welcome' | 'form'>('welcome')
  const [data, setData] = useState<AnyRecord>(() => createInitialData())
  const [notice, setNotice] = useState('')
  const [activeStep, setActiveStep] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'unsaved' | 'saving' | 'saved' | 'error'>('unsaved')
  const [exporting, setExporting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const exportLock = useRef(false)
  const revision = useRef(0)
  const noticeTimer = useRef<number | undefined>(undefined)
  const saveTimer = useRef<number | undefined>(undefined)
  const issues = validateForm(data)
  const progress = completionPercent(data)
  const saveLabels = { unsaved: 'تغییرات ذخیره نشده', saving: 'در حال ذخیره…', saved: 'پیش‌نویس ذخیره شد', error: 'خطا در ذخیره؛ دوباره تلاش کنید' }

  const notify = useCallback((message: string) => {
    window.clearTimeout(noticeTimer.current)
    setNotice(message)
    noticeTimer.current = window.setTimeout(() => setNotice(''), 6000)
  }, [])

  const update = useCallback((path: string, value: any) => {
    revision.current += 1
    setSaveStatus('unsaved')
    setData(current => setAtPath(current, path, value))
  }, [])
  const value = useCallback((path: string): any => getAtPath(data, path), [data])

  const save = useCallback(async (snapshot: AnyRecord, version: number) => {
    setSaveStatus('saving')
    try {
      await persistDraft(snapshot)
      if (version === revision.current) setSaveStatus('saved')
      return true
    } catch {
      if (version === revision.current) setSaveStatus('error')
      return false
    }
  }, [])

  useEffect(() => {
    if (screen !== 'form') return
    setSaveStatus('unsaved')
    const version = revision.current
    saveTimer.current = window.setTimeout(() => { void save(data, version) }, 600)
    return () => window.clearTimeout(saveTimer.current)
  }, [data, screen, save])

  useEffect(() => () => window.clearTimeout(noticeTimer.current), [])

  const startNew = () => {
    revision.current += 1
    setData(createInitialData())
    setScreen('form')
    setActiveStep(0)
    setShowValidation(false)
    setNotice('')
  }

  const loadDraft = async () => {
    if (loading) return
    setLoading(true)
    try {
      const saved = await readDraft()
      if (saved === null) {
        startNew()
        notify('پیش‌نویسی ذخیره نشده است؛ فرم جدید ایجاد شد.')
      } else {
        const restored = restoreDraft(saved)
        revision.current += 1
        setData(restored)
        setActiveStep(0)
        setShowValidation(false)
        setScreen('form')
        notify('پیش‌نویس قبلی با موفقیت بازیابی شد.')
      }
    } catch {
      notify('بازیابی پیش‌نویس انجام نشد؛ فایل ذخیره‌شده ممکن است خواندنی یا معتبر نباشد.')
    } finally {
      setLoading(false)
    }
  }

  const exportJson = async () => {
    if (exportLock.current) return
    setShowValidation(true)
    if (issues.length) {
      setActiveStep(issues[0].step)
      setSidebarOpen(false)
      notify('موارد مشخص‌شده را تکمیل یا اصلاح کنید و دوباره خروجی بگیرید.')
      return
    }
    exportLock.current = true
    setExporting(true)
    const exportVersion = revision.current
    const exportSnapshot = data
    window.clearTimeout(saveTimer.current)
    try {
      const packageData = buildPackage(data)
      if (window.electronAPI) {
        const result = await window.electronAPI.exportJson(packageData)
        if (result.canceled) {
          notify('ذخیره فایل لغو شد؛ اطلاعات فرم حفظ شده است.')
          return
        }
        if (!result.ok) throw new Error(result.error || 'json-export-failed')
        notify(`فایل JSON ذخیره شد: ${result.path || ''}`)
      } else {
        downloadJson(packageData, packageData.submissionId)
        notify('دانلود فایل JSON آغاز شد؛ پوشه دانلودهای مرورگر را بررسی کنید.')
      }
    } catch {
      notify('ذخیره فایل JSON انجام نشد؛ مسیر دیگری انتخاب کنید و دوباره تلاش کنید.')
    } finally {
      if (revision.current === exportVersion) await save(exportSnapshot, exportVersion)
      exportLock.current = false
      setExporting(false)
    }
  }

  const saveNow = async () => {
    window.clearTimeout(saveTimer.current)
    const ok = await save(data, revision.current)
    notify(ok ? 'پیش‌نویس روی رایانه ذخیره شد.' : 'ذخیره پیش‌نویس انجام نشد؛ دوباره تلاش کنید.')
  }

  const goHome = async () => {
    window.clearTimeout(saveTimer.current)
    if (await save(data, revision.current)) setScreen('welcome')
    else notify('ذخیره پیش‌نویس انجام نشد؛ پیش از خروج دوباره تلاش کنید.')
  }

  if (screen === 'welcome') return <><Welcome onStart={startNew} onResume={() => void loadDraft()} loading={loading} />{notice && <div className="toast" role="status"><Info size={18}/><span>{notice}</span><button aria-label="بستن پیام" onClick={() => setNotice('')}><X size={15}/></button></div>}</>

  return <div className="app-shell">
    <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-brand"><div className="sidebar-logo"><img src={logo} alt="بانک ملی ایران"/></div><div><strong>آزمایشگاه امنیت</strong><span>و کیفیت نرم‌افزار</span></div><button aria-label="بستن منو" className="close-sidebar" onClick={() => setSidebarOpen(false)}><X size={18}/></button></div>
      <div className="sidebar-caption">فرایند تکمیل شناسنامه پروژه</div>
      <nav className="step-nav">{steps.map((step, index) => { const done = index < activeStep && !issues.some(issue => issue.step === index); return <button key={step} className={`step-item ${activeStep === index ? 'active' : ''} ${done ? 'done' : ''}`} onClick={() => { setActiveStep(index); setSidebarOpen(false) }}><span className="step-dot">{done ? <Check size={14}/> : <PersianNumber>{index + 1}</PersianNumber>}</span><span>{step}</span>{activeStep === index && <ArrowLeft size={15}/>}</button> })}</nav>
      <div className="sidebar-bottom"><div className="offline-card"><div className="offline-icon"><LockKeyhole size={17}/></div><div><strong>حالت آفلاین فعال است</strong><span>اطلاعات به اینترنت ارسال نمی‌شود.</span></div></div><button className="back-home" onClick={() => void goHome()}><ArrowRight size={16}/> بازگشت به صفحه نخست</button></div>
    </aside>
    {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}/>} 
    <main className="workspace">
      <header className="workspace-header"><div className="header-leading"><button aria-label="نمایش مراحل" className="menu-button" onClick={() => setSidebarOpen(true)}><Menu size={21}/></button><div><div className="breadcrumb">صفحه اصلی <ArrowLeft size={13}/> شناسنامه پروژه</div><h1>فرم درخواست ارزیابی امنیتی محصول</h1></div></div><div className="header-actions"><span className={`save-status ${saveStatus}`} role="status"><span className="status-dot"/> {saveLabels[saveStatus]}</span><button className="icon-button" title="ذخیره فوری" onClick={() => void saveNow()}><Save size={18}/></button><button className="header-export" disabled={exporting} aria-label="خروجی JSON" onClick={() => void exportJson()}><FileJson size={17}/> خروجی JSON</button></div></header>
      <div className="workspace-content">
        <div className="form-intro"><div><span className="intro-label"><FileText size={15}/> نسخه آفلاین فرم سازمانی</span><h2>اطلاعات پروژه را مرحله‌به‌مرحله وارد کنید</h2><p>پیش از خروجی گرفتن، همه اطلاعات در همین رایانه اعتبارسنجی و ذخیره می‌شوند.</p></div><div className="completion-meter"><div><span>پیشرفت تکمیل</span><strong><PersianNumber>{progress}%</PersianNumber></strong></div><div className="meter-track"><span style={{ width: `${progress}%` }}/></div></div></div>
        {showValidation && issues.length > 0 && <div className="validation-panel" role="alert"><strong>برای دریافت خروجی، موارد زیر را اصلاح کنید:</strong><ul>{issues.map(issue => <li key={issue.path}><button onClick={() => { setActiveStep(issue.step); window.setTimeout(() => document.querySelector<HTMLElement>(`[data-field="${issue.path}"] input`)?.focus(), 0) }}>{issue.label} — {steps[issue.step]}</button></li>)}</ul></div>}
        {activeStep === 0 && <>
          <Section number="۱" title="اطلاعات تولیدکننده (مالک محصول)" icon={<Building2 size={22}/> }><div className="field-grid"><Field label="نام شرکت / واحد" required path="manufacturer.companyName" value={value('manufacturer.companyName')} onChange={v => update('manufacturer.companyName', v)} placeholder="نام شرکت"/><Field label="نام مدیرعامل / مسئول" required path="manufacturer.responsiblePerson" value={value('manufacturer.responsiblePerson')} onChange={v => update('manufacturer.responsiblePerson', v)} placeholder="نام و نام خانوادگی"/><Field label="شماره ثبت" value={value('manufacturer.registrationNumber')} onChange={v => update('manufacturer.registrationNumber', v)} placeholder="شماره ثبت"/><Field label="شناسه ملی" value={value('manufacturer.nationalId')} onChange={v => update('manufacturer.nationalId', v)} placeholder="شناسه ملی"/><Field label="کد اقتصادی" value={value('manufacturer.economicCode')} onChange={v => update('manufacturer.economicCode', v)} placeholder="کد اقتصادی"/><Field label="کدپستی" value={value('manufacturer.postalCode')} onChange={v => update('manufacturer.postalCode', v)} placeholder="کدپستی"/><SelectField label="نوع شرکت" value={value('manufacturer.companyType')} onChange={v => update('manufacturer.companyType', v)} options={['سهامی خاص', 'سهامی عام', 'با مسئولیت محدود', 'تعاونی', 'سایر']}/><Field label="وب‌سایت" type="url" value={value('manufacturer.website')} onChange={v => update('manufacturer.website', v)} placeholder="https://example.com"/><Field label="ایمیل" type="email" path="manufacturer.email" value={value('manufacturer.email')} onChange={v => update('manufacturer.email', v)} placeholder="info@company.com"/><Field label="تلفن ثابت" type="tel" value={value('manufacturer.landline')} onChange={v => update('manufacturer.landline', v)} placeholder="۰۲۱-XXXX-XXXX"/><Field label="فکس" type="tel" value={value('manufacturer.fax')} onChange={v => update('manufacturer.fax', v)} placeholder="۰۲۱-XXXX-XXXX"/><Field label="شماره قرارداد با بانک ملی" value={value('manufacturer.melliBankContractNumber')} onChange={v => update('manufacturer.melliBankContractNumber', v)} placeholder="شماره قرارداد"/><Field label="آدرس کامل" wide value={value('manufacturer.address')} onChange={v => update('manufacturer.address', v)} placeholder="استان، شهر، خیابان، پلاک ..."/></div></Section>
          <Section number="متادیتا" title="مشخصات ثبت درخواست" icon={<ClipboardCheck size={22}/> }><div className="field-grid"><Field label="تاریخ تکمیل" type="date" value={value('metadata.completionDate')} onChange={v => update('metadata.completionDate', v)}/><Field label="شماره پیگیری (اختیاری)" value={value('metadata.trackingNumber')} onChange={v => update('metadata.trackingNumber', v)} placeholder="شماره داخلی مشتری"/></div></Section>
        </>}
        {activeStep === 1 && <>
          <Section number="۲" title="نماینده (رابط فنی)" icon={<CircleHelp size={22}/> }><div className="field-grid"><Field label="نام و نام خانوادگی" required path="technicalRepresentative.fullName" value={value('technicalRepresentative.fullName')} onChange={v => update('technicalRepresentative.fullName', v)} placeholder="نام نماینده"/><Field label="تلفن همراه" required type="tel" path="technicalRepresentative.mobile" value={value('technicalRepresentative.mobile')} onChange={v => update('technicalRepresentative.mobile', v)} placeholder="۰۹۱۲-XXX-XXXX"/><Field label="ایمیل" type="email" path="technicalRepresentative.email" value={value('technicalRepresentative.email')} onChange={v => update('technicalRepresentative.email', v)} placeholder="rep@company.com"/><Field label="تلفن ثابت" type="tel" value={value('technicalRepresentative.landline')} onChange={v => update('technicalRepresentative.landline', v)} placeholder="۰۲۱-XXXX-XXXX"/></div></Section>
          <Section number="۳" title="شناسه محصول" icon={<Sparkles size={22}/> }><div className="field-grid"><Field label="نام محصول (برند تجاری)" required path="product.productName" value={value('product.productName')} onChange={v => update('product.productName', v)} placeholder="نام محصول"/><Field label="مدل / شماره نسخه (ورژن)" required path="product.version" value={value('product.version')} onChange={v => update('product.version', v)} placeholder="v1.0.0"/><Field label="اداره متولی / بهره‌بردار" value={value('product.ownerDepartment')} onChange={v => update('product.ownerDepartment', v)} placeholder="نام اداره"/><Field label="هش MD5 فایل محصول" path="product.md5Hash" value={value('product.md5Hash')} onChange={v => update('product.md5Hash', v)} placeholder="MD5 hash"/><Field label="دیتاسنتر مقصد برای نصب پس از تأیید" wide value={value('product.targetDatacenter')} onChange={v => update('product.targetDatacenter', v)} placeholder="نام دیتاسنتر"/><TextareaField label="شرح مختصر عملکرد، کاربران هدف و معماری کلی محصول" value={value('product.overview')} onChange={v => update('product.overview', v)} placeholder="شرح کامل محصول ..." rows={5}/></div></Section>
        </>}
        {activeStep === 2 && <Section number="۴" title="دسته‌بندی محصول و سوالات اثرگذار بر زمان / هزینه" icon={<Info size={22}/> }><div className="form-stack"><RadioGroup label="دسته‌بندی محصول (لطفاً یک گزینه انتخاب کنید)" value={value('assessmentContext.category')} onChange={v => update('assessmentContext.category', v)} options={['تک‌کاره رومیزی (Desktop)', 'ویندوزی تحت شبکه (Client/Server)', 'سامانه تحت وب (Web-Based)', 'اپلیکیشن موبایل – اندروید', 'اپلیکیشن موبایل – iOS', 'سایر']}/><Field label="شرح دسته‌بندی سایر" path="assessmentContext.otherCategory" value={value('assessmentContext.otherCategory')} onChange={v => update('assessmentContext.otherCategory', v)} placeholder="در صورت نیاز مشخص کنید"/><div className="notice-box warning"><Info size={19}/><p><strong>توجه:</strong> سامانه‌هایی که صرفاً به‌صورت API یا در محیط Stage ارائه می‌شوند، مشمول فرایند تست نفوذ کامل نخواهند شد. نسخه وب‌اپلیکیشن باید برای ارزیابی ارسال شود.</p></div><div className="question-list"><RadioGroup label="آیا شرکت شما سابقه ارزیابی امنیتی محصولات خود را دارد؟" value={value('assessmentContext.companyHasPreviousAssessment')} onChange={v => update('assessmentContext.companyHasPreviousAssessment', v)} options={['بله', 'خیر']}/><RadioGroup label="آیا این محصول قبلاً مورد ارزیابی امنیتی قرار گرفته است؟" value={value('assessmentContext.productPreviouslyAssessed')} onChange={v => update('assessmentContext.productPreviouslyAssessed', v)} options={['بله', 'خیر']}/><RadioGroup label="در صورت بله، آیا آسیب‌پذیری‌ها رفع گردیده‌اند؟" value={value('assessmentContext.vulnerabilitiesRemediated')} onChange={v => update('assessmentContext.vulnerabilitiesRemediated', v)} options={['بله', 'خیر']}/><RadioGroup label="آیا از شرکت یا مشاور دیگری برای بهبود امنیت کمک گرفته‌اید؟" value={value('assessmentContext.usedSecurityConsultant')} onChange={v => update('assessmentContext.usedSecurityConsultant', v)} options={['بله', 'خیر']}/><Field label="نام مشاور (در صورت وجود)" value={value('assessmentContext.consultantName')} onChange={v => update('assessmentContext.consultantName', v)} placeholder="نام شرکت یا مشاور"/><RadioGroup label="آیا پس از دریافت نتایج آزمون، زمان کافی برای رفع آسیب‌پذیری‌ها دارید؟" value={value('assessmentContext.hasRemediationTime')} onChange={v => update('assessmentContext.hasRemediationTime', v)} options={['بله', 'خیر']}/></div></div></Section>}
        {activeStep === 3 && <>
          <Section number="۵" title="الزامات فنی ارسال محصول به آزمایشگاه" icon={<LockKeyhole size={22}/> }><div className="requirement-list"><div className="requirement"><b>۱</b><p><strong>داده‌های Mask شده:</strong> محصول باید حاوی داده‌های مخدوش باشد تا امکان تست بدون افشای اطلاعات واقعی فراهم شود.</p></div><div className="requirement"><b>۲</b><p><strong>فرمت OVF و هش MD5:</strong> آخرین نسخه محصول را به فرمت OVF به همراه هش MD5 ارسال کنید. فایل OVF باید روی هارد دیسک و بدون فایل‌های اضافی تحویل شود. نسخه ESXi پشتیبانی‌شده ۸ به بالا است.</p></div><div className="requirement danger"><b>۳</b><p><strong>فایل OVF روی فلش مموری پذیرفته نمی‌شود.</strong></p></div><div className="requirement"><b>۴</b><p><strong>سرویس‌های مرتبط:</strong> تمام سرویس‌ها شامل دیتابیس و سرور برنامه باید کامل نصب و راه‌اندازی شده باشند.</p></div><div className="requirement"><b>۵</b><p><strong>بدون محدودیت:</strong> محصول باید فاقد قفل سخت‌افزاری/نرم‌افزاری و محدودیت بر اساس IP یا پورت باشد.</p></div></div><div className="credential-card"><div className="credential-title"><LockKeyhole size={17}/> حساب‌های کاربری تست استاندارد</div><div className="credential-table"><div className="credential-head"><span>نقش</span><span>نام کاربری</span><span>کلمه عبور</span></div><div><span>مدیر (ادمین)</span><code>{value('testAccounts.admin.username')}</code><code>{value('testAccounts.admin.password')}</code></div><div><span>کاربر محدود</span><code>{value('testAccounts.limited.username')}</code><code>{value('testAccounts.limited.password')}</code></div></div></div><h3 className="subsection-title">رمزهای دسترسی سرور برای تنظیمات</h3><div className="field-grid"><Field label="سرور Linux – رمز root" type="password" value={value('technicalDelivery.linuxRootPassword')} onChange={v => update('technicalDelivery.linuxRootPassword', v)} placeholder="********"/><Field label="سرور Linux – رمز oracle" type="password" value={value('technicalDelivery.linuxOraclePassword')} onChange={v => update('technicalDelivery.linuxOraclePassword', v)} placeholder="********"/><Field label="سرور Windows – رمز Administrator" type="password" value={value('technicalDelivery.windowsAdministratorPassword')} onChange={v => update('technicalDelivery.windowsAdministratorPassword', v)} placeholder="********"/></div><div className="notice-box"><Info size={19}/><p>محصول باید در بسترهای شبکه متفاوت بدون محدودیت قابل دسترس باشد.</p></div></Section>
          <Section number="۶" title="توضیحات فنی تکمیلی" icon={<FileText size={22}/> }><div className="technical-prompt"><p>موارد زیر را تشریح کنید:</p><ul><li>شرح مختصر عملکرد محصول و سناریوهای استفاده</li><li>زبان‌های برنامه‌نویسی به‌کاررفته</li><li>تعداد تقریبی جداول، منوها، فرم‌ها، گزارشات و شمای کلی دیتابیس</li><li>نام و نسخه نرم‌افزارهای متن‌باز، ابزارهای جانبی یا کامپوننت‌های خاص</li></ul></div><TextareaField label="توضیحات فنی تکمیلی" value={value('technicalDetails')} onChange={v => update('technicalDetails', v)} placeholder="توضیحات فنی تکمیلی ..." rows={8}/></Section>
        </>}
        {activeStep === 4 && <>
          <Section number="۷" title="فهرست APIهای محصول (API Inventory)" icon={<CloudDownload size={22}/> }><div className="form-stack"><p className="section-lead">در صورت وجود API، اطلاعات زیر را تکمیل نمایید:</p><CheckGroup label="نوع API" values={value('apiInventory.apiTypes') || []} onChange={v => update('apiInventory.apiTypes', v)} options={['REST', 'SOAP', 'GraphQL', 'gRPC']}/><Field label="سایر انواع API" value={value('apiInventory.otherApiType')} onChange={v => update('apiInventory.otherApiType', v)} placeholder="در صورت نیاز مشخص کنید"/><Field label="تعداد تقریبی API Endpointها" path="apiInventory.endpointCount" value={value('apiInventory.endpointCount')} onChange={v => update('apiInventory.endpointCount', v)} placeholder="تعداد Endpointها"/><RadioGroup label="آیا مستندات API در اختیار ارزیاب قرار می‌گیرد؟" value={value('apiInventory.documentationAvailable')} onChange={v => update('apiInventory.documentationAvailable', v)} options={['بله', 'خیر']}/><CheckGroup label="نوع مستندات" values={value('apiInventory.documentationTypes') || []} onChange={v => update('apiInventory.documentationTypes', v)} options={['Swagger / OpenAPI', 'Postman Collection', 'WSDL', 'مستندات اختصاصی']}/><Field label="سایر مستندات" value={value('apiInventory.otherDocumentationType')} onChange={v => update('apiInventory.otherDocumentationType', v)} placeholder="در صورت نیاز مشخص کنید"/><Field label="نسخه مستندات / تاریخ آخرین به‌روزرسانی" value={value('apiInventory.documentationVersion')} onChange={v => update('apiInventory.documentationVersion', v)} placeholder="نسخه یا تاریخ"/><RadioGroup label="آیا تمام API Endpointهای مستندسازی‌شده در Scope ارزیابی قرار دارند؟" value={value('apiInventory.allDocumentedInScope')} onChange={v => update('apiInventory.allDocumentedInScope', v)} options={['بله', 'خیر']}/><TextareaField label="API Endpointهای خارج از Scope" value={value('apiInventory.outOfScopeEndpoints')} onChange={v => update('apiInventory.outOfScopeEndpoints', v)} placeholder="لیست Endpointهای خارج از Scope" rows={4}/></div></Section>
          <Section number="۸" title="گواهی‌ها و مستندات" icon={<HardDriveDownload size={22}/> }><div className="document-checks"><CheckToggle label="کپی رنگی گواهی افتا (در صورت وجود) ضمیمه شود." checked={value('documents.aftaCertificateAttached')} onChange={v => update('documents.aftaCertificateAttached', v)}/><CheckToggle label="مستندات راهنمای نصب و راه‌اندازی ارسال گردد." checked={value('documents.installationGuideAttached')} onChange={v => update('documents.installationGuideAttached', v)}/><CheckToggle label="مستندات آموزشی نحوه استفاده ارسال گردد." checked={value('documents.userTrainingDocumentationAttached')} onChange={v => update('documents.userTrainingDocumentationAttached', v)}/></div></Section>
          <Section number="۹" title="کارشناس آموزش" icon={<CircleHelp size={22}/> }><div className="field-grid"><Field label="نام کارشناس" value={value('trainer.fullName')} onChange={v => update('trainer.fullName', v)} placeholder="نام و نام خانوادگی"/><Field label="تلفن همراه" type="tel" value={value('trainer.mobile')} onChange={v => update('trainer.mobile', v)} placeholder="۰۹۱۲-XXX-XXXX"/><Field label="ایمیل" type="email" path="trainer.email" value={value('trainer.email')} onChange={v => update('trainer.email', v)} placeholder="trainer@company.com"/><Field label="تلفن ثابت" type="tel" value={value('trainer.landline')} onChange={v => update('trainer.landline', v)} placeholder="۰۲۱-XXXX-XXXX"/></div></Section>
        </>}
        {activeStep === 5 && <>
          <Section number="۱۰" title="بازبینی و تأیید نهایی" icon={<CheckCircle2 size={22}/> }><div className="notice-box success"><CheckCircle2 size={19}/><p>با امضای این فرم، صحت اطلاعات فوق را تأیید نموده و متعهد به رعایت کلیه الزامات ذکرشده می‌گردم.</p></div><div className="field-grid"><Field label="نام و امضای مسئول شرکت" required path="finalApproval.signerName" value={value('finalApproval.signerName')} onChange={v => update('finalApproval.signerName', v)} placeholder="نام و امضا"/><Field label="تاریخ" type="date" value={value('finalApproval.date')} onChange={v => update('finalApproval.date', v)}/><Field label="مهر شرکت (در صورت وجود)" value={value('finalApproval.companySeal')} onChange={v => update('finalApproval.companySeal', v)} placeholder="مهر"/></div></Section>
          <div className="final-card"><div className="final-icon"><FileJson size={26}/></div><div><h3>فرم آماده خروجی است؟</h3><p>پس از بازبینی اطلاعات، فایل استاندارد JSON را ذخیره کنید و برای آزمایشگاه ارسال نمایید.</p></div><button className="primary-cta compact" disabled={exporting} onClick={() => void exportJson()}><FileJson size={18}/> دریافت خروجی JSON</button></div>
        </>}
        <div className="form-footer-actions"><button className="nav-button secondary" disabled={activeStep === 0} onClick={() => setActiveStep(step => Math.max(0, step - 1))}><ArrowRight size={17}/> مرحله قبل</button><div className="footer-hint"><Save size={15}/> {saveLabels[saveStatus]}</div>{activeStep < steps.length - 1 ? <button className="nav-button primary" onClick={() => setActiveStep(step => Math.min(steps.length - 1, step + 1))}>مرحله بعد <ArrowLeft size={17}/></button> : <button className="nav-button primary" disabled={exporting} onClick={() => void exportJson()}><FileJson size={17}/> ثبت و دریافت JSON</button>}</div>
        <div className="print-hint">🖨️ برای چاپ یا بایگانی کاغذی، از گزینه Print مرورگر یا میانبر Ctrl/Cmd+P استفاده کنید.</div>
        <div className="reminder-box"><strong>یادآوری:</strong> هرگونه اطلاعات تکمیلی مانند کاتالوگ محصول، مستندات معماری یا ارجاع به وب‌سایت مرجع که به برآورد دقیق‌تر زمان، هزینه و مسیر ارزیابی کمک کند، توصیه می‌شود همراه پرونده ارائه شود.</div>
      </div>
      <footer className="workspace-footer"><span>آزمایشگاه امنیت و کیفیت نرم‌افزار بانک ملی ایران</span><span>تمام اطلاعات در حالت آفلاین نگهداری می‌شود.</span></footer>
    </main>
    {notice && <div className="toast" role="status"><Info size={18}/><span>{notice}</span><button aria-label="بستن پیام" onClick={() => setNotice('')}><X size={15}/></button></div>}
  </div>
}

function CheckToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className={`toggle-check ${checked ? 'checked' : ''}`}><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}/><span className="checkmark">{checked && <Check size={14}/>}</span><span>{label}</span></label>
}

export default App

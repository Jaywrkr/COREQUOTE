import { useState, useEffect, useRef, useCallback } from 'react'
import ClientProfile from './components/steps/ClientProfile'
import SiteChecklist from './components/steps/SiteChecklist'
import DiagramView from './components/steps/DiagramView'
import OutputView from './components/steps/OutputView'
import DomainsSection from './components/DomainsSection'
import { DOMAINS } from './data/domains'
import {
  loadAll, saveAssessment, deleteAssessment,
  duplicateAssessment, createBlankAssessment,
  getCurrentId, setCurrentId,
} from './hooks/useAssessments'

// ─── Icons ────────────────────────────────────────────────────────────────────
const SunIcon  = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
const MoonIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
const ChevronIcon = ({ open }) => (
  <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)
const IBMLogo = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="currentColor">
    <rect x="0" y="0" width="32" height="4" /><rect x="0" y="8" width="32" height="4" />
    <rect x="4" y="16" width="24" height="4" /><rect x="4" y="24" width="24" height="4" />
  </svg>
)

// ─── Utils ────────────────────────────────────────────────────────────────────
function relativeTime(ts) {
  if (!ts) return ''
  const d = Date.now() - ts
  if (d < 15000)      return 'ahora mismo'
  if (d < 60000)      return `hace ${Math.floor(d / 1000)}s`
  if (d < 3600000)    return `hace ${Math.floor(d / 60000)} min`
  if (d < 86400000)   return `hace ${Math.floor(d / 3600000)} h`
  if (d < 604800000)  return `hace ${Math.floor(d / 86400000)} d`
  return new Date(ts).toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

function domainReadiness(domainId, answers) {
  const TOTALS = { redes: 12, seguridad: 9, servidores: 7, storage: 5, backup: 8, virtualizacion: 6 }
  const filled = Object.keys(answers || {}).filter(k => k !== '_restricciones').length
  const total  = TOTALS[domainId] || 8
  const pct    = filled / total
  return pct === 0 ? '#8d8d8d' : pct < 0.6 ? '#f1c21b' : '#24a148'
}

// ─── Section status dot ───────────────────────────────────────────────────────
function StatusDot({ filled, total }) {
  if (!total) return <span className="w-2 h-2 rounded-full bg-ibm-gray50 flex-shrink-0" />
  const pct   = filled / total
  const color = pct === 0 ? '#8d8d8d' : pct < 0.6 ? '#f1c21b' : '#24a148'
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
}

// ─── Collapsible section ──────────────────────────────────────────────────────
function Section({ id, icon, title, meta, filled, total, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div id={id} className="border-b border-ibm-gray20 dark:border-ibm-gray80">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-ibm-gray10 dark:hover:bg-ibm-gray90 transition-colors"
      >
        <span className="text-lg flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-ibm-gray100 dark:text-ibm-gray10">{title}</span>
          {meta && <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30 mt-0.5">{meta}</p>}
        </div>
        <StatusDot filled={filled || 0} total={total} />
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="px-4 pb-6 pt-1 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Sheet overlay ────────────────────────────────────────────────────────────
function Sheet({ title, onClose, children, wide }) {
  const ref = useRef()
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const maxW = wide ? 'lg:max-w-4xl' : 'lg:max-w-3xl'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end lg:justify-center lg:items-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={ref}
        onClick={e => e.stopPropagation()}
        className={`surface w-full ${maxW} lg:rounded-none flex flex-col overflow-hidden`}
        style={{ animation: 'sheetIn 0.22s cubic-bezier(0.16,1,0.3,1)', height: '88vh' }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-ibm-gray20 dark:border-ibm-gray80 flex-shrink-0">
          <span className="text-sm font-semibold text-ibm-gray100 dark:text-ibm-gray10">{title}</span>
          <button onClick={onClose} className="btn-ghost p-1.5 text-ibm-gray50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div style={{ height: 'calc(88vh - 61px)' }} className="overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

// ─── Assessment card ──────────────────────────────────────────────────────────
function AssessmentCard({ a, isCurrent, onLoad, onDuplicate, onDelete }) {
  const activeDomains = DOMAINS.filter(d => a.domains.includes(d.id))
  const totalFields   = Object.values(a.answers || {}).reduce(
    (acc, d) => acc + Object.keys(d || {}).filter(k => k !== '_restricciones').length, 0
  )

  return (
    <div
      className={`border transition-all ${
        isCurrent
          ? 'border-ibm-blue bg-ibm-blue/5'
          : 'border-ibm-gray20 dark:border-ibm-gray80 bg-white dark:bg-ibm-gray90 hover:border-ibm-gray50 dark:hover:border-ibm-gray60'
      }`}
    >
      {/* Card header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ibm-gray100 dark:text-ibm-gray10 truncate">
              {a.client?.company || <span className="text-ibm-gray50 font-normal italic">Sin nombre</span>}
            </p>
            {a.client?.contact && (
              <p className="text-xs text-ibm-gray50 mt-0.5 truncate">{a.client.contact}</p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isCurrent && (
              <span className="text-[10px] px-1.5 py-0.5 bg-ibm-blue text-white font-bold tracking-wide">
                ACTIVA
              </span>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-2 text-[11px] text-ibm-gray50 font-mono">
          <span>{relativeTime(a.savedAt)}</span>
          {totalFields > 0 && <span>· {totalFields} campos</span>}
          {a.client?.industry && <span className="hidden sm:inline">· {a.client.industry}</span>}
        </div>
      </div>

      {/* Domain pills */}
      {activeDomains.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1">
          {activeDomains.map(d => (
            <span
              key={d.id}
              className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 font-mono border"
              style={{ borderColor: d.color + '70', color: d.color, backgroundColor: d.color + '12' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: domainReadiness(d.id, a.answers?.[d.id]) }}
              />
              {d.label}
            </span>
          ))}
        </div>
      )}

      {activeDomains.length === 0 && (
        <p className="px-4 pb-3 text-xs text-ibm-gray50 italic">Sin dominios activos</p>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2 border-t border-ibm-gray20 dark:border-ibm-gray80 pt-3">
        {!isCurrent && (
          <button
            onClick={onLoad}
            className="btn-primary text-xs py-1.5 px-4 flex-1"
          >
            Abrir visita
          </button>
        )}
        {isCurrent && (
          <span className="text-xs text-ibm-blue font-medium flex-1">Visita en pantalla</span>
        )}
        <button
          onClick={onDuplicate}
          title="Duplicar"
          className="btn-ghost p-2 text-ibm-gray50"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        {!isCurrent && (
          <button
            onClick={onDelete}
            title="Eliminar"
            className="p-2 text-ibm-red/60 hover:text-ibm-red hover:bg-ibm-red/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Assessments manager ──────────────────────────────────────────────────────
function AssessmentsManager({ currentId, onLoad, onNew, onClose }) {
  const [list, setList] = useState(() => loadAll().sort((a, b) => b.savedAt - a.savedAt))

  const handleDelete = id => {
    if (!window.confirm('¿Eliminar esta visita? No se puede deshacer.')) return
    deleteAssessment(id)
    setList(loadAll().sort((a, b) => b.savedAt - a.savedAt))
  }

  const handleDuplicate = id => {
    const copy = duplicateAssessment(id)
    if (copy) setList(loadAll().sort((a, b) => b.savedAt - a.savedAt))
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-ibm-gray20 dark:border-ibm-gray80 flex items-center justify-between flex-shrink-0">
        <p className="text-xs text-ibm-gray50">
          {list.length} visita{list.length !== 1 ? 's' : ''} guardada{list.length !== 1 ? 's' : ''}
        </p>
        <button onClick={onNew} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva visita
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-5">
        {list.length === 0 ? (
          <div className="text-center py-16 text-ibm-gray50">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm font-medium">No hay visitas guardadas</p>
            <p className="text-xs mt-1">Las visitas se guardan automáticamente.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {list.map(a => (
              <AssessmentCard
                key={a.id}
                a={a}
                isCurrent={a.id === currentId}
                onLoad={() => { onLoad(a); onClose() }}
                onDuplicate={() => handleDuplicate(a.id)}
                onDelete={() => handleDelete(a.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Autosave indicator ───────────────────────────────────────────────────────
function SaveIndicator({ savedAt }) {
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!savedAt) return
    const update = () => setLabel(relativeTime(savedAt))
    update()
    const interval = setInterval(update, 15000)
    return () => clearInterval(interval)
  }, [savedAt])

  if (!savedAt) return null
  return (
    <span className="text-[11px] text-ibm-gray50 font-mono hidden sm:inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-ibm-green inline-block" style={{ backgroundColor: '#24a148' }} />
      {label}
    </span>
  )
}

// ─── Desktop sidebar ──────────────────────────────────────────────────────────
function Sidebar({ client, domains, answers }) {
  const activeDomains = DOMAINS.filter(d => domains.includes(d.id))
  const totalFilled = Object.values(answers).reduce(
    (acc, d) => acc + Object.keys(d || {}).filter(k => k !== '_restricciones').length, 0
  )
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <aside className="hidden lg:flex flex-col sticky top-0 h-screen border-r border-ibm-gray20 dark:border-ibm-gray80 bg-white dark:bg-ibm-gray90 overflow-y-auto">
      <div className="p-4 space-y-5 flex-1">
        <div>
          <p className="field-label mb-2">Secciones</p>
          <div className="space-y-0.5">
            {[
              { id: 'sec-cliente',  label: 'Cliente' },
              { id: 'sec-entorno',  label: 'Entorno físico' },
              { id: 'sec-dominios', label: 'Dominios' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="w-full text-left px-3 py-2 text-xs text-ibm-gray60 dark:text-ibm-gray30 hover:bg-ibm-gray10 dark:hover:bg-ibm-gray80 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="field-label mb-2">Dominios activos</p>
          {activeDomains.length === 0 && (
            <p className="text-xs text-ibm-gray50">Ninguno habilitado</p>
          )}
          <div className="space-y-1.5">
            {activeDomains.map(d => {
              const color = domainReadiness(d.id, answers[d.id])
              return (
                <div key={d.id} className="flex items-center gap-2">
                  <span style={{ color: d.color }} className="text-sm">{d.icon}</span>
                  <span className="text-xs text-ibm-gray100 dark:text-ibm-gray10 flex-1 truncate">{d.label}</span>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-ibm-gray20 dark:border-ibm-gray80 space-y-1">
          <p className="text-xs text-ibm-gray50">
            <span className="text-ibm-blue font-semibold">{totalFilled}</span> campos completados
          </p>
          <p className="text-xs text-ibm-gray50">
            <span className="text-ibm-blue font-semibold">{domains.length}</span> dominios activos
          </p>
        </div>
      </div>
    </aside>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true)
  const [sheet, setSheet] = useState(null)   // 'diagrama' | 'reporte' | 'visitas' | null
  const [savedAt, setSavedAt] = useState(null)

  // ── Assessment state ──
  const [id, setId]           = useState(null)
  const [client, setClient]   = useState({})
  const [site, setSite]       = useState({})
  const [domains, setDomains] = useState([])
  const [answers, setAnswers] = useState({})
  const [diagram, setDiagram] = useState(null) // { nodes, edges } | null = not yet generated

  const isLoaded = useRef(false)
  const saveTimer = useRef(null)

  // ── Load on mount ──
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    const all     = loadAll()
    const curId   = getCurrentId()
    const current = (curId && all.find(a => a.id === curId)) || all[all.length - 1]

    if (current) {
      applyAssessment(current)
    } else {
      const blank = createBlankAssessment()
      applyAssessment(blank)
      saveAssessment(blank)
      setSavedAt(blank.savedAt)
    }

    setTimeout(() => { isLoaded.current = true }, 100)
  }, [])

  function applyAssessment(a) {
    setId(a.id)
    setClient(a.client  || {})
    setSite(a.site      || {})
    setDomains(a.domains || [])
    setAnswers(a.answers || {})
    setDiagram(a.diagram || null)
    setSavedAt(a.savedAt || null)
  }

  // ── Autosave — debounced 600ms after any change ──
  const scheduleAutosave = useCallback((currentId, currentClient, currentSite, currentDomains, currentAnswers, currentDiagram) => {
    if (!isLoaded.current || !currentId) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const result = saveAssessment({
        id: currentId,
        client: currentClient,
        site:   currentSite,
        domains: currentDomains,
        answers: currentAnswers,
        diagram: currentDiagram,
      })
      setSavedAt(result.savedAt)
    }, 600)
  }, [])

  useEffect(() => {
    scheduleAutosave(id, client, site, domains, answers, diagram)
    return () => clearTimeout(saveTimer.current)
  }, [id, client, site, domains, answers, diagram, scheduleAutosave])

  // ── New assessment ──
  function handleNew() {
    const blank = createBlankAssessment()
    saveAssessment(blank)
    applyAssessment(blank)
    isLoaded.current = false
    setTimeout(() => { isLoaded.current = true }, 100)
    setSheet(null)
  }

  // ── Load an existing assessment ──
  function handleLoad(a) {
    isLoaded.current = false
    applyAssessment(a)
    setCurrentId(a.id)
    setTimeout(() => { isLoaded.current = true }, 100)
  }

  const assessment   = { client, site, domains, answers, diagram }
  const clientFields = Object.values(client).filter(v => v?.toString().trim()).length
  const siteChecks   = Object.values(site.checks || {}).filter(Boolean).length

  return (
    <div className="min-h-screen flex flex-col bg-ibm-gray10 dark:bg-ibm-gray100">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 surface border-b border-ibm-gray20 dark:border-ibm-gray80 no-print">
        <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center gap-3">
          <IBMLogo className="w-5 h-5 text-ibm-blue flex-shrink-0" />
          <span className="text-sm font-semibold tracking-tight hidden sm:block text-ibm-gray100 dark:text-ibm-gray10">
            CoreSolutions <span className="text-ibm-gray50 font-normal">/ Assessment</span>
          </span>

          {/* Current assessment name — clickable to open manager */}
          <button
            onClick={() => setSheet('visitas')}
            className="flex items-center gap-1.5 group"
          >
            {client.company ? (
              <span className="text-xs px-2 py-1 bg-ibm-blue-10 dark:bg-ibm-blue/20 text-ibm-blue border border-ibm-blue/30 font-medium truncate max-w-[120px] sm:max-w-[200px] group-hover:border-ibm-blue transition-colors">
                {client.company}
              </span>
            ) : (
              <span className="text-xs text-ibm-gray50 group-hover:text-ibm-gray30 transition-colors">
                Sin cliente
              </span>
            )}
            <svg className="w-3 h-3 text-ibm-gray50 group-hover:text-ibm-gray30 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div className="ml-auto flex items-center gap-3">
            <SaveIndicator savedAt={savedAt} />
            <button onClick={() => setDark(d => !d)} className="btn-ghost p-2">
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Layout ── */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full lg:grid lg:grid-cols-[200px_1fr]">
        <Sidebar client={client} domains={domains} answers={answers} />

        <main className="pb-24 lg:pb-6">

          <Section
            id="sec-cliente"
            icon="🏢"
            title="Cliente"
            meta={client.company ? `${client.company}${client.industry ? ` · ${client.industry}` : ''}` : 'Toca para completar'}
            filled={clientFields}
            total={6}
          >
            <ClientProfile data={client} onChange={setClient} />
          </Section>

          <Section
            id="sec-entorno"
            icon="🏗️"
            title="Entorno físico"
            meta={siteChecks > 0
              ? `${siteChecks} condiciones verificadas${(site.inventario || []).length > 0 ? ` · ${site.inventario.length} equipos` : ''}`
              : 'Site, rack, energía, cableado, ISP, inventario'}
            filled={siteChecks}
            total={24}
          >
            <SiteChecklist data={site} onChange={setSite} />
          </Section>

          <div id="sec-dominios">
            <div className="px-4 py-3 border-b border-ibm-gray20 dark:border-ibm-gray80">
              <p className="text-xs font-semibold uppercase tracking-widest text-ibm-gray50 dark:text-ibm-gray30">
                Dominios — habilita los que aplican
              </p>
            </div>
            <DomainsSection
              domains={domains}
              setDomains={setDomains}
              answers={answers}
              onChange={setAnswers}
            />
          </div>

        </main>
      </div>

      {/* ── Fixed bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 surface border-t border-ibm-gray20 dark:border-ibm-gray80 no-print">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center gap-3">
          <button
            onClick={() => setSheet('diagrama')}
            disabled={domains.length === 0}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            Diagrama
          </button>
          <button
            onClick={() => setSheet('reporte')}
            disabled={!client.company}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reporte
          </button>
          <button
            onClick={() => setSheet('visitas')}
            className="btn-ghost p-3 text-ibm-gray50 relative"
            title="Mis visitas"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Sheet overlays ── */}
      {sheet === 'diagrama' && (
        <Sheet title="Diagrama de arquitectura" onClose={() => setSheet(null)}>
          <DiagramView assessment={assessment} onDiagramChange={setDiagram} />
        </Sheet>
      )}
      {sheet === 'reporte' && (
        <Sheet title="Reporte" onClose={() => setSheet(null)}>
          <div className="overflow-y-auto h-full px-5 py-5">
            <OutputView assessment={assessment} />
          </div>
        </Sheet>
      )}
      {sheet === 'visitas' && (
        <Sheet title="Mis visitas" onClose={() => setSheet(null)} wide>
          <AssessmentsManager
            currentId={id}
            onLoad={handleLoad}
            onNew={handleNew}
            onClose={() => setSheet(null)}
          />
        </Sheet>
      )}
    </div>
  )
}

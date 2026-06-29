import { useState, useEffect, useRef } from 'react'
import ClientProfile from './components/steps/ClientProfile'
import SiteChecklist from './components/steps/SiteChecklist'
import DiagramView from './components/steps/DiagramView'
import OutputView from './components/steps/OutputView'
import DomainsSection from './components/DomainsSection'
import { DOMAINS } from './data/domains'

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

// ─── Section status dot ───────────────────────────────────────────────────────
function StatusDot({ filled, total }) {
  if (!total) return <span className="w-2 h-2 rounded-full bg-ibm-gray50 flex-shrink-0" />
  const pct = filled / total
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
function Sheet({ title, onClose, children }) {
  const ref = useRef()
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end lg:justify-center lg:items-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={ref}
        onClick={e => e.stopPropagation()}
        className="surface w-full lg:max-w-3xl lg:rounded-none max-h-[92vh] lg:max-h-[88vh] flex flex-col overflow-hidden"
        style={{ animation: 'sheetIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-ibm-gray20 dark:border-ibm-gray80 flex-shrink-0">
          <span className="text-sm font-semibold text-ibm-gray100 dark:text-ibm-gray10">{title}</span>
          <button onClick={onClose} className="btn-ghost p-1.5 text-ibm-gray50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Sheet body */}
        <div className="overflow-y-auto flex-1 px-5 py-5">{children}</div>
      </div>
    </div>
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
        {/* Sections nav */}
        <div>
          <p className="field-label mb-2">Secciones</p>
          <div className="space-y-0.5">
            {[
              { id: 'sec-cliente', label: 'Cliente' },
              { id: 'sec-entorno', label: 'Entorno físico' },
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

        {/* Domain status */}
        <div>
          <p className="field-label mb-2">Dominios activos</p>
          {activeDomains.length === 0 && (
            <p className="text-xs text-ibm-gray50">Ninguno habilitado</p>
          )}
          <div className="space-y-1.5">
            {activeDomains.map(d => {
              const filled = Object.keys(answers[d.id] || {}).filter(k => k !== '_restricciones').length
              const TOTALS = { redes: 12, seguridad: 9, servidores: 7, storage: 5, backup: 8, virtualizacion: 6 }
              const total = TOTALS[d.id] || 8
              const pct = filled / total
              const color = pct === 0 ? '#8d8d8d' : pct < 0.6 ? '#f1c21b' : '#24a148'
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

        {/* Stats */}
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
  const [dark, setDark]       = useState(true)
  const [client, setClient]   = useState({})
  const [site, setSite]       = useState({})
  const [domains, setDomains] = useState([])        // all off by default
  const [answers, setAnswers] = useState({})
  const [sheet, setSheet]     = useState(null)      // 'diagrama' | 'reporte' | null

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const assessment = { client, site, domains, answers }

  const clientFields = Object.values(client).filter(v => v?.toString().trim()).length
  const siteChecks   = Object.values(site.checks || {}).filter(Boolean).length
  const totalFilled  = Object.values(answers).reduce(
    (acc, d) => acc + Object.keys(d || {}).filter(k => k !== '_restricciones').length, 0
  )

  return (
    <div className="min-h-screen flex flex-col bg-ibm-gray10 dark:bg-ibm-gray100">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 surface border-b border-ibm-gray20 dark:border-ibm-gray80 no-print">
        <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center gap-3">
          <IBMLogo className="w-5 h-5 text-ibm-blue flex-shrink-0" />
          <span className="text-sm font-semibold tracking-tight hidden sm:block text-ibm-gray100 dark:text-ibm-gray10">
            CoreSolutions <span className="text-ibm-gray50 font-normal">/ Assessment</span>
          </span>

          {client.company ? (
            <span className="text-xs px-2 py-1 bg-ibm-blue-10 dark:bg-ibm-blue/20 text-ibm-blue border border-ibm-blue/30 font-medium truncate max-w-[140px] sm:max-w-none">
              {client.company}
            </span>
          ) : (
            <span className="text-xs text-ibm-gray50">Sin cliente</span>
          )}

          <div className="ml-auto flex items-center gap-2">
            {(totalFilled > 0 || domains.length > 0) && (
              <span className="text-xs text-ibm-gray50 font-mono hidden sm:block">
                {totalFilled} campos · {domains.length} dominios
              </span>
            )}
            <button onClick={() => setDark(d => !d)} className="btn-ghost p-2">
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Layout ── */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full lg:grid lg:grid-cols-[200px_1fr]">

        <Sidebar client={client} domains={domains} answers={answers} />

        {/* ── Main scroll area ── */}
        <main className="pb-24 lg:pb-6">

          {/* Cliente */}
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

          {/* Entorno */}
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

          {/* Dominios */}
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
            onClick={() => {
              if (window.confirm('¿Iniciar una nueva visita? Los datos actuales se perderán.')) {
                setClient({}); setSite({}); setDomains([]); setAnswers({})
              }
            }}
            className="btn-ghost p-3 text-ibm-gray50"
            title="Nueva visita"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Sheet overlays ── */}
      {sheet === 'diagrama' && (
        <Sheet title="Diagrama de arquitectura" onClose={() => setSheet(null)}>
          <DiagramView assessment={assessment} />
        </Sheet>
      )}
      {sheet === 'reporte' && (
        <Sheet title="Reporte" onClose={() => setSheet(null)}>
          <OutputView assessment={assessment} />
        </Sheet>
      )}
    </div>
  )
}

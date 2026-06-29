import { useState, useEffect } from 'react'
import ClientProfile from './components/steps/ClientProfile'
import Questionnaire from './components/steps/Questionnaire'
import DiagramView from './components/steps/DiagramView'
import OutputView from './components/steps/OutputView'

const STEPS = [
  { id: 'cliente',      label: 'Cliente',    short: '01' },
  { id: 'evaluacion',   label: 'Evaluación', short: '02' },
  { id: 'diagrama',     label: 'Diagrama',   short: '03' },
  { id: 'reporte',      label: 'Reporte',    short: '04' },
]

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  )
}

export default function App() {
  const [step, setStep] = useState(0)
  const [dark, setDark] = useState(true)
  const [client, setClient] = useState({})
  const [domains, setDomains] = useState(['redes', 'seguridad'])
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const assessment = { client, domains, answers }

  const canNext = () => {
    if (step === 0) return !!client.company?.trim()
    return true
  }

  const filledCount = Object.values(answers).reduce((acc, d) => acc + Object.keys(d || {}).length, 0)

  return (
    <div className="min-h-screen flex flex-col bg-ibm-gray10 dark:bg-ibm-gray100">

      {/* Top bar */}
      <header className="surface border-b border-ibm-gray20 dark:border-ibm-gray80 no-print">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 h-12 flex items-center gap-4">
          {/* Logo / wordmark */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <svg viewBox="0 0 32 32" className="w-6 h-6 text-ibm-blue flex-shrink-0" fill="currentColor">
              <rect x="0" y="0" width="32" height="4" />
              <rect x="0" y="8" width="32" height="4" />
              <rect x="4" y="16" width="24" height="4" />
              <rect x="4" y="24" width="24" height="4" />
            </svg>
            <span className="text-sm font-semibold tracking-tight hidden sm:block">
              CoreSolutions <span className="text-ibm-gray50 font-normal">/ Assessment</span>
            </span>
          </div>

          {/* Client name pill */}
          {client.company && (
            <span className="text-xs px-2.5 py-1 bg-ibm-blue-10 dark:bg-ibm-blue/20 text-ibm-blue border border-ibm-blue/30 font-medium truncate max-w-[160px]">
              {client.company}
            </span>
          )}

          {filledCount > 0 && (
            <span className="text-xs text-ibm-gray50 dark:text-ibm-gray30 hidden md:block">
              {filledCount} campos completados
            </span>
          )}

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setDark(d => !d)}
              className="btn-ghost p-2"
              title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* Step nav */}
      <nav className="surface border-b border-ibm-gray20 dark:border-ibm-gray80 no-print">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 flex">
          {STEPS.map((s, i) => {
            const done = i < step
            const active = i === step
            return (
              <button
                key={s.id}
                onClick={() => i <= step && setStep(i)}
                disabled={i > step}
                className={`flex-1 flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-2
                            py-3 px-2 text-xs sm:text-sm font-medium border-b-2 transition-colors
                            ${active
                              ? 'border-ibm-blue text-ibm-blue'
                              : done
                              ? 'border-transparent text-ibm-gray60 dark:text-ibm-gray30 hover:text-ibm-gray100 dark:hover:text-ibm-gray10 cursor-pointer'
                              : 'border-transparent text-ibm-gray50 cursor-not-allowed opacity-40'
                            }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0
                                  ${active ? 'bg-ibm-blue text-white'
                                  : done  ? 'bg-ibm-green text-white'
                                  : 'bg-ibm-gray20 dark:bg-ibm-gray70 text-ibm-gray60 dark:text-ibm-gray30'}`}>
                  {done ? '✓' : s.short}
                </span>
                <span className="hidden sm:block">{s.label}</span>
                <span className="block sm:hidden text-[10px]">{s.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Main content — responsive: single col mobile, sidebar+content on lg */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 lg:px-8 py-6 lg:py-8">
        <div className={`${step === 1 ? 'lg:grid lg:grid-cols-[260px_1fr] lg:gap-8' : 'max-w-2xl'}`}>
          {step === 0 && (
            <div className="step-enter">
              <SectionHeader title="Datos del cliente" sub="Información básica para identificar la visita" />
              <ClientProfile data={client} onChange={setClient} />
            </div>
          )}

          {step === 1 && (
            <Questionnaire
              domains={domains}
              setDomains={setDomains}
              answers={answers}
              onChange={setAnswers}
            />
          )}

          {step === 2 && (
            <div className="step-enter">
              <SectionHeader title="Diagrama de arquitectura" sub="Generado automáticamente — basado en los datos completados" />
              <DiagramView assessment={assessment} />
            </div>
          )}

          {step === 3 && (
            <div className="step-enter">
              <SectionHeader title="Reporte" sub="Genera el documento según la audiencia" />
              <OutputView assessment={assessment} />
            </div>
          )}
        </div>
      </main>

      {/* Bottom nav */}
      <footer className="surface border-t border-ibm-gray20 dark:border-ibm-gray80 no-print">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="btn-secondary disabled:opacity-30"
          >
            ← Anterior
          </button>

          <span className="text-xs text-ibm-gray50 hidden sm:block">
            Paso {step + 1} de {STEPS.length}
          </span>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="btn-primary">
              {step === STEPS.length - 2 ? 'Ver reporte →' : 'Siguiente →'}
            </button>
          ) : (
            <button
              onClick={() => { setStep(0); setClient({}); setDomains(['redes', 'seguridad']); setAnswers({}) }}
              className="btn-secondary"
            >
              Nueva visita
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

function SectionHeader({ title, sub }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl lg:text-2xl font-semibold text-ibm-gray100 dark:text-ibm-gray10">{title}</h1>
      {sub && <p className="text-sm text-ibm-gray60 dark:text-ibm-gray30 mt-1">{sub}</p>}
    </div>
  )
}

import { useState } from 'react'
import ClientProfile from './components/steps/ClientProfile'
import DomainSelector from './components/steps/DomainSelector'
import Questionnaire from './components/steps/Questionnaire'
import DiagramView from './components/steps/DiagramView'
import OutputView from './components/steps/OutputView'

const STEPS = [
  { id: 'cliente', label: 'Cliente', icon: '🏢' },
  { id: 'dominios', label: 'Dominios', icon: '⚙️' },
  { id: 'cuestionario', label: 'Evaluación', icon: '📝' },
  { id: 'diagrama', label: 'Diagrama', icon: '🗺️' },
  { id: 'output', label: 'Reporte', icon: '📄' },
]

export default function App() {
  const [step, setStep] = useState(0)
  const [client, setClient] = useState({})
  const [domains, setDomains] = useState([])
  const [answers, setAnswers] = useState({})

  const assessment = { client, domains, answers }

  const canNext = () => {
    if (step === 0) return !!client.company
    if (step === 1) return domains.length > 0
    return true
  }

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep(s => Math.max(s - 1, 0))

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-core-blue text-white px-5 pt-safe pt-6 pb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">CS</span>
          </div>
          <div>
            <p className="text-xs text-blue-200 font-medium">CoreSolutions</p>
            <p className="text-sm font-bold leading-tight">Assessment Tool</p>
          </div>
          {client.company && (
            <div className="ml-auto text-right">
              <p className="text-xs text-blue-200">Cliente</p>
              <p className="text-xs font-semibold truncate max-w-[120px]">{client.company}</p>
            </div>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex flex-col items-center gap-0.5 flex-1 transition-opacity ${
                  i > step ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all ${
                  i === step
                    ? 'bg-white text-core-blue shadow-lg scale-110'
                    : i < step
                    ? 'bg-white/30 text-white'
                    : 'bg-white/10 text-white/60'
                }`}>
                  {i < step ? '✓' : s.icon}
                </div>
                <span className="text-[9px] text-white/80 font-medium hidden sm:block">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 max-w-[20px] transition-all ${i < step ? 'bg-white/60' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 overflow-y-auto">
        <div className="mb-4">
          <h1 className="text-lg font-bold text-gray-900">{STEPS[step].label}</h1>
          <p className="text-sm text-gray-500">
            {step === 0 && 'Información básica del cliente'}
            {step === 1 && 'Selecciona las áreas a evaluar'}
            {step === 2 && 'Responde las preguntas por dominio'}
            {step === 3 && 'Arquitectura actual y propuesta'}
            {step === 4 && 'Genera el reporte para el cliente'}
          </p>
        </div>

        {step === 0 && <ClientProfile data={client} onChange={setClient} />}
        {step === 1 && <DomainSelector selected={domains} onChange={setDomains} />}
        {step === 2 && <Questionnaire domains={domains} answers={answers} onChange={setAnswers} />}
        {step === 3 && <DiagramView assessment={assessment} />}
        {step === 4 && <OutputView assessment={assessment} />}
      </div>

      {/* Navigation */}
      <div className="px-4 py-4 border-t border-gray-100 bg-white flex gap-3 no-print">
        {step > 0 && (
          <button onClick={prev} className="btn-secondary flex-shrink-0">
            ← Atrás
          </button>
        )}
        {step < STEPS.length - 1 && (
          <button onClick={next} disabled={!canNext()} className="btn-primary flex-1">
            {step === STEPS.length - 2 ? 'Ver reporte →' : 'Continuar →'}
          </button>
        )}
        {step === STEPS.length - 1 && (
          <button
            onClick={() => {
              setStep(0); setClient({}); setDomains([]); setAnswers({})
            }}
            className="btn-secondary flex-1"
          >
            Nueva visita
          </button>
        )}
      </div>
    </div>
  )
}

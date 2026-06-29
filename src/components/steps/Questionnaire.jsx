import { useState } from 'react'
import { DOMAINS, DOMAIN_QUESTIONS } from '../../data/domains'

// ─── Readiness ────────────────────────────────────────────────────────────────
export function calcReadiness(domainId, answers) {
  const qs = (DOMAIN_QUESTIONS[domainId] || []).filter(q => !q.condition)
  if (qs.length === 0) return null
  const filled = qs.filter(q => {
    const v = (answers || {})[q.key]
    return v !== undefined && v !== '' && v !== null && !(Array.isArray(v) && v.length === 0)
  }).length
  const pct = filled / qs.length
  if (pct === 0) return { level: 'red',    pct, label: 'Sin datos',       color: '#da1e28', bg: '#fff1f1', desc: 'No hay información suficiente para cotizar este dominio.' }
  if (pct < 0.6) return { level: 'yellow', pct, label: 'Info parcial',    color: '#f1c21b', bg: '#fdf6d8', desc: 'Hay info pero pueden existir gaps que afecten la propuesta.' }
  return             { level: 'green',  pct, label: 'Listo para cotizar', color: '#24a148', bg: '#defbe6', desc: 'Suficiente información para armar una propuesta sólida.' }
}

function ReadinessDot({ domainId, answers, showLabel }) {
  const r = calcReadiness(domainId, answers)
  if (!r) return null
  return (
    <span className="flex items-center gap-1.5" title={r.desc}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
      {showLabel && <span className="text-xs font-mono" style={{ color: r.color }}>{r.label}</span>}
    </span>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={e => { e.stopPropagation(); onToggle() }}
      className={`toggle-track ${on ? 'on' : 'off'}`}
    >
      <span className={`toggle-thumb ${on ? 'on' : 'off'}`} />
    </button>
  )
}

// ─── Question field ───────────────────────────────────────────────────────────
function QuestionField({ q, value, onChange, answers }) {
  const conditionMet = q.condition
    ? q.condition.notValue
      ? answers[q.condition.key] !== q.condition.notValue
      : answers[q.condition.key] === q.condition.value
    : true

  if (!conditionMet) return null
  const set = v => onChange(q.key, v)

  return (
    <div className="space-y-2">
      <label className="field-label">{q.question}</label>

      {q.type === 'text' && (
        <input className="field" placeholder={q.placeholder} value={value || ''} onChange={e => set(e.target.value)} />
      )}
      {q.type === 'number' && (
        <input className="field" type="number" min="0" placeholder={q.placeholder} value={value || ''} onChange={e => set(e.target.value)} />
      )}
      {q.type === 'textarea' && (
        <textarea className="field resize-none" rows={3} placeholder={q.placeholder} value={value || ''} onChange={e => set(e.target.value)} />
      )}
      {q.type === 'select' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {q.options.map(opt => (
            <button key={opt} onClick={() => set(opt)}
              className={`option-chip ${value === opt ? 'active' : 'inactive'}`}>{opt}</button>
          ))}
        </div>
      )}
      {q.type === 'multicheck' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {q.options.map(opt => {
            const arr = Array.isArray(value) ? value : []
            const checked = arr.includes(opt)
            return (
              <button key={opt}
                onClick={() => set(checked ? arr.filter(v => v !== opt) : [...arr, opt])}
                className={`option-chip text-left flex items-center gap-2 ${checked ? 'active' : 'inactive'}`}
              >
                <span className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center ${checked ? 'bg-ibm-blue border-ibm-blue' : 'border-ibm-gray50'}`}>
                  {checked && <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>}
                </span>
                {opt}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Domain panel ─────────────────────────────────────────────────────────────
function DomainPanel({ domain, enabled, onToggle, answers, onChange }) {
  const [open, setOpen] = useState(enabled)
  const questions = DOMAIN_QUESTIONS[domain.id] || []
  const filled = Object.keys(answers || {}).filter(k => k !== '_restricciones').length
  const total  = questions.filter(q => !q.condition).length
  const sections = [...new Set(questions.map(q => q.section))]
  const readiness = calcReadiness(domain.id, answers)
  const restricciones = (answers || {})._restricciones || ''

  const handleToggle = () => { if (!enabled) setOpen(true); onToggle() }
  const handleHeaderClick = () => { if (enabled) setOpen(o => !o) }

  return (
    <div className={`surface transition-opacity ${!enabled ? 'opacity-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none" onClick={handleHeaderClick}>
        <span className="text-lg flex-shrink-0" style={{ color: enabled ? domain.color : undefined }}>{domain.icon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-ibm-gray100 dark:text-ibm-gray10">{domain.label}</span>
            <span className="text-xs text-ibm-gray50 font-mono hidden sm:block">{domain.brand}</span>
            {enabled && filled > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-ibm-blue-10 dark:bg-ibm-blue/20 text-ibm-blue border border-ibm-blue/20 font-mono">
                {filled}/{total}
              </span>
            )}
          </div>
          {enabled && readiness && (
            <ReadinessDot domainId={domain.id} answers={answers} showLabel />
          )}
          {!enabled && (
            <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30 mt-0.5">{domain.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {enabled && (
            <svg className={`w-4 h-4 text-ibm-gray50 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          <Toggle on={enabled} onToggle={handleToggle} />
        </div>
      </div>

      {/* Questions */}
      {enabled && open && (
        <div className="border-t border-ibm-gray20 dark:border-ibm-gray70 px-4 pb-5 pt-4 space-y-6">
          {sections.map(section => (
            <div key={section}>
              <p className="text-xs font-semibold uppercase tracking-widest text-ibm-gray50 dark:text-ibm-gray30 mb-3">{section}</p>
              <div className="space-y-5">
                {questions.filter(q => q.section === section).map(q => (
                  <QuestionField
                    key={q.id} q={q}
                    value={(answers || {})[q.key]}
                    onChange={(key, val) => onChange({ ...answers, [key]: val })}
                    answers={answers || {}}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Restricciones y dependencias */}
          <div className="pt-4 border-t border-ibm-gray20 dark:border-ibm-gray70">
            <label className="field-label flex items-center gap-2">
              <span className="text-ibm-yellow">⚠</span>
              Restricciones y dependencias
            </label>
            <textarea
              className="field resize-none mt-1"
              rows={3}
              placeholder={`Ej: El ERP actual no soporta este OS · Contrato con proveedor vigente hasta junio · Requieren coordinación con el ISP antes de instalar...`}
              value={restricciones}
              onChange={e => onChange({ ...answers, _restricciones: e.target.value })}
            />
            <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30 mt-1">
              Cualquier cosa que pueda complicar o bloquear la implementación de este dominio.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Readiness legend ─────────────────────────────────────────────────────────
function ReadinessLegend() {
  const [open, setOpen] = useState(false)
  return (
    <div className="surface">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs text-ibm-gray60 dark:text-ibm-gray30">
        <span className="font-semibold uppercase tracking-widest">¿Cómo funciona el indicador?</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-ibm-gray20 dark:border-ibm-gray70 pt-3">
          {[
            { color: '#da1e28', label: 'Sin datos', desc: 'No hay respuestas en este dominio. No es posible cotizar.' },
            { color: '#f1c21b', label: 'Info parcial', desc: 'Hay respuestas pero existen gaps que pueden generar cambios en la propuesta.' },
            { color: '#24a148', label: 'Listo para cotizar', desc: 'Más del 60% completado. Suficiente para armar una propuesta confiable.' },
          ].map(r => (
            <div key={r.label} className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: r.color }} />
              <div>
                <span className="text-xs font-semibold" style={{ color: r.color }}>{r.label} </span>
                <span className="text-xs text-ibm-gray60 dark:text-ibm-gray30">— {r.desc}</span>
              </div>
            </div>
          ))}
          <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30 pt-1">
            El indicador es informativo — no bloquea el flujo.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function Questionnaire({ domains, setDomains, answers, onChange }) {
  const toggleDomain = id =>
    setDomains(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])

  const setDomainAnswers = (id, val) => onChange({ ...answers, [id]: val })

  const totalFilled = Object.values(answers).reduce((acc, d) =>
    acc + Object.keys(d || {}).filter(k => k !== '_restricciones').length, 0)

  return (
    <div className="step-enter lg:contents">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 space-y-3">
          <div className="surface p-4">
            <p className="field-label mb-3">Dominios</p>
            <div className="space-y-2">
              {DOMAINS.map(d => {
                const on = domains.includes(d.id)
                const r = on ? calcReadiness(d.id, answers[d.id]) : null
                return (
                  <div key={d.id} className="flex items-center gap-2">
                    <span style={{ color: on ? d.color : undefined }} className={on ? '' : 'text-ibm-gray50 grayscale'}>
                      {d.icon}
                    </span>
                    <span className={`text-xs flex-1 ${on ? 'text-ibm-gray100 dark:text-ibm-gray10' : 'text-ibm-gray50'}`}>
                      {d.label}
                    </span>
                    {r && <ReadinessDot domainId={d.id} answers={answers[d.id]} showLabel={false} />}
                    {!on && <span className="w-2 h-2 rounded-full bg-ibm-gray50 flex-shrink-0" />}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="surface p-4 space-y-1">
            <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30">
              <span className="text-ibm-blue font-semibold">{domains.length}</span> dominios activos
            </p>
            <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30">
              <span className="text-ibm-blue font-semibold">{totalFilled}</span> respuestas registradas
            </p>
            <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30 pt-1">
              Puedes continuar sin completar todo.
            </p>
          </div>

          <ReadinessLegend />
        </div>
      </aside>

      {/* Domain panels */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <div>
            <h1 className="text-xl font-semibold text-ibm-gray100 dark:text-ibm-gray10">Evaluación</h1>
            <p className="text-sm text-ibm-gray50 dark:text-ibm-gray30">Activa los dominios que aplican</p>
          </div>
          <span className="text-xs text-ibm-gray50 font-mono">{totalFilled} resp.</span>
        </div>

        {DOMAINS.map(domain => (
          <DomainPanel
            key={domain.id}
            domain={domain}
            enabled={domains.includes(domain.id)}
            onToggle={() => toggleDomain(domain.id)}
            answers={answers[domain.id]}
            onChange={val => setDomainAnswers(domain.id, val)}
          />
        ))}

        <div className="lg:hidden pt-1">
          <ReadinessLegend />
        </div>

        <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30 pt-2 pb-1 text-center">
          Puedes regresar a completar información en cualquier momento.
        </p>
      </div>
    </div>
  )
}

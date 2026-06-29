import { useState } from 'react'
import { DOMAINS, DOMAIN_QUESTIONS } from '../../data/domains'

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
            <button
              key={opt}
              onClick={() => set(opt)}
              className={`option-chip ${value === opt ? 'active' : 'inactive'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {q.type === 'multicheck' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {q.options.map(opt => {
            const arr = Array.isArray(value) ? value : []
            const checked = arr.includes(opt)
            return (
              <button
                key={opt}
                onClick={() => set(checked ? arr.filter(v => v !== opt) : [...arr, opt])}
                className={`option-chip text-left flex items-center gap-2 ${checked ? 'active' : 'inactive'}`}
              >
                <span className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center
                  ${checked ? 'bg-ibm-blue border-ibm-blue' : 'border-ibm-gray50'}`}>
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

function DomainPanel({ domain, enabled, onToggle, answers, onChange }) {
  const [open, setOpen] = useState(enabled)
  const questions = DOMAIN_QUESTIONS[domain.id] || []
  const filled = Object.keys(answers || {}).length
  const total = questions.filter(q => !q.condition).length
  const sections = [...new Set(questions.map(q => q.section))]

  const handleToggle = () => {
    if (!enabled) setOpen(true)
    onToggle()
  }

  const handleHeaderClick = () => {
    if (enabled) setOpen(o => !o)
  }

  return (
    <div className={`surface transition-opacity ${!enabled ? 'opacity-50' : ''}`}>
      {/* Domain header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={handleHeaderClick}
      >
        <span
          className="w-8 h-8 flex items-center justify-center text-lg flex-shrink-0"
          style={{ color: domain.color }}
        >
          {domain.icon}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-ibm-gray100 dark:text-ibm-gray10">{domain.label}</span>
            <span className="text-xs text-ibm-gray50 font-mono">{domain.brand}</span>
            {enabled && filled > 0 && (
              <span className="text-xs px-1.5 py-0.5 bg-ibm-blue-10 dark:bg-ibm-blue/20 text-ibm-blue border border-ibm-blue/20 font-mono">
                {filled}/{total}
              </span>
            )}
          </div>
          <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30 mt-0.5 truncate">{domain.description}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {enabled && (
            <svg
              className={`w-4 h-4 text-ibm-gray50 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          <Toggle on={enabled} onToggle={handleToggle} />
        </div>
      </div>

      {/* Questions */}
      {enabled && open && (
        <div className="border-t border-ibm-gray20 dark:border-ibm-gray70 px-4 pb-5 pt-4 space-y-6">
          {sections.map(section => {
            const qs = questions.filter(q => q.section === section)
            return (
              <div key={section}>
                <p className="text-xs font-semibold uppercase tracking-widest text-ibm-gray50 dark:text-ibm-gray30 mb-3">
                  {section}
                </p>
                <div className="space-y-5">
                  {qs.map(q => (
                    <QuestionField
                      key={q.id}
                      q={q}
                      value={(answers || {})[q.key]}
                      onChange={(key, val) => onChange({ ...answers, [key]: val })}
                      answers={answers || {}}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Questionnaire({ domains, setDomains, answers, onChange }) {
  const toggleDomain = id => {
    setDomains(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const setDomainAnswers = (id, val) => onChange({ ...answers, [id]: val })

  const totalFilled = Object.values(answers).reduce((acc, d) => acc + Object.keys(d || {}).length, 0)
  const enabledCount = domains.length

  return (
    <div className="step-enter lg:contents">
      {/* Sidebar (lg): domain status overview */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 space-y-3">
          <div className="surface p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-ibm-gray50 dark:text-ibm-gray30 mb-3">Dominios</p>
            <div className="space-y-1.5">
              {DOMAINS.map(d => {
                const on = domains.includes(d.id)
                const filled = Object.keys(answers[d.id] || {}).length
                return (
                  <div key={d.id} className="flex items-center gap-2">
                    <span style={{ color: on ? d.color : undefined }} className={on ? '' : 'text-ibm-gray50'}>
                      {d.icon}
                    </span>
                    <span className={`text-xs flex-1 ${on ? 'text-ibm-gray100 dark:text-ibm-gray10' : 'text-ibm-gray50'}`}>
                      {d.label}
                    </span>
                    {on && filled > 0 && (
                      <span className="text-xs text-ibm-gray50 font-mono">{filled}</span>
                    )}
                    <div className={`w-1.5 h-1.5 rounded-full ${on ? (filled > 0 ? 'bg-ibm-green' : 'bg-ibm-blue') : 'bg-ibm-gray50'}`} />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="surface p-4">
            <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30">
              <span className="text-ibm-blue font-semibold">{enabledCount}</span> dominios activos ·{' '}
              <span className="text-ibm-blue font-semibold">{totalFilled}</span> respuestas
            </p>
            <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30 mt-1">
              Puedes continuar sin completar todo.
            </p>
          </div>
        </div>
      </aside>

      {/* Main panel list */}
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

        <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30 pt-2 pb-1 text-center">
          Puedes regresar a completar información en cualquier momento.
        </p>
      </div>
    </div>
  )
}

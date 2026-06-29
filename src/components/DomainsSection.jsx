import { DOMAINS, DOMAIN_QUESTIONS } from '../data/domains'
import { calcReadiness } from './steps/Questionnaire'

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={e => { e.stopPropagation(); onToggle() }}
      className={`toggle-track flex-shrink-0 ${on ? 'on' : 'off'}`}
    >
      <span className={`toggle-thumb ${on ? 'on' : 'off'}`} />
    </button>
  )
}

// ─── Readiness badge ──────────────────────────────────────────────────────────
function ReadinessBadge({ domainId, answers }) {
  const r = calcReadiness(domainId, answers)
  if (!r || r.pct === 0) return null
  return (
    <span
      className="text-xs px-1.5 py-0.5 font-mono border flex-shrink-0"
      style={{ color: r.color, borderColor: r.color + '60', backgroundColor: r.color + '18' }}
    >
      {r.label}
    </span>
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

// ─── Domain row ───────────────────────────────────────────────────────────────
function DomainRow({ domain, enabled, onToggle, answers, onChange }) {
  const questions  = DOMAIN_QUESTIONS[domain.id] || []
  const domAnswers = answers || {}
  const filled     = Object.keys(domAnswers).filter(k => k !== '_restricciones').length
  const sections   = [...new Set(questions.map(q => q.section))]

  return (
    <div className={`border-b border-ibm-gray20 dark:border-ibm-gray80 transition-opacity ${!enabled ? 'opacity-60' : ''}`}>
      {/* Row header — always visible */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span
          className="text-lg flex-shrink-0 transition-all"
          style={{ color: enabled ? domain.color : undefined }}
        >
          {domain.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-ibm-gray100 dark:text-ibm-gray10">{domain.label}</span>
            <span className="text-xs text-ibm-gray50 font-mono hidden sm:block">{domain.brand}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {enabled && filled > 0 && (
              <span className="text-xs font-mono text-ibm-gray50">{filled} resp.</span>
            )}
            {enabled && <ReadinessBadge domainId={domain.id} answers={domAnswers} />}
            {!enabled && (
              <span className="text-xs text-ibm-gray50">{domain.description}</span>
            )}
          </div>
        </div>
        <Toggle on={enabled} onToggle={onToggle} />
      </div>

      {/* Expanded body — only when enabled */}
      {enabled && (
        <div className="px-4 pb-6 pt-2 space-y-6 border-t border-ibm-gray20 dark:border-ibm-gray80 bg-ibm-gray10/30 dark:bg-ibm-gray100/30">
          {sections.map(section => (
            <div key={section}>
              <p className="text-xs font-semibold uppercase tracking-widest text-ibm-gray50 dark:text-ibm-gray30 mb-3">
                {section}
              </p>
              <div className="space-y-5">
                {questions.filter(q => q.section === section).map(q => (
                  <QuestionField
                    key={q.id} q={q}
                    value={domAnswers[q.key]}
                    onChange={(key, val) => onChange({ ...domAnswers, [key]: val })}
                    answers={domAnswers}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Restricciones */}
          <div className="pt-4 border-t border-ibm-gray20 dark:border-ibm-gray70">
            <label className="field-label flex items-center gap-1.5">
              <span className="text-ibm-yellow">⚠</span> Restricciones y dependencias
            </label>
            <textarea
              className="field resize-none mt-1"
              rows={2}
              placeholder="Ej: ERP no soporta el OS nuevo · Contrato con proveedor hasta junio · Requiere coordinación con ISP..."
              value={domAnswers._restricciones || ''}
              onChange={e => onChange({ ...domAnswers, _restricciones: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Readiness legend ─────────────────────────────────────────────────────────
function ReadinessLegend() {
  return (
    <div className="px-4 py-4 border-t border-ibm-gray20 dark:border-ibm-gray80 bg-ibm-gray10 dark:bg-ibm-gray90/50">
      <p className="field-label mb-2">Indicador de readiness</p>
      <div className="space-y-1.5">
        {[
          { color: '#8d8d8d', label: 'Sin datos',           desc: 'No hay respuestas — no se puede cotizar' },
          { color: '#f1c21b', label: 'Info parcial',         desc: 'Hay gaps que pueden afectar la propuesta' },
          { color: '#24a148', label: 'Listo para cotizar',   desc: '+60% completado — propuesta confiable' },
        ].map(r => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
            <span className="text-xs font-semibold" style={{ color: r.color }}>{r.label}</span>
            <span className="text-xs text-ibm-gray50">— {r.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Export ───────────────────────────────────────────────────────────────────
export default function DomainsSection({ domains, setDomains, answers, onChange }) {
  const toggleDomain = id =>
    setDomains(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])

  return (
    <div>
      {DOMAINS.map(domain => (
        <DomainRow
          key={domain.id}
          domain={domain}
          enabled={domains.includes(domain.id)}
          onToggle={() => toggleDomain(domain.id)}
          answers={answers[domain.id]}
          onChange={val => onChange({ ...answers, [domain.id]: val })}
        />
      ))}
      <ReadinessLegend />
    </div>
  )
}

import { useState } from 'react'
import { DOMAINS, DOMAIN_QUESTIONS } from '../../data/domains'

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
      <label className="label">{q.question}</label>

      {q.type === 'text' && (
        <input className="input" placeholder={q.placeholder} value={value || ''} onChange={e => set(e.target.value)} />
      )}

      {q.type === 'number' && (
        <input className="input" type="number" min="0" placeholder={q.placeholder} value={value || ''} onChange={e => set(e.target.value)} />
      )}

      {q.type === 'textarea' && (
        <textarea className="input resize-none" rows={3} placeholder={q.placeholder} value={value || ''} onChange={e => set(e.target.value)} />
      )}

      {q.type === 'select' && (
        <div className="grid grid-cols-2 gap-2">
          {q.options.map(opt => (
            <button
              key={opt}
              onClick={() => set(opt)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all border ${
                value === opt
                  ? 'border-core-blue bg-core-light text-core-blue'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {q.type === 'multicheck' && (
        <div className="space-y-2">
          {q.options.map(opt => {
            const arr = Array.isArray(value) ? value : []
            const checked = arr.includes(opt)
            return (
              <button
                key={opt}
                onClick={() => set(checked ? arr.filter(v => v !== opt) : [...arr, opt])}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all border ${
                  checked ? 'border-core-blue bg-core-light text-core-blue' : 'border-gray-200 bg-white text-gray-700'
                }`}
              >
                <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border ${
                  checked ? 'bg-core-blue border-core-blue' : 'border-gray-300'
                }`}>
                  {checked && <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>}
                </div>
                {opt}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Questionnaire({ domains, answers, onChange }) {
  const [activeDomain, setActiveDomain] = useState(domains[0])

  const domain = DOMAINS.find(d => d.id === activeDomain)
  const questions = DOMAIN_QUESTIONS[activeDomain] || []
  const domainAnswers = answers[activeDomain] || {}

  const setAnswer = (key, value) => {
    onChange({ ...answers, [activeDomain]: { ...domainAnswers, [key]: value } })
  }

  const sections = [...new Set(questions.map(q => q.section))]

  return (
    <div className="step-enter space-y-5">
      {/* Domain tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {domains.map(id => {
          const d = DOMAINS.find(x => x.id === id)
          const filled = Object.keys(answers[id] || {}).length
          const total = (DOMAIN_QUESTIONS[id] || []).filter(q => !q.condition).length
          return (
            <button
              key={id}
              onClick={() => setActiveDomain(id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeDomain === id
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600'
              }`}
              style={activeDomain === id ? { backgroundColor: d?.color } : {}}
            >
              <span>{d?.icon}</span>
              <span>{d?.label}</span>
              {filled > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  activeDomain === id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {filled}/{total}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Questions by section */}
      {sections.map(section => {
        const sectionQs = questions.filter(q => q.section === section)
        return (
          <div key={section}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{section}</p>
            <div className="space-y-4">
              {sectionQs.map(q => (
                <QuestionField
                  key={q.id}
                  q={q}
                  value={domainAnswers[q.key]}
                  onChange={setAnswer}
                  answers={domainAnswers}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

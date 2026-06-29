import { DOMAINS } from '../../data/domains'

export default function DomainSelector({ selected, onChange }) {
  const toggle = id => {
    if (selected.includes(id)) {
      onChange(selected.filter(d => d !== id))
    } else {
      onChange([...selected, id])
    }
  }

  return (
    <div className="step-enter space-y-3">
      <p className="text-sm text-gray-500 mb-4">Selecciona los dominios que aplican para este cliente:</p>
      {DOMAINS.map(d => {
        const active = selected.includes(d.id)
        return (
          <button
            key={d.id}
            onClick={() => toggle(d.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
              active ? 'border-core-blue bg-core-light' : 'border-gray-200 bg-white'
            }`}
          >
            <span
              className="text-2xl w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: active ? d.color : '#F3F4F6' }}
            >
              {d.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900">{d.label}</span>
                <span className="text-xs text-gray-400 font-medium">{d.brand}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              active ? 'bg-core-blue border-core-blue' : 'border-gray-300'
            }`}>
              {active && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>}
            </div>
          </button>
        )
      })}
    </div>
  )
}

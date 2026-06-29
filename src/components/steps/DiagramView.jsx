import DiagramCanvas from '../diagram/DiagramCanvas'
import { DOMAINS } from '../../data/domains'

export default function DiagramView({ assessment, onDiagramChange, onDomainChange }) {
  const activeDomains = DOMAINS.filter(d => assessment.domains.includes(d.id))

  if (assessment.domains.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-ibm-gray50">
        <p className="text-sm">Activa al menos un dominio para generar el diagrama.</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Domain pills */}
      <div className="flex flex-wrap gap-1.5 px-4 py-2 border-b border-ibm-gray80 flex-shrink-0">
        {activeDomains.map(d => (
          <span
            key={d.id}
            className="text-xs px-2 py-0.5 border font-mono"
            style={{ borderColor: d.color, color: d.color, backgroundColor: d.color + '18' }}
          >
            {d.icon} {d.label}
          </span>
        ))}
      </div>

      {/* Canvas — explicit style so ReactFlow sees a real height */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <DiagramCanvas assessment={assessment} onDiagramChange={onDiagramChange} onDomainChange={onDomainChange} />
      </div>
    </div>
  )
}

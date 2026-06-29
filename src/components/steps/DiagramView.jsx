import { useState, useEffect } from 'react'
import mermaid from 'mermaid'
import { generateZoneDiagram, generateMermaidDiagram } from '../../utils/diagramGenerator'
import { DOMAINS } from '../../data/domains'

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#0f62fe',
    primaryTextColor: '#f4f4f4',
    primaryBorderColor: '#0043ce',
    lineColor: '#6f6f6f',
    secondaryColor: '#262626',
    tertiaryColor: '#393939',
    background: '#161616',
    mainBkg: '#262626',
    nodeBorder: '#525252',
    clusterBkg: '#393939',
    titleColor: '#f4f4f4',
    edgeLabelBackground: '#262626',
    fontSize: '13px',
  },
  flowchart: { curve: 'basis', padding: 16 },
})

function ZoneArrow() {
  return (
    <div className="flex justify-center my-1">
      <div className="flex flex-col items-center gap-0.5">
        <div className="w-px h-5 bg-ibm-gray50" />
        <svg className="w-3 h-3 text-ibm-gray50" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  )
}

function ZoneBlock({ zone }) {
  return (
    <div
      className="p-3 sm:p-4 border"
      style={{ borderColor: zone.color, backgroundColor: zone.colorLight + '22' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg" style={{ color: zone.color }}>{zone.icon}</span>
        <div>
          <p className="text-xs font-semibold text-ibm-gray100 dark:text-ibm-gray10 leading-tight">{zone.label}</p>
          {zone.brand && <p className="text-xs text-ibm-gray50 font-mono">{zone.brand}</p>}
        </div>
      </div>
      {zone.items?.map((item, i) => (
        <p key={i} className="text-xs text-ibm-gray60 dark:text-ibm-gray30 mt-0.5">· {item}</p>
      ))}
    </div>
  )
}

function ZoneDiagram({ assessment }) {
  const { zones, coreZones } = generateZoneDiagram(assessment)
  const activeDomains = assessment.domains

  if (activeDomains.length === 0) {
    return (
      <div className="text-center py-12 text-ibm-gray50">
        <p className="text-sm">Activa al menos un dominio en la evaluación para ver el diagrama.</p>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex justify-center">
        {zones.filter(z => z.layer === 0).map(z => (
          <div key={z.id} className="w-48"><ZoneBlock zone={z} /></div>
        ))}
      </div>

      {zones.filter(z => z.layer === 1).length > 0 && (
        <>
          <ZoneArrow />
          <div className="flex justify-center">
            {zones.filter(z => z.layer === 1).map(z => (
              <div key={z.id} className="w-48"><ZoneBlock zone={z} /></div>
            ))}
          </div>
        </>
      )}

      {zones.filter(z => z.layer === 2).length > 0 && (
        <>
          <ZoneArrow />
          <div className="flex justify-center">
            {zones.filter(z => z.layer === 2).map(z => (
              <div key={z.id} className="w-full"><ZoneBlock zone={z} /></div>
            ))}
          </div>
        </>
      )}

      {coreZones.length > 0 && (
        <>
          <ZoneArrow />
          <div className="grid grid-cols-2 gap-2">
            {coreZones.map(z => <ZoneBlock key={z.id} zone={z} />)}
          </div>
        </>
      )}

      <ZoneArrow />
      <div className="flex justify-center">
        <div className="w-48 p-3 border border-ibm-gray30 dark:border-ibm-gray70 text-center">
          <span className="text-lg">👥</span>
          <p className="text-xs font-semibold text-ibm-gray100 dark:text-ibm-gray10 mt-1">Usuarios</p>
          {assessment.client?.userCount && (
            <p className="text-xs text-ibm-gray50 font-mono">{assessment.client.userCount}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function TechnicalDiagram({ assessment }) {
  const [svg, setSvg] = useState('')
  const [err, setErr] = useState(false)

  useEffect(() => {
    const code = generateMermaidDiagram(assessment)
    mermaid.render(`mermaid-${Date.now()}`, code)
      .then(r => setSvg(r.svg))
      .catch(() => setErr(true))
  }, [assessment])

  if (err) return (
    <div className="text-center py-10 text-ibm-gray50">
      <p className="text-sm">No se pudo generar el diagrama técnico.</p>
      <p className="text-xs mt-1">Completa más datos en la evaluación.</p>
    </div>
  )

  if (!svg) return (
    <div className="text-center py-10 text-ibm-gray50 text-sm animate-pulse">Generando diagrama...</div>
  )

  return (
    <div
      className="overflow-auto surface p-4 mermaid"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default function DiagramView({ assessment }) {
  const [view, setView] = useState('zonas')

  const activeDomains = DOMAINS.filter(d => assessment.domains.includes(d.id))

  return (
    <div className="step-enter space-y-6">
      {/* Active domains summary */}
      <div className="flex flex-wrap gap-2">
        {activeDomains.map(d => (
          <span
            key={d.id}
            className="text-xs px-2.5 py-1 border font-mono"
            style={{ borderColor: d.color, color: d.color, backgroundColor: d.color + '18' }}
          >
            {d.icon} {d.label}
          </span>
        ))}
        {activeDomains.length === 0 && (
          <span className="text-xs text-ibm-gray50">Ningún dominio activo</span>
        )}
      </div>

      {/* View toggle */}
      <div className="flex border border-ibm-gray20 dark:border-ibm-gray70 w-fit">
        {[
          { id: 'zonas', label: 'Vista por zonas' },
          { id: 'tecnico', label: 'Diagrama técnico' },
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              view === v.id
                ? 'bg-ibm-blue text-white'
                : 'text-ibm-gray60 dark:text-ibm-gray30 hover:bg-ibm-gray20 dark:hover:bg-ibm-gray80'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-ibm-gray50">
        {view === 'zonas'
          ? 'Vista conceptual — para mostrar al cliente sin jerga técnica'
          : 'Vista técnica — para la propuesta interna y arquitectura'}
      </p>

      {view === 'zonas'
        ? <ZoneDiagram assessment={assessment} />
        : <TechnicalDiagram assessment={assessment} />
      }
    </div>
  )
}

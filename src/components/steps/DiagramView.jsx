import { useState, useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import { generateZoneDiagram, generateMermaidDiagram } from '../../utils/diagramGenerator'

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#0052CC',
    primaryTextColor: '#fff',
    primaryBorderColor: '#003380',
    lineColor: '#94A3B8',
    secondaryColor: '#E6F0FF',
    tertiaryColor: '#F8FAFC',
    fontSize: '14px',
  },
  flowchart: { curve: 'basis', padding: 20 },
})

function ZoneBlock({ zone }) {
  return (
    <div
      className="rounded-2xl border-2 p-4 min-w-[140px]"
      style={{ borderColor: zone.color, backgroundColor: zone.colorLight }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{zone.icon}</span>
        <div>
          <p className="text-xs font-bold text-gray-800 leading-tight">{zone.label}</p>
          {zone.brand && <p className="text-xs text-gray-500">{zone.brand}</p>}
        </div>
      </div>
      {zone.items?.map((item, i) => (
        <p key={i} className="text-xs text-gray-600 mt-1">• {item}</p>
      ))}
    </div>
  )
}

function ZoneDiagram({ assessment }) {
  const { zones, coreZones } = generateZoneDiagram(assessment)

  return (
    <div className="space-y-3">
      {/* Internet layer */}
      <div className="flex justify-center">
        {zones.filter(z => z.layer === 0).map(z => <ZoneBlock key={z.id} zone={z} />)}
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-6 bg-gray-300" />
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {/* Security layer */}
      {zones.filter(z => z.layer === 1).length > 0 && (
        <>
          <div className="flex justify-center">
            {zones.filter(z => z.layer === 1).map(z => <ZoneBlock key={z.id} zone={z} />)}
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-px h-6 bg-gray-300" />
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </>
      )}

      {/* Network layer */}
      {zones.filter(z => z.layer === 2).length > 0 && (
        <>
          <div className="flex justify-center">
            {zones.filter(z => z.layer === 2).map(z => <ZoneBlock key={z.id} zone={z} />)}
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-px h-6 bg-gray-300" />
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </>
      )}

      {/* Core: servers, storage, backup, virtualization */}
      {coreZones.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {coreZones.map(z => <ZoneBlock key={z.id} zone={z} />)}
        </div>
      )}

      {/* Users */}
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-1">
          <div className="w-px h-6 bg-gray-300" />
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="rounded-2xl border-2 border-gray-300 bg-gray-50 p-4 min-w-[140px] text-center">
          <span className="text-2xl">👥</span>
          <p className="text-xs font-bold text-gray-700 mt-1">Usuarios</p>
          {assessment.client?.userCount && (
            <p className="text-xs text-gray-500">{assessment.client.userCount} usuarios</p>
          )}
        </div>
      </div>
    </div>
  )
}

function TechnicalDiagram({ assessment }) {
  const ref = useRef(null)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const code = generateMermaidDiagram(assessment)
    mermaid.render('mermaid-tech-diagram', code)
      .then(({ svg }) => setSvg(svg))
      .catch(() => setError(true))
  }, [assessment])

  if (error) return (
    <div className="text-center py-10 text-gray-400">
      <p className="text-sm">No se pudo generar el diagrama técnico.</p>
      <p className="text-xs mt-1">Completa más datos del cuestionario.</p>
    </div>
  )

  return (
    <div
      ref={ref}
      className="overflow-auto rounded-xl bg-white border border-gray-100 p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default function DiagramView({ assessment }) {
  const [view, setView] = useState('zonas')

  return (
    <div className="step-enter space-y-4">
      {/* Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        <button
          onClick={() => setView('zonas')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            view === 'zonas' ? 'bg-white shadow-sm text-core-blue' : 'text-gray-500'
          }`}
        >
          Vista por zonas
        </button>
        <button
          onClick={() => setView('tecnico')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            view === 'tecnico' ? 'bg-white shadow-sm text-core-blue' : 'text-gray-500'
          }`}
        >
          Diagrama técnico
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        {view === 'zonas'
          ? 'Vista para mostrar al cliente — clara y sin jerga técnica'
          : 'Vista técnica para propuestas internas'}
      </p>

      {view === 'zonas' ? (
        <ZoneDiagram assessment={assessment} />
      ) : (
        <TechnicalDiagram assessment={assessment} />
      )}
    </div>
  )
}

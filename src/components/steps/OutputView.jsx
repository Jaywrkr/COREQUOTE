import { useState } from 'react'
import { generateReport } from '../../utils/diagramGenerator'
import { DOMAINS } from '../../data/domains'

const REPORT_TYPES = [
  { id: 'interno', label: 'Interno', desc: 'Todos los datos técnicos', icon: '📋' },
  { id: 'tecnico', label: 'Cliente técnico', desc: 'Resumen técnico y objetivos', icon: '🔧' },
  { id: 'gerencial', label: 'Cliente gerencial', desc: 'Lenguaje de negocio, sin jerga', icon: '💼' },
]

export default function OutputView({ assessment }) {
  const [reportType, setReportType] = useState('interno')
  const sections = generateReport(assessment, reportType)
  const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const activeDomains = DOMAINS.filter(d => assessment.domains.includes(d.id))

  const handlePrint = () => window.print()

  return (
    <div className="step-enter space-y-5">
      {/* Report type selector */}
      <div className="space-y-2">
        {REPORT_TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setReportType(t.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
              reportType === t.id ? 'border-core-blue bg-core-light' : 'border-gray-200 bg-white'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{t.label}</p>
              <p className="text-xs text-gray-500">{t.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Report preview */}
      <div className="card space-y-5 print-area">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-core-blue rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">CS</span>
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">CoreSolutions</span>
            </div>
            <h2 className="text-base font-bold text-gray-900">
              {reportType === 'interno' ? 'Assessment Técnico Interno' :
               reportType === 'tecnico' ? 'Resumen Ejecutivo Técnico' :
               'Resumen de Propuesta'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{date}</p>
          </div>
        </div>

        {/* Domain tags */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Áreas evaluadas</p>
          <div className="flex flex-wrap gap-2">
            {activeDomains.map(d => (
              <span
                key={d.id}
                className="text-xs px-2.5 py-1 rounded-full font-medium text-white"
                style={{ backgroundColor: d.color }}
              >
                {d.icon} {d.label}
              </span>
            ))}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section, i) => (
          <div key={i}>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{section.title}</p>
            <ul className="space-y-1.5">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-core-blue mt-1 flex-shrink-0">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Generado por CoreSolutions Assessment Tool · {date}
          </p>
        </div>
      </div>

      {/* Actions */}
      <button onClick={handlePrint} className="btn-secondary w-full flex items-center justify-center gap-2 no-print">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Imprimir / Guardar PDF
      </button>
    </div>
  )
}

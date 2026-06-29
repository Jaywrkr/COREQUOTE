import { useState } from 'react'
import { generateReport } from '../../utils/diagramGenerator'
import { DOMAINS } from '../../data/domains'

const REPORT_TYPES = [
  { id: 'interno',   label: 'Interno',          desc: 'Datos técnicos completos para el equipo CoreSolutions',  icon: '📋' },
  { id: 'tecnico',   label: 'Cliente técnico',   desc: 'Resumen técnico y objetivos — para IT manager / CTO',   icon: '🔧' },
  { id: 'gerencial', label: 'Cliente gerencial', desc: 'Lenguaje de negocio — para dueño / gerente general',    icon: '💼' },
]

function IncompleteNotice({ domains, answers }) {
  const incomplete = domains.filter(d => Object.keys(answers[d] || {}).length === 0)
  if (incomplete.length === 0) return null
  const labels = incomplete.map(id => DOMAINS.find(d => d.id === id)?.label).filter(Boolean)
  return (
    <div className="flex gap-3 p-3 border border-ibm-yellow/50 bg-ibm-yellow/10">
      <span className="text-ibm-yellow text-lg flex-shrink-0">⚠</span>
      <div>
        <p className="text-xs font-semibold text-ibm-gray100 dark:text-ibm-gray10">Secciones sin completar</p>
        <p className="text-xs text-ibm-gray60 dark:text-ibm-gray30 mt-0.5">
          {labels.join(', ')} — el reporte incluirá solo la información disponible.
        </p>
      </div>
    </div>
  )
}

export default function OutputView({ assessment }) {
  const [reportType, setReportType] = useState('interno')
  const sections = generateReport(assessment, reportType)
  const date = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  const activeDomains = DOMAINS.filter(d => assessment.domains.includes(d.id))

  return (
    <div className="step-enter space-y-6">
      {/* Report type selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {REPORT_TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setReportType(t.id)}
            className={`flex flex-col items-start gap-1 p-4 border text-left transition-colors ${
              reportType === t.id
                ? 'border-ibm-blue bg-ibm-blue-10 dark:bg-ibm-blue/15'
                : 'surface hover:border-ibm-gray50'
            }`}
          >
            <span className="text-xl">{t.icon}</span>
            <span className="text-sm font-semibold text-ibm-gray100 dark:text-ibm-gray10">{t.label}</span>
            <span className="text-xs text-ibm-gray50 dark:text-ibm-gray30">{t.desc}</span>
          </button>
        ))}
      </div>

      <IncompleteNotice domains={assessment.domains} answers={assessment.answers} />

      {/* Report */}
      <div className="surface p-6 space-y-6" id="report-content">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-ibm-gray20 dark:border-ibm-gray80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <svg viewBox="0 0 32 32" className="w-5 h-5 text-ibm-blue" fill="currentColor">
                <rect x="0" y="0" width="32" height="4" />
                <rect x="0" y="8" width="32" height="4" />
                <rect x="4" y="16" width="24" height="4" />
                <rect x="4" y="24" width="24" height="4" />
              </svg>
              <span className="text-xs font-semibold text-ibm-gray50 uppercase tracking-widest">CoreSolutions</span>
            </div>
            <h2 className="text-lg font-semibold text-ibm-gray100 dark:text-ibm-gray10">
              {reportType === 'interno'   ? 'Assessment Técnico Interno' :
               reportType === 'tecnico'  ? 'Resumen Ejecutivo Técnico'  :
                                           'Resumen de Propuesta'}
            </h2>
            <p className="text-xs text-ibm-gray50 font-mono mt-1">{date}</p>
          </div>
          {assessment.client?.company && (
            <div className="text-right">
              <p className="text-xs text-ibm-gray50 uppercase tracking-wide">Cliente</p>
              <p className="text-sm font-semibold text-ibm-gray100 dark:text-ibm-gray10">{assessment.client.company}</p>
              {assessment.client.industry && (
                <p className="text-xs text-ibm-gray50">{assessment.client.industry}</p>
              )}
            </div>
          )}
        </div>

        {/* Domain badges */}
        {activeDomains.length > 0 && (
          <div>
            <p className="field-label mb-2">Áreas evaluadas</p>
            <div className="flex flex-wrap gap-2">
              {activeDomains.map(d => (
                <span
                  key={d.id}
                  className="text-xs px-2 py-1 border font-mono"
                  style={{ borderColor: d.color, color: d.color }}
                >
                  {d.icon} {d.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        {sections.map((section, i) => (
          <div key={i}>
            <p className="field-label mb-2">{section.title}</p>
            <ul className="space-y-1.5">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-ibm-gray70 dark:text-ibm-gray30">
                  <span className="text-ibm-blue mt-0.5 flex-shrink-0 font-mono text-xs">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Footer */}
        <div className="pt-4 border-t border-ibm-gray20 dark:border-ibm-gray80 flex items-center justify-between">
          <p className="text-xs text-ibm-gray50 font-mono">
            CoreSolutions Assessment Tool · {date}
          </p>
          {assessment.client?.contactName && (
            <p className="text-xs text-ibm-gray50">
              Contacto: {assessment.client.contactName}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 no-print">
        <button
          onClick={() => window.print()}
          className="btn-secondary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir / PDF
        </button>
      </div>
    </div>
  )
}

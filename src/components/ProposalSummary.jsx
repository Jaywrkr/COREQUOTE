import { useState, useMemo } from 'react'

function fmt(n) {
  if (!n && n !== 0) return '—'
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

export default function ProposalSummary({ assessment, prices, onPricesChange }) {
  const nodes = assessment.diagram?.nodes || []
  const newNodes = useMemo(
    () => nodes.filter(n => n.data?.status === 'new'),
    [nodes]
  )
  const client = assessment.client || {}

  const total = useMemo(
    () => newNodes.reduce((sum, n) => sum + (parseFloat(prices[n.id]) || 0), 0),
    [newNodes, prices]
  )

  function exportCSV() {
    const rows = [
      ['Equipo', 'Tipo', 'Marca', 'Modelo', 'Precio unitario (MXN)', 'Total'],
      ...newNodes.map(n => [
        n.data.label,
        n.data.nodeType,
        n.data.brand || '',
        n.data.model || '',
        prices[n.id] || '',
        prices[n.id] || '',
      ]),
      [],
      ['', '', '', '', 'TOTAL', total || ''],
    ]
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `propuesta_${(client.company || 'cliente').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (nodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-6">
        <span className="text-5xl">🗺️</span>
        <p className="text-sm font-semibold text-ibm-gray10">No hay diagrama aún</p>
        <p className="text-xs text-ibm-gray50 max-w-xs leading-relaxed">
          Abre el diagrama, agrega equipos y márcalos como <span className="text-ibm-blue font-mono">NUEVO</span> para que aparezcan aquí.
        </p>
      </div>
    )
  }

  if (newNodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-6">
        <span className="text-5xl">✨</span>
        <p className="text-sm font-semibold text-ibm-gray10">Sin equipos nuevos</p>
        <p className="text-xs text-ibm-gray50 max-w-xs leading-relaxed">
          En el diagrama, haz click en un nodo y cámbialo a <span className="text-ibm-blue font-mono">NUEVO</span> para incluirlo en la propuesta de reemplazo o adquisición.
        </p>
      </div>
    )
  }

  const displayNodes = newNodes

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-ibm-gray70 flex-shrink-0 gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold text-ibm-gray10">
            {client.company || 'Sin cliente'} — Equipos propuestos
          </p>
          <p className="text-[10px] text-ibm-gray50 mt-0.5 font-mono">
            {displayNodes.length} ítem{displayNodes.length !== 1 ? 's' : ''} · {new Date().toLocaleDateString('es', { dateStyle: 'long' })}
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-ibm-gray60 text-ibm-gray20 hover:border-ibm-gray40 hover:text-white transition-colors bg-ibm-gray80"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* Table header */}
      <div className="grid text-[9px] font-mono font-bold text-ibm-gray50 uppercase tracking-wider px-5 py-2 border-b border-ibm-gray70 flex-shrink-0"
        style={{ gridTemplateColumns: '2fr 1.2fr 1.5fr' }}>
        <span>Equipo</span>
        <span>Modelo</span>
        <span className="text-right">Precio unit.</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-ibm-gray80">
        {displayNodes.map(n => {
          const rawPrice = prices[n.id] ?? ''
          return (
            <div
              key={n.id}
              className="grid items-center px-5 py-3 hover:bg-ibm-gray80 transition-colors"
              style={{ gridTemplateColumns: '2fr 1.2fr 1.5fr' }}
            >
              {/* Equipo */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-base flex-shrink-0">{n.data.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ibm-gray10 truncate">{n.data.label}</p>
                  {n.data.brand && (
                    <p className="text-[10px] text-ibm-gray50 font-mono truncate">{n.data.brand}</p>
                  )}
                </div>
              </div>
              {/* Modelo */}
              <div className="min-w-0 pr-2">
                {n.data.model
                  ? <p className="text-[10px] font-mono text-ibm-blue truncate">{n.data.model}</p>
                  : <p className="text-[10px] text-ibm-gray60 italic">Sin especificar</p>
                }
              </div>
              {/* Precio */}
              <div className="flex justify-end">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-ibm-gray50 font-mono pointer-events-none">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={rawPrice}
                    onChange={e => onPricesChange({ ...prices, [n.id]: e.target.value })}
                    placeholder="0"
                    className="w-28 pl-5 pr-2 py-1.5 text-xs font-mono text-right bg-ibm-gray90 border border-ibm-gray70 text-ibm-gray10 focus:border-ibm-blue focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total footer */}
      <div className="flex-shrink-0 border-t border-ibm-gray60 bg-ibm-gray80">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-[10px] text-ibm-gray50 font-mono uppercase tracking-widest">Total propuesta</p>
            <p className="text-[10px] text-ibm-gray50 mt-0.5">
              {displayNodes.length} equipo{displayNodes.length !== 1 ? 's' : ''} ·
              {displayNodes.filter(n => prices[n.id] && parseFloat(prices[n.id]) > 0).length} cotizado{displayNodes.filter(n => prices[n.id] && parseFloat(prices[n.id]) > 0).length !== 1 ? 's' : ''}
            </p>
          </div>
          <p className="text-xl font-bold font-mono text-ibm-gray10">{fmt(total)}</p>
        </div>
      </div>
    </div>
  )
}

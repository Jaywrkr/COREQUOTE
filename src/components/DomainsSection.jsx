import { useState, useRef, useCallback } from 'react'
import { DOMAINS, DOMAIN_QUESTIONS } from '../data/domains'
import { calcReadiness } from './steps/Questionnaire'
import { usePrefs } from '../hooks/usePrefs'

// ─── Domain order persistence ─────────────────────────────────────────────────
const ORDER_KEY = 'cq-domain-order'

function loadOrder() {
  try {
    const saved = JSON.parse(localStorage.getItem(ORDER_KEY) || 'null')
    if (!saved) return DOMAINS.map(d => d.id)
    // Merge: keep saved order, append any new domains not in saved list
    const known = new Set(saved)
    const extras = DOMAINS.map(d => d.id).filter(id => !known.has(id))
    return [...saved.filter(id => DOMAINS.find(d => d.id === id)), ...extras]
  } catch { return DOMAINS.map(d => d.id) }
}

function saveOrder(order) {
  try { localStorage.setItem(ORDER_KEY, JSON.stringify(order)) } catch {}
}

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
      style={{ color: r.color, borderColor: r.color + '50', backgroundColor: r.color + '15' }}
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
  const isFilled = value !== undefined && value !== '' && value !== null && !(Array.isArray(value) && value.length === 0)

  if (q.type === 'select') {
    const isBinary = q.options.length === 2
    return (
      <div className={`flex items-center gap-3 py-2.5 border-b border-ibm-gray20 dark:border-ibm-gray70 last:border-0 ${isFilled ? '' : 'opacity-90'}`}>
        <span className={`text-sm flex-1 leading-snug ${isFilled ? 'text-ibm-gray100 dark:text-ibm-gray10' : 'text-ibm-gray60 dark:text-ibm-gray30'}`}>
          {q.question}
        </span>
        <div className={`flex flex-shrink-0 ${isBinary ? '' : 'flex-wrap gap-1 justify-end max-w-[55%]'}`}>
          {q.options.map((opt, i) => {
            const active = value === opt
            return (
              <button
                key={opt}
                onClick={() => set(active ? undefined : opt)}
                className={`text-xs font-medium px-3 py-1.5 transition-colors whitespace-nowrap
                  ${isBinary
                    ? `border border-ibm-gray50 dark:border-ibm-gray50 ${i === 0 ? 'border-r-0' : ''}
                       ${active ? 'bg-ibm-blue text-white border-ibm-blue dark:border-ibm-blue z-10 relative' : 'text-ibm-gray60 dark:text-ibm-gray30 hover:border-ibm-blue dark:hover:border-ibm-blue'}`
                    : `border mb-1
                       ${active
                         ? 'bg-ibm-blue text-white border-ibm-blue'
                         : 'border-ibm-gray50 dark:border-ibm-gray50 text-ibm-gray60 dark:text-ibm-gray30 hover:border-ibm-blue dark:hover:border-ibm-blue'
                       }`
                  }`}
              >
                {active && <span className="mr-1 text-[10px]">✓</span>}{opt}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (q.type === 'number') {
    return (
      <div className="flex items-center gap-3 py-2.5 border-b border-ibm-gray20 dark:border-ibm-gray70 last:border-0">
        <span className={`text-sm flex-1 leading-snug ${isFilled ? 'text-ibm-gray100 dark:text-ibm-gray10' : 'text-ibm-gray60 dark:text-ibm-gray30'}`}>
          {q.question}
        </span>
        <input
          type="number"
          min="0"
          placeholder={q.placeholder || '—'}
          value={value || ''}
          onChange={e => set(e.target.value)}
          className="w-20 text-right bg-ibm-gray20 dark:bg-ibm-gray80 border-b-2 border-ibm-gray50 dark:border-ibm-gray50 focus:border-ibm-blue outline-none px-2 py-1 text-sm font-mono text-ibm-gray100 dark:text-ibm-gray10 flex-shrink-0"
        />
      </div>
    )
  }

  if (q.type === 'text') {
    return (
      <div className="py-2.5 border-b border-ibm-gray20 dark:border-ibm-gray70 last:border-0 space-y-1.5">
        <label className="text-xs font-medium text-ibm-gray50 dark:text-ibm-gray30 uppercase tracking-wide">{q.question}</label>
        <input
          className="field py-2 text-sm"
          placeholder={q.placeholder}
          value={value || ''}
          onChange={e => set(e.target.value)}
        />
      </div>
    )
  }

  if (q.type === 'textarea') {
    return (
      <div className="py-2.5 border-b border-ibm-gray20 dark:border-ibm-gray70 last:border-0 space-y-1.5">
        <label className="text-xs font-medium text-ibm-gray50 dark:text-ibm-gray30 uppercase tracking-wide">{q.question}</label>
        <textarea
          className="field resize-none py-2 text-sm"
          rows={2}
          placeholder={q.placeholder}
          value={value || ''}
          onChange={e => set(e.target.value)}
        />
      </div>
    )
  }

  if (q.type === 'multicheck') {
    return (
      <div className="py-2.5 border-b border-ibm-gray20 dark:border-ibm-gray70 last:border-0 space-y-2">
        <label className="text-xs font-medium text-ibm-gray50 dark:text-ibm-gray30 uppercase tracking-wide">{q.question}</label>
        <div className="flex flex-wrap gap-1.5">
          {q.options.map(opt => {
            const arr = Array.isArray(value) ? value : []
            const checked = arr.includes(opt)
            return (
              <button
                key={opt}
                onClick={() => set(checked ? arr.filter(v => v !== opt) : [...arr, opt])}
                className={`text-xs px-2.5 py-1 border transition-colors font-medium
                  ${checked
                    ? 'bg-ibm-blue text-white border-ibm-blue'
                    : 'border-ibm-gray50 dark:border-ibm-gray50 text-ibm-gray60 dark:text-ibm-gray30 hover:border-ibm-blue dark:hover:border-ibm-blue'
                  }`}
              >
                {checked && '✓ '}{opt}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return null
}

// ─── Section block with favorite / hide controls ──────────────────────────────
function SectionBlock({ domainId, label, questions, answers, onChange, pref, onPrefChange }) {
  const [manualOpen, setManualOpen] = useState(false)

  const isHidden    = pref === 'hidden'
  const isFavorite  = pref === 'favorite'
  const isCollapsed = isHidden && !manualOpen

  const cycleHide = e => {
    e.stopPropagation()
    onPrefChange(isHidden ? 'normal' : 'hidden')
    setManualOpen(false)
  }

  const cycleFav = e => {
    e.stopPropagation()
    onPrefChange(isFavorite ? 'normal' : 'favorite')
  }

  return (
    <div className={`mb-1 ${isHidden ? 'opacity-60' : ''}`}>
      {/* Section header */}
      <div className="flex items-center gap-2 py-1 mb-0.5 group">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 flex-1
            ${isFavorite
              ? 'bg-ibm-blue/20 text-ibm-blue dark:text-ibm-blue border-l-2 border-ibm-blue pl-1.5'
              : 'bg-ibm-gray20 dark:bg-ibm-gray80 text-ibm-gray50 dark:text-ibm-gray30'
            }`}
        >
          {isFavorite && '★ '}{label}
        </span>

        {/* Controls — always visible, small */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Favorite */}
          <button
            onClick={cycleFav}
            title={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
            className={`p-1 rounded transition-colors text-[11px] leading-none
              ${isFavorite ? 'text-ibm-blue' : 'text-ibm-gray50 hover:text-ibm-gray30'}`}
          >
            {isFavorite ? '★' : '☆'}
          </button>
          {/* Hide */}
          <button
            onClick={cycleHide}
            title={isHidden ? 'Mostrar sección' : 'Ocultar sección'}
            className={`p-1 rounded transition-colors text-[11px] leading-none
              ${isHidden ? 'text-ibm-yellow' : 'text-ibm-gray50 hover:text-ibm-gray30'}`}
          >
            {isHidden ? '⊕' : '⊖'}
          </button>
        </div>
      </div>

      {/* Questions — hidden unless manually opened */}
      {isCollapsed ? (
        <button
          onClick={() => setManualOpen(true)}
          className="text-[10px] text-ibm-gray50 hover:text-ibm-gray30 px-1 py-0.5 transition-colors"
        >
          mostrar {questions.length} preguntas
        </button>
      ) : (
        <div>
          {questions.map(q => (
            <QuestionField
              key={q.id} q={q}
              value={(answers || {})[q.key]}
              onChange={(key, val) => onChange({ ...answers, [key]: val })}
              answers={answers || {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Domain row ───────────────────────────────────────────────────────────────
function DomainRow({ domain, enabled, onToggle, answers, onChange, getSection, setSection, dragHandleProps, isDragging }) {
  const questions  = DOMAIN_QUESTIONS[domain.id] || []
  const domAnswers = answers || {}
  const filled     = Object.keys(domAnswers).filter(k => k !== '_restricciones').length
  const sections   = [...new Set(questions.map(q => q.section))]

  const sortedSections = [...sections].sort((a, b) => {
    const pa = getSection(domain.id, a)
    const pb = getSection(domain.id, b)
    const order = { favorite: 0, normal: 1, hidden: 2 }
    return (order[pa] ?? 1) - (order[pb] ?? 1)
  })

  return (
    <div
      className={`border-b border-ibm-gray20 dark:border-ibm-gray80 transition-all
        ${!enabled ? 'opacity-55' : ''}
        ${isDragging ? 'opacity-40 bg-ibm-blue/5' : ''}
      `}
    >
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Drag handle */}
        <span
          {...dragHandleProps}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-ibm-gray50 hover:text-ibm-gray30 transition-colors touch-none"
          title="Arrastrar para reordenar"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"/>
          </svg>
        </span>
        <span className="text-lg flex-shrink-0 transition-colors" style={{ color: enabled ? domain.color : undefined }}>
          {domain.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-ibm-gray100 dark:text-ibm-gray10">{domain.label}</span>
            <span className="text-xs text-ibm-gray50 font-mono">{domain.brand}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {enabled && filled > 0 && (
              <span className="text-xs font-mono text-ibm-gray50">{filled} resp.</span>
            )}
            {enabled && <ReadinessBadge domainId={domain.id} answers={domAnswers} />}
            {!enabled && (
              <span className="text-xs text-ibm-gray50 dark:text-ibm-gray30">{domain.description}</span>
            )}
          </div>
        </div>
        <Toggle on={enabled} onToggle={onToggle} />
      </div>

      {/* Questions body */}
      {enabled && (
        <div className="px-4 pb-5 pt-1 border-t border-ibm-gray20 dark:border-ibm-gray80 bg-ibm-gray10/40 dark:bg-ibm-gray100/40 space-y-3">
          {sortedSections.map(section => (
            <SectionBlock
              key={section}
              domainId={domain.id}
              label={section}
              questions={questions.filter(q => q.section === section)}
              answers={domAnswers}
              onChange={onChange}
              pref={getSection(domain.id, section)}
              onPrefChange={val => setSection(domain.id, section, val)}
            />
          ))}

          {/* Restricciones */}
          <div className="pt-3 border-t border-ibm-gray20 dark:border-ibm-gray70 space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-ibm-yellow flex items-center gap-1.5">
              ⚠ Restricciones y dependencias
            </label>
            <textarea
              className="field resize-none py-2 text-sm"
              rows={2}
              placeholder="Cualquier cosa que pueda complicar la implementación…"
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
    <div className="px-4 py-4 bg-ibm-gray10 dark:bg-ibm-gray90/60 border-t border-ibm-gray20 dark:border-ibm-gray80">
      <p className="field-label mb-2">Indicador de readiness</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {[
          { color: '#8d8d8d', label: 'Sin datos',          desc: 'No se puede cotizar' },
          { color: '#f1c21b', label: 'Info parcial',        desc: 'Pueden existir gaps' },
          { color: '#24a148', label: 'Listo para cotizar',  desc: '+60% completado' },
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
  const { getSection, setSection } = usePrefs()
  const [order, setOrder] = useState(loadOrder)
  const [draggingId, setDraggingId]   = useState(null)
  const [overId,     setOverId]       = useState(null)
  const dragItem = useRef(null)

  const toggleDomain = id =>
    setDomains(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])

  const orderedDomains = order
    .map(id => DOMAINS.find(d => d.id === id))
    .filter(Boolean)

  // ── HTML5 drag handlers ──
  const handleDragStart = useCallback((id) => (e) => {
    dragItem.current = id
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
    // Transparent drag image (we style the row itself)
    const img = new Image()
    e.dataTransfer.setDragImage(img, 0, 0)
  }, [])

  const handleDragOver = useCallback((id) => (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (id !== draggingId) setOverId(id)
  }, [draggingId])

  const handleDrop = useCallback((targetId) => (e) => {
    e.preventDefault()
    const from = dragItem.current
    if (!from || from === targetId) return
    setOrder(prev => {
      const next = [...prev]
      const fromIdx   = next.indexOf(from)
      const targetIdx = next.indexOf(targetId)
      next.splice(fromIdx, 1)
      next.splice(targetIdx, 0, from)
      saveOrder(next)
      return next
    })
    setDraggingId(null)
    setOverId(null)
    dragItem.current = null
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
    setOverId(null)
    dragItem.current = null
  }, [])

  return (
    <div>
      {orderedDomains.map(domain => (
        <div
          key={domain.id}
          onDragOver={handleDragOver(domain.id)}
          onDrop={handleDrop(domain.id)}
          className={`transition-all duration-150 ${
            overId === domain.id && draggingId !== domain.id
              ? 'border-t-2 border-ibm-blue'
              : 'border-t-2 border-transparent'
          }`}
        >
          <DomainRow
            domain={domain}
            enabled={domains.includes(domain.id)}
            onToggle={() => toggleDomain(domain.id)}
            answers={answers[domain.id]}
            onChange={val => onChange({ ...answers, [domain.id]: val })}
            getSection={getSection}
            setSection={setSection}
            isDragging={draggingId === domain.id}
            dragHandleProps={{
              draggable: true,
              onDragStart: handleDragStart(domain.id),
              onDragEnd:   handleDragEnd,
            }}
          />
        </div>
      ))}
      <ReadinessLegend />
    </div>
  )
}

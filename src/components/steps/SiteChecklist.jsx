import { useState } from 'react'

const CHECKLIST_SECTIONS = [
  {
    id: 'espacio',
    label: 'Espacio físico',
    icon: '🏗️',
    items: [
      { id: 'rack_disponible', label: '¿Tienen rack disponible?' },
      { id: 'rack_propio', label: '¿El rack es propio (no del edificio)?' },
      { id: 'cuarto_dedicado', label: '¿Hay cuarto/sala de servidores dedicado?' },
      { id: 'acceso_controlado', label: '¿El cuarto tiene acceso controlado?' },
    ],
    fields: [
      { id: 'rack_u_libres', label: 'Unidades de rack disponibles (U)', type: 'number', placeholder: 'Ej: 12' },
    ],
  },
  {
    id: 'energia',
    label: 'Energía eléctrica',
    icon: '⚡',
    items: [
      { id: 'ups', label: '¿Tienen UPS (alimentación ininterrumpida)?' },
      { id: 'pdu', label: '¿Tienen PDU en el rack?' },
      { id: 'circuito_dedicado', label: '¿El cuarto tiene circuito eléctrico dedicado?' },
      { id: 'planta_electrica', label: '¿Tienen planta eléctrica / generador?' },
    ],
    fields: [
      { id: 'ups_kva', label: 'Capacidad UPS (KVA)', type: 'text', placeholder: 'Ej: 3 KVA' },
    ],
  },
  {
    id: 'refrigeracion',
    label: 'Refrigeración',
    icon: '❄️',
    items: [
      { id: 'ac_dedicado', label: '¿Tiene A/C dedicado en el cuarto de servidores?' },
      { id: 'temperatura_monitoreo', label: '¿Monitorean la temperatura?' },
    ],
    fields: [
      { id: 'temp_observaciones', label: 'Observaciones de temperatura', type: 'text', placeholder: 'Ej: A/C de ventana, falla en verano...' },
    ],
  },
  {
    id: 'cableado',
    label: 'Cableado estructurado',
    icon: '🔌',
    items: [
      { id: 'cableado_cat6', label: '¿El cableado es Cat 6 o superior?' },
      { id: 'cableado_certificado', label: '¿El cableado está certificado?' },
      { id: 'planos_disponibles', label: '¿Tienen planos o documentación del cableado?' },
      { id: 'patch_panel', label: '¿Tienen patch panel organizado?' },
    ],
    fields: [
      { id: 'puntos_red', label: 'Puntos de red aproximados', type: 'number', placeholder: 'Ej: 48' },
      { id: 'cableado_quien', label: '¿Quién instaló el cableado?', type: 'text', placeholder: 'Empresa o interno' },
    ],
  },
  {
    id: 'conectividad',
    label: 'Conectividad / ISP',
    icon: '🌐',
    items: [
      { id: 'contrato_vigente', label: '¿Tienen contrato vigente con ISP?' },
      { id: 'contrato_renovacion', label: '¿El contrato está próximo a renovar?' },
      { id: 'fibra', label: '¿El acceso es de fibra óptica?' },
    ],
    fields: [
      { id: 'isp_nombre', label: 'Proveedor(es) de internet', type: 'text', placeholder: 'Ej: Claro, Cable & Wireless' },
      { id: 'ancho_banda', label: 'Ancho de banda contratado', type: 'text', placeholder: 'Ej: 100/50 Mbps' },
      { id: 'contrato_vence', label: 'Vencimiento del contrato', type: 'text', placeholder: 'Ej: Diciembre 2025' },
    ],
  },
]

const EQUIPO_TIPOS = [
  'Servidor', 'Switch', 'Router', 'Firewall', 'Access Point', 'NAS / Storage',
  'UPS', 'PC / Workstation', 'Impresora', 'Teléfono IP', 'Otro',
]

const EQUIPO_ESTADOS = ['Funcional', 'Con problemas', 'A reemplazar', 'No sé']

function CheckItem({ id, label, checked, onToggle }) {
  return (
    <button
      onClick={() => onToggle(id)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors border-b border-ibm-gray20 dark:border-ibm-gray70 last:border-0 ${
        checked
          ? 'text-ibm-blue bg-ibm-blue-10 dark:bg-ibm-blue/10'
          : 'text-ibm-gray70 dark:text-ibm-gray30 hover:bg-ibm-gray10 dark:hover:bg-ibm-gray80'
      }`}
    >
      <span className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center ${
        checked ? 'bg-ibm-blue border-ibm-blue' : 'border-ibm-gray50'
      }`}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </button>
  )
}

function InventarioTable({ rows, onChange }) {
  const addRow = () => onChange([...rows, { tipo: '', marca: '', modelo: '', edad: '', estado: '' }])
  const removeRow = i => onChange(rows.filter((_, idx) => idx !== i))
  const updateRow = (i, key, val) => {
    const next = [...rows]
    next[i] = { ...next[i], [key]: val }
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[520px]">
          <thead>
            <tr className="border-b border-ibm-gray20 dark:border-ibm-gray70">
              {['Tipo', 'Marca', 'Modelo', 'Años de uso', 'Estado', ''].map(h => (
                <th key={h} className="field-label py-2 px-2 text-left font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-ibm-gray20 dark:border-ibm-gray70">
                <td className="px-1 py-1.5">
                  <select
                    className="field text-xs py-1.5"
                    value={row.tipo}
                    onChange={e => updateRow(i, 'tipo', e.target.value)}
                  >
                    <option value="">—</option>
                    {EQUIPO_TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </td>
                <td className="px-1 py-1.5">
                  <input className="field text-xs py-1.5" placeholder="Ej: Cisco" value={row.marca} onChange={e => updateRow(i, 'marca', e.target.value)} />
                </td>
                <td className="px-1 py-1.5">
                  <input className="field text-xs py-1.5" placeholder="Ej: SG350-28" value={row.modelo} onChange={e => updateRow(i, 'modelo', e.target.value)} />
                </td>
                <td className="px-1 py-1.5">
                  <input className="field text-xs py-1.5 w-20" type="number" min="0" max="30" placeholder="0" value={row.edad} onChange={e => updateRow(i, 'edad', e.target.value)} />
                </td>
                <td className="px-1 py-1.5">
                  <select className="field text-xs py-1.5" value={row.estado} onChange={e => updateRow(i, 'estado', e.target.value)}>
                    <option value="">—</option>
                    {EQUIPO_ESTADOS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-1 py-1.5">
                  <button
                    onClick={() => removeRow(i)}
                    className="text-ibm-gray50 hover:text-ibm-red transition-colors p-1"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="text-xs text-ibm-gray50 py-2">No hay equipos registrados.</p>
      )}

      <button onClick={addRow} className="btn-ghost text-xs gap-1.5 px-3 py-2">
        + Agregar equipo
      </button>
    </div>
  )
}

export default function SiteChecklist({ data, onChange }) {
  const checks = data.checks || {}
  const fields = data.fields || {}
  const inventario = data.inventario || []

  const toggleCheck = id => {
    onChange({ ...data, checks: { ...checks, [id]: !checks[id] } })
  }
  const setField = (id, val) => {
    onChange({ ...data, fields: { ...fields, [id]: val } })
  }
  const setInventario = rows => onChange({ ...data, inventario: rows })

  const totalItems = CHECKLIST_SECTIONS.reduce((acc, s) => acc + s.items.length, 0)
  const checkedItems = Object.values(checks).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 bg-ibm-gray20 dark:bg-ibm-gray80">
          <div
            className="h-1 bg-ibm-blue transition-all duration-300"
            style={{ width: `${(checkedItems / totalItems) * 100}%` }}
          />
        </div>
        <span className="text-xs font-mono text-ibm-gray50">{checkedItems}/{totalItems}</span>
      </div>

      {/* Checklist sections */}
      {CHECKLIST_SECTIONS.map(section => (
        <div key={section.id} className="surface">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-ibm-gray20 dark:border-ibm-gray70">
            <span>{section.icon}</span>
            <span className="text-sm font-semibold text-ibm-gray100 dark:text-ibm-gray10">{section.label}</span>
            <span className="text-xs font-mono text-ibm-gray50 ml-auto">
              {section.items.filter(i => checks[i.id]).length}/{section.items.length}
            </span>
          </div>

          <div>
            {section.items.map(item => (
              <CheckItem
                key={item.id}
                id={item.id}
                label={item.label}
                checked={!!checks[item.id]}
                onToggle={toggleCheck}
              />
            ))}
          </div>

          {section.fields.length > 0 && (
            <div className="px-4 py-3 space-y-3 border-t border-ibm-gray20 dark:border-ibm-gray70 bg-ibm-gray10 dark:bg-ibm-gray80/50">
              {section.fields.map(f => (
                <div key={f.id}>
                  <label className="field-label">{f.label}</label>
                  <input
                    className="field"
                    type={f.type}
                    placeholder={f.placeholder}
                    value={fields[f.id] || ''}
                    onChange={e => setField(f.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Inventario */}
      <div className="surface">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-ibm-gray20 dark:border-ibm-gray70">
          <span>📦</span>
          <span className="text-sm font-semibold text-ibm-gray100 dark:text-ibm-gray10">Inventario de equipos existentes</span>
          {inventario.length > 0 && (
            <span className="text-xs font-mono text-ibm-gray50 ml-auto">{inventario.length} equipo{inventario.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30 mb-4">
            Registra lo que el cliente tiene actualmente. Ayuda a definir qué se reemplaza, integra o migra.
          </p>
          <InventarioTable rows={inventario} onChange={setInventario} />
        </div>
      </div>

      <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30">
        Toda esta sección es opcional — completa lo que puedas durante la visita.
      </p>
    </div>
  )
}

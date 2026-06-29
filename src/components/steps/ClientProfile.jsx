const INDUSTRIES = [
  'Manufactura', 'Retail / Comercio', 'Salud', 'Educación', 'Financiero / Banca',
  'Gobierno', 'Logística / Transporte', 'Tecnología', 'Construcción', 'Servicios', 'Otro',
]

const ROLES = [
  'Dueño / Gerente General',
  'Gerente de TI / CTO / CIO',
  'Técnico de TI / Ingeniero',
  'Gerente de Operaciones',
  'Otro',
]

export default function ClientProfile({ data, onChange }) {
  const set = (key, value) => onChange({ ...data, [key]: value })

  return (
    <div className="step-enter space-y-5">
      <div>
        <label className="label">Nombre de la empresa *</label>
        <input className="input" placeholder="Ej: Empresa XYZ S.A." value={data.company || ''} onChange={e => set('company', e.target.value)} />
      </div>

      <div>
        <label className="label">Industria</label>
        <select className="input" value={data.industry || ''} onChange={e => set('industry', e.target.value)}>
          <option value="">Seleccionar...</option>
          {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Número de usuarios</label>
          <select className="input" value={data.userCount || ''} onChange={e => set('userCount', e.target.value)}>
            <option value="">Seleccionar...</option>
            {['1-25', '26-50', '51-100', '101-250', '251-500', '500+'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Ubicaciones</label>
          <select className="input" value={data.locationCount || ''} onChange={e => set('locationCount', e.target.value)}>
            <option value="">Seleccionar...</option>
            {['1', '2', '3-5', '6-10', '10+'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="pt-1 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-wide">Contacto en el cliente</p>
        <div className="space-y-4">
          <div>
            <label className="label">Nombre del contacto</label>
            <input className="input" placeholder="Nombre completo" value={data.contactName || ''} onChange={e => set('contactName', e.target.value)} />
          </div>
          <div>
            <label className="label">Rol del contacto</label>
            <select className="input" value={data.contactRole || ''} onChange={e => set('contactRole', e.target.value)}>
              <option value="">Seleccionar...</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

const INDUSTRIES = [
  'Manufactura', 'Retail / Comercio', 'Salud', 'Educación',
  'Financiero / Banca', 'Gobierno', 'Logística / Transporte',
  'Tecnología', 'Construcción', 'Servicios', 'Otro',
]

const ROLES = [
  'Dueño / Gerente General',
  'Gerente de TI / CTO / CIO',
  'Técnico de TI / Ingeniero',
  'Gerente de Operaciones',
  'Otro',
]

function Field({ label, children, optional }) {
  return (
    <div>
      <label className="field-label">
        {label}
        {optional && <span className="ml-1 text-ibm-gray50 normal-case font-normal">(opcional)</span>}
      </label>
      {children}
    </div>
  )
}

export default function ClientProfile({ data, onChange }) {
  const set = (key, val) => onChange({ ...data, [key]: val })

  return (
    <div className="space-y-6">
      <div className="surface p-6 space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-ibm-gray50 dark:text-ibm-gray30">Empresa</p>

        <Field label="Nombre de la empresa *">
          <input
            className="field"
            placeholder="Ej: Empresa XYZ S.A."
            value={data.company || ''}
            onChange={e => set('company', e.target.value)}
          />
        </Field>

        <Field label="Industria" optional>
          <select className="field" value={data.industry || ''} onChange={e => set('industry', e.target.value)}>
            <option value="">Seleccionar...</option>
            {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Usuarios" optional>
            <select className="field" value={data.userCount || ''} onChange={e => set('userCount', e.target.value)}>
              <option value="">—</option>
              {['1-25', '26-50', '51-100', '101-250', '251-500', '500+'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Ubicaciones" optional>
            <select className="field" value={data.locationCount || ''} onChange={e => set('locationCount', e.target.value)}>
              <option value="">—</option>
              {['1', '2', '3-5', '6-10', '10+'].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <div className="surface p-6 space-y-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-ibm-gray50 dark:text-ibm-gray30">Contacto del cliente</p>

        <Field label="Nombre" optional>
          <input
            className="field"
            placeholder="Nombre completo"
            value={data.contactName || ''}
            onChange={e => set('contactName', e.target.value)}
          />
        </Field>

        <Field label="Rol" optional>
          <select className="field" value={data.contactRole || ''} onChange={e => set('contactRole', e.target.value)}>
            <option value="">Seleccionar...</option>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </Field>
      </div>

      <p className="text-xs text-ibm-gray50 dark:text-ibm-gray30">
        Solo el nombre de la empresa es requerido. El resto puede completarse después.
      </p>
    </div>
  )
}

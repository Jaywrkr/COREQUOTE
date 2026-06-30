const STORAGE_KEY = 'corequote_tutorial_v1'

export function hasTutorialBeenSeen() {
  try { return !!localStorage.getItem(STORAGE_KEY) } catch { return false }
}

export function markTutorialSeen() {
  try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
}

export function resetTutorial() {
  try { localStorage.removeItem(STORAGE_KEY) } catch {}
}

const FEATURES = [
  {
    icon: '🏢',
    title: 'Assessment completo',
    desc: 'Captura el perfil del cliente, entorno físico (rack, energía, cableado, ISP) y todos los dominios tecnológicos en un formulario estructurado.',
  },
  {
    icon: '🗺️',
    title: 'Diagrama interactivo',
    desc: 'Visualiza la arquitectura con nodos y conexiones validadas en tiempo real. Arrastra, conecta y edita equipos directamente en el canvas.',
  },
  {
    icon: '💡',
    title: 'Sugerencias de conexión',
    desc: 'El motor de recomendaciones sugiere los siguientes pasos basándose en arquitecturas empresariales reales, priorizadas por criticidad.',
  },
  {
    icon: '🔌',
    title: 'Ficha técnica y puertos',
    desc: 'Al hacer click en cualquier equipo, ve sus especificaciones completas, el estado de cada puerto (ocupado / libre) y desde dónde viene cada conexión.',
  },
  {
    icon: '📊',
    title: 'Resumen de propuesta',
    desc: 'Lista automática de todos los equipos nuevos del diagrama con modelo, precio unitario editable y total. Exportable a CSV en un click.',
  },
  {
    icon: '✅',
    title: 'Validación de arquitectura',
    desc: 'Revisa el diagrama contra buenas prácticas: detecta falta de firewall, storage sin backup, servidores sin red y más, con semáforo visual.',
  },
  {
    icon: '💾',
    title: 'Guardado automático',
    desc: 'Cada cambio se guarda automáticamente en el dispositivo. Sin servidor, sin cuenta, sin pérdida de datos.',
  },
  {
    icon: '📁',
    title: 'Multi-visita',
    desc: 'Gestiona múltiples clientes y visitas. Duplica assessments, cambia entre ellos y mantén un historial organizado.',
  },
]

export default function TutorialModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div
        className="bg-ibm-gray90 border border-ibm-gray70 w-full sm:max-w-2xl flex flex-col overflow-hidden shadow-2xl"
        style={{ maxHeight: '92vh', animation: 'sheetIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-ibm-gray70 flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5">
              <svg viewBox="0 0 32 32" className="w-5 h-5 text-ibm-blue" fill="currentColor">
                <rect x="0" y="0" width="32" height="4" /><rect x="0" y="8" width="32" height="4" />
                <rect x="4" y="16" width="24" height="4" /><rect x="4" y="24" width="24" height="4" />
              </svg>
              <span className="text-xs font-mono text-ibm-gray50">CoreSolutions</span>
            </div>
          </div>
          <h2 className="text-lg font-bold text-ibm-gray10 leading-tight">Bienvenido a CoreQuote</h2>
          <p className="text-xs text-ibm-gray50 mt-1">
            Herramienta interna para levantamiento y propuesta de arquitectura IT en visitas a clientes.
          </p>
        </div>

        {/* Features grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-[10px] font-bold text-ibm-gray50 uppercase tracking-widest mb-3">
            ¿Qué puedes hacer?
          </p>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex gap-3 bg-ibm-gray80 border border-ibm-gray70 px-3 py-3 hover:border-ibm-gray60 transition-colors"
              >
                <span className="text-xl flex-shrink-0 mt-0.5">{f.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-ibm-gray10">{f.title}</p>
                  <p className="text-[10px] text-ibm-gray50 mt-0.5 leading-snug">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 px-3 py-2.5 bg-ibm-blue/10 border border-ibm-blue/30 flex gap-2.5">
            <span className="text-ibm-blue text-sm flex-shrink-0">ℹ</span>
            <p className="text-[10px] text-ibm-blue/80 leading-snug">
              Todo se guarda localmente en este dispositivo. No hay cuenta, no hay servidor, no hay datos enviados a ningún lado.
              Para volver a ver este tutorial, ve al menú de visitas <span className="font-mono">→</span> Ajustes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-ibm-gray70 flex items-center justify-between flex-shrink-0 gap-3">
          <button
            onClick={onClose}
            className="text-xs text-ibm-gray50 hover:text-ibm-gray30 transition-colors px-3 py-2"
          >
            Omitir
          </button>
          <button
            onClick={onClose}
            className="btn-primary text-xs py-2 px-6 flex items-center gap-2"
          >
            Empezar assessment
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

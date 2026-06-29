import { useState, useCallback, useRef } from 'react'
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { generateRFDiagram, NODE_TYPES } from '../../utils/rfDiagramGenerator'

// ─── Custom IBM-styled node ───────────────────────────────────────────────────
function IBMNode({ data, selected }) {
  return (
    <div
      className={`
        min-w-[130px] border transition-all cursor-pointer select-none
        bg-ibm-gray90 dark:bg-ibm-gray90
        ${selected
          ? 'border-ibm-blue shadow-[0_0_0_2px_rgba(15,98,254,0.3)]'
          : 'border-ibm-gray70 hover:border-ibm-gray50'
        }
      `}
      style={{ borderLeftColor: data.color, borderLeftWidth: 3 }}
    >
      <Handle type="target" position={Position.Top} style={{ background: '#525252', border: 'none', width: 8, height: 8 }} />
      <div className="px-3 py-2.5">
        <div className="flex items-start gap-2">
          <span className="text-base leading-none mt-0.5 flex-shrink-0">{data.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ibm-gray10 leading-tight break-words">{data.label}</p>
            {data.brand && (
              <p className="text-[10px] text-ibm-gray50 font-mono mt-0.5 leading-tight">{data.brand}</p>
            )}
          </div>
          {data.note && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: '#f1c21b' }}
              title="Tiene nota"
            />
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#525252', border: 'none', width: 8, height: 8 }} />
    </div>
  )
}

const NODE_TYPE_MAP = { ibmNode: IBMNode }

// ─── Add node picker ──────────────────────────────────────────────────────────
const ADDABLE_NODES = [
  { type: 'internet',  label: 'Internet / ISP' },
  { type: 'firewall',  label: 'Firewall' },
  { type: 'switch',    label: 'Switch' },
  { type: 'ap',        label: 'Access Point / WiFi' },
  { type: 'servidor',  label: 'Servidor' },
  { type: 'storage',   label: 'Storage' },
  { type: 'backup',    label: 'Backup' },
  { type: 'vm',        label: 'Host VM' },
  { type: 'usuarios',  label: 'Usuarios' },
  { type: 'custom',    label: 'Equipo genérico' },
]

function AddNodePicker({ onAdd, onClose }) {
  return (
    <div className="absolute top-12 left-2 z-10 bg-ibm-gray90 border border-ibm-gray70 shadow-xl w-52" onClick={e => e.stopPropagation()}>
      <div className="px-3 py-2 border-b border-ibm-gray70">
        <p className="text-xs font-semibold text-ibm-gray30 uppercase tracking-widest">Agregar nodo</p>
      </div>
      <div className="py-1">
        {ADDABLE_NODES.map(n => {
          const base = NODE_TYPES[n.type]
          return (
            <button
              key={n.type}
              onClick={() => { onAdd(n.type); onClose() }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-ibm-gray80 transition-colors"
            >
              <span className="text-sm">{base?.icon}</span>
              <span className="text-xs text-ibm-gray10">{n.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Note panel ───────────────────────────────────────────────────────────────
function NotePanel({ node, onUpdate, onClose, onDelete }) {
  const [label, setLabel] = useState(node.data.label)
  const [note,  setNote]  = useState(node.data.note || '')

  const save = () => {
    onUpdate(node.id, { label, note })
    onClose()
  }

  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-ibm-gray90 border-l border-ibm-gray70 flex flex-col z-20 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-ibm-gray70 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{node.data.icon}</span>
          <span className="text-xs font-semibold text-ibm-gray10 truncate max-w-[150px]">{node.data.label}</span>
        </div>
        <button onClick={onClose} className="text-ibm-gray50 hover:text-ibm-gray10 transition-colors p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="field-label">Nombre del nodo</label>
          <input
            className="field text-sm"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Ej: Firewall HQ"
          />
        </div>

        <div>
          <label className="field-label flex items-center gap-1.5">
            <span className="text-ibm-yellow">📝</span> Nota técnica
          </label>
          <textarea
            className="field resize-none text-sm"
            rows={6}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ej: Switch HP sin garantía, instalado en 2016. Cliente confirmó que es no administrado. Prioridad de reemplazo alta..."
            autoFocus
          />
          <p className="text-xs text-ibm-gray50 mt-1">
            Queda guardada en el assessment y aparece en el reporte interno.
          </p>
        </div>

        {node.data.brand && (
          <div>
            <label className="field-label">Marca / solución</label>
            <p className="text-xs text-ibm-gray30 font-mono">{node.data.brand}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-4 border-t border-ibm-gray70 flex-shrink-0">
        <button
          onClick={save}
          className="btn-primary flex-1 text-xs py-2"
        >
          Guardar nota
        </button>
        <button
          onClick={() => { onDelete(node.id); onClose() }}
          className="px-3 py-2 text-xs border border-ibm-red/50 text-ibm-red hover:bg-ibm-red/10 transition-colors"
          title="Eliminar nodo"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Main canvas ──────────────────────────────────────────────────────────────
export default function DiagramCanvas({ assessment }) {
  const { nodes: initNodes, edges: initEdges } = generateRFDiagram(assessment)
  const [nodes, setNodes, onNodesChange] = useNodesState(initNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initEdges)
  const [selectedNode, setSelectedNode] = useState(null)
  const [showPicker, setShowPicker]     = useState(false)
  const idCounter = useRef(100)

  const onConnect = useCallback(
    params => setEdges(eds => addEdge({ ...params, style: { stroke: '#525252', strokeWidth: 1.5 } }, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node)
    setShowPicker(false)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setShowPicker(false)
  }, [])

  const updateNode = (id, changes) => {
    setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, ...changes } } : n))
    setSelectedNode(prev => prev?.id === id ? { ...prev, data: { ...prev.data, ...changes } } : prev)
  }

  const deleteNode = id => {
    setNodes(ns => ns.filter(n => n.id !== id))
    setEdges(es => es.filter(e => e.source !== id && e.target !== id))
  }

  const addNode = type => {
    const base = NODE_TYPES[type] || NODE_TYPES.custom
    const id   = `custom-${idCounter.current++}`
    const newNode = {
      id,
      type: 'ibmNode',
      position: { x: 80 + Math.random() * 200, y: 80 + Math.random() * 200 },
      data: { nodeType: type, icon: base.icon, label: base.label, brand: base.brand, color: base.color, note: '' },
    }
    setNodes(ns => [...ns, newNode])
  }

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={NODE_TYPE_MAP}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode="Delete"
        className="bg-ibm-gray100"
        style={{ background: '#161616' }}
      >
        <Background color="#262626" variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls
          style={{ background: '#262626', border: '1px solid #525252' }}
          className="[&>button]:bg-ibm-gray90 [&>button]:border-ibm-gray70 [&>button]:text-ibm-gray10"
        />

        {/* Toolbar */}
        <Panel position="top-left">
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => { setShowPicker(p => !p); setSelectedNode(null) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-colors
                ${showPicker
                  ? 'bg-ibm-blue text-white border-ibm-blue'
                  : 'bg-ibm-gray90 text-ibm-gray10 border-ibm-gray70 hover:border-ibm-gray50'
                }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Agregar
            </button>

            <p className="text-[10px] text-ibm-gray50 hidden sm:block">
              Arrastra nodos · Conecta con drag desde los puntos · Click para notas · Delete para eliminar
            </p>

            {showPicker && (
              <AddNodePicker onAdd={addNode} onClose={() => setShowPicker(false)} />
            )}
          </div>
        </Panel>
      </ReactFlow>

      {/* Note panel overlay */}
      {selectedNode && (
        <NotePanel
          node={selectedNode}
          onUpdate={updateNode}
          onClose={() => setSelectedNode(null)}
          onDelete={deleteNode}
        />
      )}
    </div>
  )
}

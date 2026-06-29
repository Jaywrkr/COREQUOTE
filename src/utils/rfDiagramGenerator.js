// Generates ReactFlow nodes + edges from assessment data

const NODE_TYPES = {
  internet:      { icon: '🌍', label: 'Internet',        brand: '',                    color: '#6f6f6f' },
  firewall:      { icon: '🔒', label: 'Firewall',        brand: 'Check Point',         color: '#E50000' },
  switch:        { icon: '🌐', label: 'Switching',       brand: 'Aruba',               color: '#FF8300' },
  ap:            { icon: '📶', label: 'WiFi / APs',      brand: 'Aruba',               color: '#FF8300' },
  servidor:      { icon: '🖥️', label: 'Servidores',      brand: 'IBM Power / Lenovo',  color: '#0052CC' },
  storage:       { icon: '💾', label: 'Storage',         brand: 'IBM Storage / Synology', color: '#6366F1' },
  backup:        { icon: '☁️', label: 'Backup',          brand: 'Veeam',               color: '#00B140' },
  vm:            { icon: '⚡', label: 'Virtualización',  brand: 'VMware',              color: '#607078' },
  usuarios:      { icon: '👥', label: 'Usuarios',        brand: '',                    color: '#8d8d8d' },
  custom:        { icon: '📦', label: 'Equipo',          brand: '',                    color: '#525252' },
}

export { NODE_TYPES }

function node(id, type, position, overrides = {}) {
  const base = NODE_TYPES[type] || NODE_TYPES.custom
  return {
    id,
    type: 'ibmNode',
    position,
    data: {
      nodeType: type,
      icon: base.icon,
      label: overrides.label || base.label,
      brand: overrides.brand || base.brand,
      color: base.color,
      note: '',
      ...overrides,
    },
  }
}

function edge(id, source, target) {
  return {
    id,
    source,
    target,
    style: { stroke: '#525252', strokeWidth: 1.5 },
    animated: false,
  }
}

export function generateRFDiagram(assessment) {
  const { domains, answers } = assessment
  const nodes = []
  const edges = []

  const has = d => domains.includes(d)
  const ans = d => answers[d] || {}

  // Internet — always present
  nodes.push(node('internet', 'internet', { x: 280, y: 0 }))

  // Firewall
  if (has('seguridad')) {
    const fw = ans('seguridad')
    nodes.push(node('firewall', 'firewall', { x: 280, y: 130 }, {
      label: fw.firewallBrand ? `Firewall · ${fw.firewallBrand}` : 'Firewall',
    }))
    edges.push(edge('e-int-fw', 'internet', 'firewall'))
  }

  // Switching / redes
  const netParent = has('seguridad') ? 'firewall' : 'internet'
  if (has('redes')) {
    const r = ans('redes')
    const swLabel = r.switchCount ? `Switching · ${r.switchCount} switches` : 'Switching'
    nodes.push(node('switch', 'switch', { x: 280, y: 260 }, { label: swLabel }))
    edges.push(edge('e-net-sw', netParent, 'switch'))

    if (r.hasWifi === 'Sí') {
      const apLabel = r.apCount ? `WiFi · ${r.apCount} APs` : 'WiFi / APs'
      nodes.push(node('ap', 'ap', { x: 520, y: 320 }, { label: apLabel }))
      edges.push(edge('e-sw-ap', 'switch', 'ap'))
    }
  }

  // Core parent for servers/storage/backup/vm
  const coreParent = has('redes') ? 'switch' : netParent

  // Spread core nodes horizontally
  const coreNodes = []
  if (has('servidores')) coreNodes.push('servidor')
  if (has('storage'))    coreNodes.push('storage')
  if (has('backup'))     coreNodes.push('backup')
  if (has('virtualizacion')) coreNodes.push('vm')

  const coreY   = 390
  const spread  = 170
  const totalW  = (coreNodes.length - 1) * spread
  const startX  = 280 - totalW / 2

  coreNodes.forEach((type, i) => {
    const id  = type
    const pos = { x: startX + i * spread, y: coreY }
    let overrides = {}

    if (type === 'servidor') {
      const s = ans('servidores')
      if (s.serverCount) overrides.label = `Servidores · ${s.serverCount}`
    }
    if (type === 'storage') {
      const s = ans('storage')
      if (s.storageCapacity) overrides.label = `Storage · ${s.storageCapacity}`
    }
    if (type === 'backup') {
      const b = ans('backup')
      if (b.backupFrequency) overrides.label = `Backup · ${b.backupFrequency}`
    }
    if (type === 'vm') {
      const v = ans('virtualizacion')
      if (v.hostCount) overrides.label = `vSphere · ${v.hostCount} hosts`
    }

    nodes.push(node(id, type, pos, overrides))
    edges.push(edge(`e-core-${id}`, coreParent, id))
  })

  // Users — always at bottom
  const usersY = coreNodes.length > 0 ? 520 : coreY
  nodes.push(node('usuarios', 'usuarios', { x: 280, y: usersY }))
  edges.push(edge('e-core-usr', coreParent, 'usuarios'))

  return { nodes, edges }
}

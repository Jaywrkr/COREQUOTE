// Generates ReactFlow nodes + edges from assessment data

const NODE_TYPES = {
  internet:  { icon: '🌍', label: 'Internet',        brand: '',                           color: '#6f6f6f', domainLabel: '' },
  firewall:  { icon: '🔒', label: 'Firewall',        brand: 'Check Point',                color: '#E50000', domainLabel: 'Seguridad' },
  switch:    { icon: '🌐', label: 'Switching',       brand: 'Aruba',                      color: '#FF8300', domainLabel: 'Redes' },
  ap:        { icon: '📶', label: 'WiFi / APs',      brand: 'Aruba',                      color: '#FF8300', domainLabel: 'Redes' },
  servidor:  { icon: '🖥️', label: 'Servidor x86',   brand: 'Lenovo ThinkSystem',         color: '#0052CC', domainLabel: 'Servidores' },
  power:     { icon: '⚙️', label: 'IBM Power',       brand: 'IBM Power10 (AIX / IBM i)',  color: '#1192e8', domainLabel: 'Servidores' },
  storage:   { icon: '💾', label: 'Storage',         brand: 'IBM FlashSystem / Synology', color: '#6366F1', domainLabel: 'Almacenamiento' },
  tape:      { icon: '📼', label: 'Tape Library',    brand: 'IBM TS Series',              color: '#8a3ffc', domainLabel: 'Almacenamiento' },
  backup:    { icon: '🛡️', label: 'Backup',          brand: 'Veeam',                      color: '#00B140', domainLabel: 'Backup' },
  vm:        { icon: '⚡', label: 'Virtualización',  brand: 'VMware vSphere',             color: '#607078', domainLabel: 'Virtualización' },
  cloud:     { icon: '🌩️', label: 'Nube Propia',    brand: 'CoreSolutions Cloud',        color: '#009d9a', domainLabel: 'Nube' },
  usuarios:  { icon: '👥', label: 'Usuarios',        brand: '',                           color: '#8d8d8d', domainLabel: '' },
  custom:    { icon: '📦', label: 'Equipo',          brand: '',                           color: '#525252', domainLabel: '' },
}

export { NODE_TYPES }

export const MODEL_OPTIONS = {
  servidor: ['SR630 V4', 'SR650 V4', 'SR665 V3', 'SR635 V3', 'SR675i', 'SR650i', 'SR680a V4', 'ThinkEdge SE455i'],
  power:    ['S1012', 'S1014', 'S1022', 'S1024', 'E1050', 'E1080'],
  storage:  ['FlashSystem 5600', 'FlashSystem 7600', 'FlashSystem 9600', 'Synology RS6426xs+', 'Synology RS4826xs+', 'Synology RS3626xs', 'Synology RS1626xs+', 'Synology DS1825+', 'Synology DS1525+', 'Synology DS925+', 'Synology DS725+', 'Synology FS200T'],
  tape:     ['TS4300', 'TS4500'],
  switch: [
    // CX 6000 — edge/SMB access
    'CX 6000-12G', 'CX 6000-24G', 'CX 6000-48G',
    // CX 6100 — SMB access PoE
    'CX 6100-12G', 'CX 6100-12G PoE+', 'CX 6100-24G', 'CX 6100-24G PoE+', 'CX 6100-48G PoE+',
    // CX 6200 — enterprise access
    'CX 6200F-24G', 'CX 6200F-24G PoE+', 'CX 6200F-48G PoE+', 'CX 6200M-24G PoE++', 'CX 6200M-48G PoE++',
    // CX 6300 — enterprise distribution
    'CX 6300F-24', 'CX 6300F-48', 'CX 6300M-24 PoE++', 'CX 6300M-48 PoE++',
    // CX 6400 — core
    'CX 6400',
    // CX 8100/8325/8360 — aggregation/core
    'CX 8100', 'CX 8325', 'CX 8360',
    // CX 9300/10000 — hyperscale core
    'CX 9300', 'CX 10000',
    // CX 4100i — industrial
    'CX 4100i',
  ],
  ap: [
    // Indoor WiFi 6
    'AP-515', 'AP-535', 'AP-555',
    // Indoor WiFi 6E
    'AP-615', 'AP-635', 'AP-655',
    // Specialty indoor
    'AP-503H',
    // Outdoor WiFi 6
    'AP-584',
    // Outdoor WiFi 6E
    'AP-634', 'AP-654',
  ],
  firewall: ['Quantum 3600', 'Quantum 3800', 'Quantum 6000', 'Quantum 26000', 'Quantum 28000', 'Quantum Force', 'Quantum Lightspeed'],
}

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
      domainLabel: base.domainLabel || '',
      note: '',
      status: 'existing',
      auto: true,
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
  nodes.push(node('internet', 'internet', { x: 340, y: 0 }))

  // Cloud — right column when nube domain active
  if (has('nube')) {
    nodes.push(node('cloud', 'cloud', { x: 600, y: 0 }))
    edges.push(edge('e-int-cloud', 'internet', 'cloud'))
  }

  // Firewall
  if (has('seguridad')) {
    const fw = ans('seguridad')
    nodes.push(node('firewall', 'firewall', { x: 340, y: 130 }, {
      label: fw.firewallBrand ? `Firewall · ${fw.firewallBrand}` : 'Firewall',
    }))
    edges.push(edge('e-int-fw', 'internet', 'firewall'))
    if (has('nube')) edges.push(edge('e-fw-cloud', 'firewall', 'cloud'))
  }

  // Switching / redes
  const netParent = has('seguridad') ? 'firewall' : 'internet'
  let lastSwitchId = null
  if (has('redes')) {
    const r = ans('redes')
    const swCount = Math.min(Math.max(parseInt(r.switchCount) || 1, 1), 6)
    if (swCount === 1) {
      nodes.push(node('switch', 'switch', { x: 340, y: 260 }))
      edges.push(edge('e-net-sw', netParent, 'switch'))
      lastSwitchId = 'switch'
    } else {
      // Multiple switches: lay them out horizontally, chain uplinks
      const swSpread = 160
      const swStartX = 340 - ((swCount - 1) * swSpread) / 2
      for (let i = 0; i < swCount; i++) {
        const id = `switch-${i + 1}`
        nodes.push(node(id, 'switch', { x: swStartX + i * swSpread, y: 260 }, { label: `Switch ${i + 1}` }))
        // First switch uplinks to network parent; others uplink to first switch (stack/cascade)
        edges.push(edge(`e-net-sw-${i}`, i === 0 ? netParent : 'switch-1', id))
      }
      lastSwitchId = 'switch-1'
    }

    if (r.hasWifi === 'Sí') {
      const apCount = Math.min(Math.max(parseInt(r.apCount) || 1, 1), 4)
      const apSpread = 130
      const apStartX = 340 - ((apCount - 1) * apSpread) / 2
      for (let i = 0; i < apCount; i++) {
        const apId = apCount === 1 ? 'ap' : `ap-${i + 1}`
        const apLabel = apCount === 1 ? 'WiFi / APs' : `AP ${i + 1}`
        nodes.push(node(apId, 'ap', { x: apStartX + i * apSpread, y: 380 }, { label: apLabel }))
        edges.push(edge(`e-sw-ap-${i}`, lastSwitchId, apId))
      }
    }
  }

  // Core parent for servers/storage/backup/vm
  const coreParent = lastSwitchId || netParent

  // Build core node descriptors — multiple servers/VMs expand to individual nodes
  const coreDescriptors = [] // { id, type, overrides }

  if (has('servidores')) {
    const s = ans('servidores')
    const count = Math.min(Math.max(parseInt(s.serverCount) || 1, 1), 8)
    for (let i = 0; i < count; i++) {
      const id = count === 1 ? 'servidor' : `servidor-${i + 1}`
      const label = count === 1 ? 'Servidor x86' : `Servidor ${i + 1}`
      coreDescriptors.push({ id, type: 'servidor', overrides: { label } })
    }
    if (s.serverOS?.includes?.('AIX (IBM)')) {
      coreDescriptors.push({ id: 'power', type: 'power', overrides: {} })
    }
  }
  if (has('storage')) {
    const s = ans('storage')
    const overrides = s.storageCapacity ? { label: `Storage · ${s.storageCapacity}` } : {}
    coreDescriptors.push({ id: 'storage', type: 'storage', overrides })
    if (ans('backup').backupLocation?.includes?.('Disco externo / cinta')) {
      coreDescriptors.push({ id: 'tape', type: 'tape', overrides: {} })
    }
  }
  if (has('backup')) {
    const b = ans('backup')
    const overrides = b.backupFrequency ? { label: `Backup · ${b.backupFrequency}` } : {}
    coreDescriptors.push({ id: 'backup', type: 'backup', overrides })
  }
  if (has('virtualizacion')) {
    const v = ans('virtualizacion')
    const hostCount = Math.min(Math.max(parseInt(v.hostCount) || 1, 1), 6)
    for (let i = 0; i < hostCount; i++) {
      const id = hostCount === 1 ? 'vm' : `vm-${i + 1}`
      const label = hostCount === 1 ? 'Virtualización' : `vSphere Host ${i + 1}`
      coreDescriptors.push({ id, type: 'vm', overrides: { label } })
    }
  }

  const coreY  = has('redes') && ans('redes').hasWifi === 'Sí' ? 510 : 410
  const spread = 160
  const totalW = (coreDescriptors.length - 1) * spread
  const startX = 340 - totalW / 2

  coreDescriptors.forEach(({ id, type, overrides }, i) => {
    const pos = { x: startX + i * spread, y: coreY }
    nodes.push(node(id, type, pos, overrides))
    edges.push(edge(`e-core-${id}`, coreParent, id))
  })

  // Users — always at bottom
  const usersY = coreDescriptors.length > 0 ? coreY + 120 : coreY
  nodes.push(node('usuarios', 'usuarios', { x: 340, y: usersY }))
  edges.push(edge('e-core-usr', coreParent, 'usuarios'))

  return { nodes, edges }
}

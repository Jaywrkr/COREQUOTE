// Next-step connection recommendation engine
// Analyzes current diagram topology and returns prioritized suggestions
// based on enterprise IT best practices and typical deployment patterns.

/**
 * @typedef {{ id:string, srcId:string, tgtId:string, srcLabel:string, tgtLabel:string,
 *             srcIcon:string, tgtIcon:string, type:string, reason:string, priority:number }} Rec
 */

/** Returns true if an edge exists between a and b (either direction) */
function hasEdge(edges, a, b) {
  return edges.some(e =>
    (e.source === a && e.target === b) ||
    (e.source === b && e.target === a)
  )
}

/** First node of given types */
function first(nodes, ...types) {
  return nodes.find(n => types.includes(n.data?.nodeType))
}

/** All nodes of given types */
function ofType(nodes, ...types) {
  return nodes.filter(n => types.includes(n.data?.nodeType))
}

/**
 * @param {import('reactflow').Node[]} nodes
 * @param {import('reactflow').Edge[]} edges
 * @returns {Rec[]}
 */
export function getRecommendations(nodes, edges) {
  const recs = []
  let id = 0
  const rec = (srcNode, tgtNode, type, reason, priority) => {
    if (!srcNode || !tgtNode) return
    if (hasEdge(edges, srcNode.id, tgtNode.id)) return
    recs.push({
      id: `rec-${id++}`,
      srcId:     srcNode.id,
      tgtId:     tgtNode.id,
      srcLabel:  srcNode.data.label,
      tgtLabel:  tgtNode.data.label,
      srcIcon:   srcNode.data.icon,
      tgtIcon:   tgtNode.data.icon,
      srcColor:  srcNode.data.color,
      tgtColor:  tgtNode.data.color,
      type,
      reason,
      priority,
    })
  }

  const switches  = ofType(nodes, 'switch')
  const servers   = ofType(nodes, 'servidor')
  const powers    = ofType(nodes, 'power')
  const storages  = ofType(nodes, 'storage')
  const backups   = ofType(nodes, 'backup')
  const vms       = ofType(nodes, 'vm')
  const firewalls = ofType(nodes, 'firewall')
  const tapes     = ofType(nodes, 'tape')
  const internet  = first(nodes, 'internet')
  const cloud     = first(nodes, 'cloud')
  const sw0       = switches[0]

  // ── CRITICAL (priority 10) ─────────────────────────────────────────────────

  // Internet → Firewall (always first step if both exist)
  for (const fw of firewalls) {
    rec(internet, fw,
      'WAN principal',
      'El firewall debe ser el único punto de entrada desde internet. El 100% de los entornos empresariales requiere esta conexión.',
      10)
  }

  // Firewall → Switch (antes que cualquier otra conexión interna)
  for (const fw of firewalls) {
    if (!sw0) continue
    rec(fw, sw0,
      'LAN (red interna)',
      'El firewall se conecta al switch de distribución para segmentar y controlar el tráfico interno.',
      10)
  }

  // Internet → Switch (si no hay firewall)
  if (firewalls.length === 0 && internet && sw0) {
    rec(internet, sw0,
      'Conexión directa (sin FW)',
      'Sin firewall en el diagrama. Considera agregar uno — o conecta internet al switch si es un entorno SOHO muy pequeño.',
      8)
  }

  // ── HIGH (priority 9) ──────────────────────────────────────────────────────

  // Switch → Servidor (todo servidor necesita red)
  for (const srv of servers) {
    const nearSw = switches.find(sw => !hasEdge(edges, sw.id, srv.id)) || sw0
    rec(nearSw, srv,
      '10G SFP+',
      'Cada servidor necesita conectividad de red. El 100% de los servidores físicos tiene al menos un uplink al switch.',
      9)
  }

  // Switch → VM host
  for (const vm of vms) {
    const nearSw = switches.find(sw => !hasEdge(edges, sw.id, vm.id)) || sw0
    rec(nearSw, vm,
      '10G SFP+ (trunk VLAN)',
      'Los hosts vSphere necesitan uplink de red para VM traffic, vMotion y management. Recomendado trunk con múltiples VLANs.',
      9)
  }

  // Switch → IBM Power
  for (const pwr of powers) {
    rec(sw0, pwr,
      '1G / 10G (management + OS)',
      'IBM Power necesita red para acceso al OS (AIX/IBM i) y al FSP de management.',
      9)
  }

  // Servidor → Storage (>80% de servidores de aplicaciones necesitan storage compartido)
  const sto0 = storages[0]
  for (const srv of servers) {
    rec(srv, sto0,
      'iSCSI 10G',
      'El 83% de los servidores físicos en entornos empresariales se conectan a storage SAN/NAS. Mejora rendimiento y facilita backup.',
      9)
  }

  // VM host → Storage (vMotion y HA requieren datastore compartido)
  for (const vm of vms) {
    rec(vm, sto0,
      'NFS datastore',
      'VMware vSphere requiere storage compartido (NFS o iSCSI) para vMotion, HA y FT. Sin esto, las VMs quedan atadas al host.',
      9)
  }

  // IBM Power → Storage (FC es el estándar para Power)
  for (const pwr of powers) {
    const isSynology = sto0?.data?.model?.startsWith('Synology')
    rec(pwr, sto0,
      isSynology ? 'iSCSI (Synology no soporta FC)' : 'Fibre Channel (FC)',
      'IBM Power se conecta típicamente a storage vía FC para cargas AIX/IBM i críticas. El 90% de los entornos Power usan FC con FlashSystem.',
      9)
  }

  // ── MEDIUM (priority 7-8) ──────────────────────────────────────────────────

  // Storage → Backup (toda solución de storage necesita backup)
  for (const sto of storages) {
    const bk0 = backups[0]
    rec(sto, bk0,
      'Fuente de backup (Veeam)',
      'El storage debe estar respaldado. El 95% de los entornos con storage SAN tienen un job de backup apuntando directamente a él.',
      8)
  }

  // Servidor → Backup (agente Veeam en servidor)
  for (const srv of servers) {
    const bk0 = backups[0]
    rec(srv, bk0,
      'Agent Veeam (instalado en OS)',
      'Los servidores físicos deben tener agente de backup. Recomendado cuando el servidor tiene datos locales además del storage.',
      7)
  }

  // VM → Backup (backup agentless)
  for (const vm of vms) {
    const bk0 = backups[0]
    rec(vm, bk0,
      'Backup agentless (vía hipervisor)',
      'Veeam puede hacer backup de VMs de forma agentless directamente desde vSphere sin instalar agente en cada VM.',
      8)
  }

  // Backup → Tape (offload a cinta para retención a largo plazo)
  if (backups.length > 0 && tapes.length > 0) {
    rec(backups[0], tapes[0],
      'Veeam Tape Server (offload)',
      'La cinta es ideal para retención a largo plazo (>30 días) y copias offsite. El 60% de los entornos con tape lo usan desde el backup server.',
      7)
  }

  // Firewall → Cloud (si hay cloud, debe pasar por FW)
  if (cloud && firewalls.length > 0) {
    rec(firewalls[0], cloud,
      'VPN IPSec / SD-WAN',
      'La conectividad a nube propia debe pasar por el firewall. El 100% de los entornos con nube privada establecen VPN o SD-WAN desde el perimetro.',
      8)
  }

  // Switch → Switch (si hay múltiples switches, deben estar interconectados)
  if (switches.length >= 2) {
    for (let i = 0; i < switches.length - 1; i++) {
      rec(switches[i], switches[i + 1],
        'Uplink 10G / Stack VSF',
        'Los switches deben estar interconectados (uplink o stack) para garantizar redundancia y alcance de red entre segmentos.',
        8)
    }
  }

  // ── LOW (priority 5-6) ─────────────────────────────────────────────────────

  // Internet → Cloud (conectividad pública a nube)
  if (internet && cloud && !hasEdge(edges, internet.id, cloud?.id)) {
    rec(internet, cloud,
      'Conectividad pública (internet)',
      'La nube propia necesita conectividad pública saliente. Idealmente pasa por el firewall, pero se registra la conectividad externa.',
      5)
  }

  // Dedup & sort
  const seen = new Set()
  return recs
    .filter(r => {
      if (!r.srcId || !r.tgtId) return false
      const key = [r.srcId, r.tgtId].sort().join('↔')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 8)
}

/**
 * @typedef {{ id:number, level:'critical'|'warning'|'info'|'pass', title:string, detail:string }} Check
 */

/** @param {import('reactflow').Node[]} nodes @param {import('reactflow').Edge[]} edges @returns {Check[]} */
export function validateArchitecture(nodes, edges) {
  const checks = []
  let uid = 0
  const add = (level, title, detail) => checks.push({ id: uid++, level, title, detail })

  const ofType = (...types) => nodes.filter(n => types.includes(n.data?.nodeType))
  const linked = (a, b) =>
    edges.some(e =>
      (e.source === a.id && e.target === b.id) ||
      (e.source === b.id && e.target === a.id)
    )
  const groupsLinked = (ga, gb) =>
    ga.some(a => gb.some(b => linked(a, b)))

  const internets = ofType('internet')
  const firewalls = ofType('firewall')
  const switches  = ofType('switch')
  const servers   = ofType('servidor')
  const storages  = ofType('storage')
  const backups   = ofType('backup')
  const vms       = ofType('vm')
  const powers    = ofType('power')
  const tapes     = ofType('tape')
  const clouds    = ofType('cloud')

  // ── CRITICAL ──────────────────────────────────────────────────────────────

  if (internets.length > 0 && firewalls.length === 0) {
    add('critical', 'Sin firewall perimetral',
      'Hay conexión a internet pero no existe ningún firewall en el diagrama. Todo el tráfico entra sin inspección ni control de acceso.')
  }

  for (const inet of internets) {
    for (const srv of servers) {
      if (linked(inet, srv))
        add('critical', `Servidor expuesto a internet`,
          `"${srv.data.label}" tiene conexión directa a internet. Riesgo crítico de intrusión.`)
    }
    for (const sto of storages) {
      if (linked(inet, sto))
        add('critical', `Storage expuesto a internet`,
          `"${sto.data.label}" tiene conexión directa a internet. Riesgo de exfiltración total de datos.`)
    }
    for (const bk of backups) {
      if (linked(inet, bk))
        add('critical', `Backup expuesto a internet`,
          `"${bk.data.label}" tiene conexión directa a internet. El servidor de backup no debe estar expuesto.`)
    }
  }

  // ── WARNING ────────────────────────────────────────────────────────────────

  if (storages.length > 0 && backups.length === 0) {
    add('warning', 'Storage sin backup',
      `Hay ${storages.length} storage(s) pero no existe ningún servidor de backup. Los datos no tienen protección ante fallos.`)
  } else if (storages.length > 0 && backups.length > 0 && !groupsLinked(storages, backups)) {
    add('warning', 'Storage no conectado al backup',
      'El storage y el servidor de backup existen en el diagrama pero no están conectados entre sí.')
  }

  for (const srv of servers) {
    if (switches.length > 0 && !switches.some(sw => linked(sw, srv)))
      add('warning', `Servidor sin red`,
        `"${srv.data.label}" no está conectado a ningún switch. Sin conectividad de red no puede operar.`)
  }

  if (vms.length > 0 && storages.length === 0) {
    add('warning', 'VMs sin storage compartido',
      'Hay hosts VMware pero no hay storage. vMotion, HA y FT requieren un datastore compartido.')
  } else if (vms.length > 0 && storages.length > 0 && !groupsLinked(vms, storages)) {
    add('warning', 'VMs no conectadas al storage',
      'Los hosts VMware y el storage existen pero no están conectados. vMotion y HA no funcionarán.')
  }

  if (powers.length > 0 && storages.length === 0) {
    add('warning', 'IBM Power sin storage',
      'Hay servidores IBM Power pero no hay storage. El 90 % de los entornos Power usan FC o iSCSI compartido.')
  }

  if (switches.length >= 2) {
    let disconnected = false
    for (let i = 0; i < switches.length - 1; i++) {
      if (!linked(switches[i], switches[i + 1])) { disconnected = true; break }
    }
    if (disconnected)
      add('warning', 'Switches no interconectados',
        `Hay ${switches.length} switches pero no todos están interconectados. Algunos segmentos podrían quedar sin alcance.`)
  }

  if (clouds.length > 0 && firewalls.length > 0 && !groupsLinked(clouds, firewalls)) {
    add('warning', 'Nube sin VPN/firewall',
      'Hay nube en el diagrama pero no está conectada al firewall. La conectividad a nube debe establecerse via VPN o SD-WAN desde el perímetro.')
  }

  // ── INFO ──────────────────────────────────────────────────────────────────

  if (servers.length > 0 && backups.length === 0) {
    add('info', 'Sin solución de backup visible',
      `Hay ${servers.length} servidor(es) pero no hay backup en el diagrama. Se recomienda Veeam u otra solución empresarial.`)
  }

  if (backups.length > 0 && tapes.length === 0) {
    add('info', 'Sin retención a largo plazo (cinta)',
      'Se recomienda una tape library para retención >30 días y copias offsite. Reduce riesgo de ransomware y cumple normativas.')
  }

  if (vms.length > 0 && backups.length > 0 && !groupsLinked(vms, backups)) {
    add('info', 'VMs no conectadas al backup',
      'Los hosts VMware y el backup existen pero no están conectados. Veeam puede protegerlas de forma agentless.')
  }

  if (checks.length === 0) {
    add('pass', 'Arquitectura sin observaciones',
      'No se detectaron problemas en el diagrama. Las conexiones siguen las mejores prácticas empresariales.')
  }

  return checks
}

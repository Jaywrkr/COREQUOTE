export function generateZoneDiagram(assessment) {
  const { domains, answers, client } = assessment
  const zones = []

  zones.push({
    id: 'internet',
    label: 'Internet',
    icon: '🌍',
    color: '#64748B',
    colorLight: '#F1F5F9',
    items: [`${answers.redes?.ispCount || '1'} ISP`],
    layer: 0,
  })

  if (domains.includes('seguridad')) {
    zones.push({
      id: 'seguridad',
      label: 'Seguridad Perimetral',
      icon: '🔒',
      color: '#E50000',
      colorLight: '#FFE5E5',
      brand: 'Check Point',
      items: [
        'Firewall NGFW',
        answers.seguridad?.hasSecureVpn === 'Sí' ? 'VPN / ZTNA' : null,
        answers.seguridad?.hasMfa !== 'No' ? 'MFA' : null,
      ].filter(Boolean),
      layer: 1,
    })
  }

  if (domains.includes('redes')) {
    zones.push({
      id: 'redes',
      label: 'Red Interna',
      icon: '🌐',
      color: '#FF8300',
      colorLight: '#FFF3E5',
      brand: 'Aruba',
      items: [
        answers.redes?.switchCount ? `${answers.redes.switchCount} switches` : 'Switching',
        answers.redes?.hasWifi === 'Sí'
          ? `WiFi (${answers.redes?.apCount || 'N'} APs)`
          : null,
        answers.redes?.hasVlans === 'Sí' ? 'VLANs' : null,
      ].filter(Boolean),
      layer: 2,
    })
  }

  const coreZones = []

  if (domains.includes('servidores')) {
    coreZones.push({
      id: 'servidores',
      label: 'Servidores',
      icon: '🖥️',
      color: '#0052CC',
      colorLight: '#E6F0FF',
      brand: 'IBM Power / Lenovo',
      items: [
        answers.servidores?.serverCount ? `${answers.servidores.serverCount} servidores físicos` : 'Servidores físicos',
        answers.servidores?.criticalWorkloads ? answers.servidores.criticalWorkloads.slice(0, 40) : null,
      ].filter(Boolean),
      layer: 3,
    })
  }

  if (domains.includes('virtualizacion')) {
    coreZones.push({
      id: 'virtualizacion',
      label: 'Virtualización',
      icon: '⚡',
      color: '#607078',
      colorLight: '#F0F2F3',
      brand: 'VMware',
      items: [
        answers.virtualizacion?.hostCount ? `${answers.virtualizacion.hostCount} hosts` : 'Hosts ESXi',
        answers.virtualizacion?.vmCount ? `${answers.virtualizacion.vmCount} VMs` : null,
        answers.virtualizacion?.hasVcenter === 'Sí' ? 'vCenter' : null,
      ].filter(Boolean),
      layer: 3,
    })
  }

  if (domains.includes('storage')) {
    coreZones.push({
      id: 'storage',
      label: 'Almacenamiento',
      icon: '💾',
      color: '#6366F1',
      colorLight: '#EEF2FF',
      brand: 'IBM Storage / Synology',
      items: [
        answers.storage?.storageCapacity || 'NAS / SAN',
        answers.storage?.storageType?.join(', ') || null,
      ].filter(Boolean),
      layer: 3,
    })
  }

  if (domains.includes('backup')) {
    coreZones.push({
      id: 'backup',
      label: 'Backup & DR',
      icon: '☁️',
      color: '#00B140',
      colorLight: '#E6F9ED',
      brand: 'Veeam',
      items: [
        answers.backup?.backupFrequency || 'Respaldo automático',
        answers.backup?.rto ? `RTO: ${answers.backup.rto}` : null,
      ].filter(Boolean),
      layer: 3,
    })
  }

  return { zones, coreZones }
}

export function generateMermaidDiagram(assessment) {
  const { domains, answers } = assessment
  const lines = ['graph TD']
  lines.push('  Internet((🌍 Internet))')

  if (domains.includes('seguridad')) {
    lines.push('  FW[🔒 Check Point Firewall]')
    lines.push('  Internet --> FW')
  }

  if (domains.includes('redes')) {
    const swCount = answers.redes?.switchCount || 'N'
    lines.push(`  SW[🌐 Aruba Switching\\n${swCount} switches]`)
    if (domains.includes('seguridad')) {
      lines.push('  FW --> SW')
    } else {
      lines.push('  Internet --> SW')
    }
    if (answers.redes?.hasWifi === 'Sí') {
      const apCount = answers.redes?.apCount || 'N'
      lines.push(`  AP[📶 Aruba WiFi\\n${apCount} APs]`)
      lines.push('  SW --> AP')
    }
  }

  const coreNode = domains.includes('redes') ? 'SW' : domains.includes('seguridad') ? 'FW' : 'Internet'

  if (domains.includes('servidores')) {
    const cnt = answers.servidores?.serverCount || 'N'
    lines.push(`  SRV[🖥️ Servidores\\nIBM Power / Lenovo\\n${cnt} físicos]`)
    lines.push(`  ${coreNode} --> SRV`)
  }

  if (domains.includes('virtualizacion')) {
    const hosts = answers.virtualizacion?.hostCount || 'N'
    const vms = answers.virtualizacion?.vmCount || 'N'
    lines.push(`  VM[⚡ VMware vSphere\\n${hosts} hosts / ${vms} VMs]`)
    const parent = domains.includes('servidores') ? 'SRV' : coreNode
    lines.push(`  ${parent} --> VM`)
  }

  if (domains.includes('storage')) {
    const cap = answers.storage?.storageCapacity || ''
    lines.push(`  STG[💾 Storage\\nIBM / Synology\\n${cap}]`)
    const parent = domains.includes('servidores') ? 'SRV' : coreNode
    lines.push(`  ${parent} --> STG`)
  }

  if (domains.includes('backup')) {
    const freq = answers.backup?.backupFrequency || ''
    lines.push(`  BCK[☁️ Veeam Backup\\n${freq}]`)
    const parent = domains.includes('servidores') ? 'SRV' : domains.includes('storage') ? 'STG' : coreNode
    lines.push(`  ${parent} --> BCK`)
  }

  lines.push('  USR[👥 Usuarios]')
  lines.push(`  ${coreNode} --> USR`)

  return lines.join('\n')
}

const DOMAIN_LABELS = {
  redes:         'Redes (Aruba)',
  seguridad:     'Seguridad (Check Point)',
  servidores:    'Servidores (IBM Power / Lenovo)',
  storage:       'Almacenamiento (IBM Storage / Synology)',
  backup:        'Backup & DR (Veeam)',
  virtualizacion:'Virtualización (VMware)',
}

const DOMAIN_TOTAL_Q = { redes: 12, seguridad: 9, servidores: 7, storage: 5, backup: 8, virtualizacion: 6 }

function domainReadinessText(d, domAnswers) {
  const filled = Object.keys(domAnswers || {}).filter(k =>
    k !== '_restricciones' &&
    domAnswers[k] !== '' && domAnswers[k] !== null && domAnswers[k] !== undefined &&
    !(Array.isArray(domAnswers[k]) && domAnswers[k].length === 0)
  ).length
  const total = DOMAIN_TOTAL_Q[d] || 8
  const pct = filled / total
  if (pct === 0)   return '🔴 Sin datos'
  if (pct < 0.6)   return '🟡 Info parcial'
  return '🟢 Listo para cotizar'
}

export function generateReport(assessment, type) {
  const { client, site, domains, answers } = assessment
  const sections = []

  // ── Client info ──────────────────────────────────────────────────────
  const clientItems = [`Empresa: ${client.company || '—'}`]
  if (client.industry)      clientItems.push(`Industria: ${client.industry}`)
  if (client.userCount)     clientItems.push(`Usuarios: ${client.userCount}`)
  if (client.locationCount) clientItems.push(`Ubicaciones: ${client.locationCount}`)
  if (client.contactName)   clientItems.push(`Contacto: ${client.contactName}${client.contactRole ? ` (${client.contactRole})` : ''}`)
  sections.push({ title: 'Datos del cliente', items: clientItems })

  // ── Readiness summary (interno + tecnico) ────────────────────────────
  if (type !== 'gerencial') {
    const readinessItems = domains.map(d => {
      const domAnswers = answers[d] || {}
      const status = domainReadinessText(d, domAnswers)
      const restr = domAnswers._restricciones?.trim()
      return `${DOMAIN_LABELS[d]}: ${status}${restr ? ` · ⚠ ${restr.slice(0, 70)}${restr.length > 70 ? '...' : ''}` : ''}`
    })
    sections.push({ title: 'Estado del assessment', items: readinessItems })
  }

  // ── Site (interno only) ───────────────────────────────────────────────
  if (type === 'interno' && site) {
    const checks = site.checks || {}
    const fields = site.fields || {}
    const inv    = site.inventario || []
    const siteItems = []

    if (checks.rack_disponible) siteItems.push(`Rack: Sí${fields.rack_u_libres ? ` · ${fields.rack_u_libres}U libres` : ''}`)
    if (!checks.rack_disponible && Object.keys(checks).length > 0) siteItems.push('Rack: No disponible')
    if (checks.ups)     siteItems.push(`UPS: Sí${fields.ups_kva ? ` (${fields.ups_kva})` : ''}`)
    if (checks.ac_dedicado) siteItems.push('A/C dedicado: Sí')
    if (checks.cableado_cat6) siteItems.push(`Cableado Cat 6+: Sí${fields.puntos_red ? ` · ${fields.puntos_red} puntos` : ''}`)
    if (checks.planta_electrica) siteItems.push('Planta eléctrica: Sí')
    if (fields.isp_nombre) siteItems.push(`ISP: ${fields.isp_nombre}${fields.ancho_banda ? ` · ${fields.ancho_banda}` : ''}`)
    if (fields.contrato_vence) siteItems.push(`Vencimiento contrato ISP: ${fields.contrato_vence}`)

    if (siteItems.length > 0) sections.push({ title: 'Condiciones del site', items: siteItems })

    const invItems = inv.filter(r => r.tipo).map(r =>
      [r.tipo, r.marca, r.modelo, r.edad ? `${r.edad} años` : '', r.estado].filter(Boolean).join(' · ')
    )
    if (invItems.length > 0) sections.push({ title: 'Inventario existente', items: invItems })
  }

  // ── Restrictions (interno + tecnico) ─────────────────────────────────
  if (type !== 'gerencial') {
    const restrictItems = domains
      .map(d => ({ d, r: answers[d]?._restricciones?.trim() }))
      .filter(x => x.r)
      .map(x => `${DOMAIN_LABELS[x.d]}: ${x.r}`)
    if (restrictItems.length > 0) sections.push({ title: '⚠ Restricciones y dependencias', items: restrictItems })
  }

  // ── Domain detail ─────────────────────────────────────────────────────
  if (type === 'interno') {
    domains.forEach(d => {
      const q = answers[d]
      if (!q) return
      const items = Object.entries(q)
        .filter(([k, v]) => k !== '_restricciones' && v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      if (items.length > 0) sections.push({ title: DOMAIN_LABELS[d] || d, items })
    })
  } else if (type === 'tecnico') {
    sections.push({ title: 'Alcance del proyecto', items: domains.map(d => DOMAIN_LABELS[d] || d) })
    domains.forEach(d => {
      const q = answers[d]
      if (!q) return
      const goalKey = Object.keys(q).find(k => /goal/i.test(k))
      if (goalKey && q[goalKey]) {
        const goals = Array.isArray(q[goalKey]) ? q[goalKey] : [q[goalKey]]
        sections.push({ title: `Objetivos — ${DOMAIN_LABELS[d]}`, items: goals })
      }
    })
  } else {
    const gerencialLabels = {
      redes: 'Conectividad y red interna', seguridad: 'Ciberseguridad y protección',
      servidores: 'Infraestructura de servidores', storage: 'Almacenamiento de datos',
      backup: 'Respaldo y continuidad del negocio', virtualizacion: 'Virtualización y eficiencia de recursos',
    }
    sections.push({ title: 'Áreas de mejora identificadas', items: domains.map(d => gerencialLabels[d] || d) })
    sections.push({
      title: 'Próximos pasos',
      items: [
        'CoreSolutions preparará una propuesta técnica personalizada',
        'Presentación de soluciones en máximo 5 días hábiles',
        'Evaluación sin costo adicional',
      ],
    })
  }

  return sections
}

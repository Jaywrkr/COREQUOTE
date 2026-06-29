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
  EdgeLabelRenderer,
  BaseEdge,
  getStraightPath,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { generateRFDiagram, NODE_TYPES, MODEL_OPTIONS } from '../../utils/rfDiagramGenerator'

// ─── Connection rules ─────────────────────────────────────────────────────────
// Based on real enterprise network architecture best practices.
// blocked: true  → connection is architecturally invalid, cannot be drawn
// warn: string   → connection is technically possible but risky/unusual
// options: []    → valid connection types for that pair
const CONN_RULES = {

  // ── INTERNET ──────────────────────────────────────────────────────────────
  // Internet only enters through a firewall or (in small offices) a switch.
  // Nothing on the internal network should connect back to internet directly.
  'internet→firewall':  { options: ['WAN principal', 'WAN secundario (failover)', 'Internet dedicado'] },
  'internet→switch':    { options: ['Conexión directa (sin FW)'], warn: 'Sin firewall perimetral. Aceptable solo en SOHO (<10 usuarios). No recomendado en entornos empresariales.' },
  'internet→ap':        { options: ['ISP directo a AP'], warn: 'Solo válido en entornos SOHO muy pequeños. En empresas, el AP debe estar detrás del firewall.' },
  'internet→servidor':  { blocked: true, reason: 'Los servidores nunca deben exponerse directamente a internet sin un firewall perimetral. Riesgo crítico de intrusión y ransomware.' },
  'internet→storage':   { blocked: true, reason: 'El storage (IBM, Synology, etc.) JAMÁS debe tener conexión directa a internet. Riesgo de exposición total de datos y ransomware.' },
  'internet→backup':    { blocked: true, reason: 'El servidor de backup no debe estar expuesto a internet. El backup en nube debe salir a través del firewall.' },
  'internet→vm':        { blocked: true, reason: 'Los hosts de virtualización no deben conectarse directamente a internet.' },
  'internet→usuarios':  { blocked: true, reason: 'Los dispositivos de usuario se conectan a internet a través de la red interna y el firewall, no directamente.' },

  // ── FIREWALL ──────────────────────────────────────────────────────────────
  // Firewall connects to switches for LAN/DMZ segments, or directly to servers in DMZ.
  'firewall→switch':    { options: ['LAN (red interna)', 'DMZ', 'VLAN trunk', 'Management OOB'] },
  'firewall→servidor':  { options: ['DMZ directa', 'Segmento interno protegido'] },
  'firewall→backup':    { options: ['Segmento backup'] },
  'firewall→storage':   { options: ['Segmento storage'], warn: 'El storage raramente se conecta directamente al firewall. Considera un switch de storage dedicado entre ambos.' },
  'firewall→firewall':  { options: ['HA activo/pasivo', 'Cluster HA', 'Sync de estado'] },
  'firewall→internet':  { options: ['Salida WAN (outbound)'] },
  'firewall→usuarios':  { blocked: true, reason: 'Los usuarios no se conectan directamente al firewall. Deben pasar por un switch.' },
  'firewall→ap':        { blocked: true, reason: 'Los APs no se conectan directamente al firewall. Deben conectarse al switch, que a su vez conecta al firewall.' },
  'firewall→vm':        { blocked: true, reason: 'Los hosts de virtualización no se conectan directamente al firewall.' },

  // ── SWITCH ────────────────────────────────────────────────────────────────
  // Switch (Aruba, Cisco, etc.) is the central connector for LAN.
  // CAN connect to storage via iSCSI/NFS over Ethernet — this is standard SAN over IP.
  'switch→switch':      { options: ['Uplink 1G', 'Uplink 10G', 'Stack (Aruba VSF/IRF)', 'Fibra óptica', 'MLAG / LAG'] },
  'switch→firewall':    { options: ['Uplink a FW', 'Trunk de VLANs'] },
  'switch→ap':          { options: ['PoE (802.3af — 15.4W)', 'PoE+ (802.3at — 30W)', 'PoE++ (802.3bt — 60W)', 'Uplink fibra (AP outdoor)'] },
  'switch→servidor':    { options: ['1G copper', '10G SFP+', '25G SFP28', 'Bonding / LAG (LACP)'] },
  'switch→storage':     { options: ['iSCSI 1G', 'iSCSI 10G (dedicado)', 'NFS over Ethernet', 'SMB/CIFS', 'Management 1G'] },
  'switch→vm':          { options: ['1G (acceso)', '10G SFP+ (trunk)', '25G SFP28', 'Bonding / LAG (LACP)', 'VLAN trunk (vSwitch/vDS)'] },
  'switch→backup':      { options: ['LAN backup 1G', '10G dedicado backup', 'Segmento backup VLAN'] },
  'switch→usuarios':    { options: ['Access port 1G', 'VLAN de usuarios', '2.5G (usuarios avanzados)'] },
  'switch→custom':      { options: ['1G copper', '10G SFP+', 'Fibra'] },
  'switch→internet':    { blocked: true, reason: 'Un switch de LAN no se conecta directamente a internet. El tráfico de salida pasa por el firewall o router perimetral.' },

  // ── SERVIDOR ──────────────────────────────────────────────────────────────
  'servidor→switch':    { options: ['1G', '10G', 'Bonding / LAG'] },
  'servidor→storage':   { options: ['iSCSI (sobre IP)', 'Fibre Channel (FC — HBA requerido)', 'NFS (protocolo de archivos)', 'SMB/CIFS', 'SAS directo (DAS — sin switch)'] },
  'servidor→servidor':  { options: ['Cluster / heartbeat', 'Replicación de datos', 'HA link', 'Crossover directo'] },
  'servidor→vm':        { options: ['Hipervisor — el servidor ES el host'] },
  'servidor→backup':    { options: ['Agent Veeam (instalado en SO)', 'Agentless (vía hipervisor)'] },
  'servidor→firewall':  { options: ['Uplink — segmento DMZ'] },
  'servidor→internet':  { blocked: true, reason: 'Los servidores no deben conectarse directamente a internet. El tráfico de salida (actualizaciones, etc.) pasa por el firewall.' },
  'servidor→usuarios':  { blocked: true, reason: 'Topológicamente los usuarios acceden a los servidores, no al revés. Representa el flujo al revés si es necesario.' },
  'servidor→ap':        { blocked: true, reason: 'Los servidores no se conectan a APs de WiFi.' },

  // ── STORAGE ───────────────────────────────────────────────────────────────
  // Storage (IBM FlashSystem, Storwize, Synology, etc.) connects to:
  // - Servers via iSCSI/FC/NFS
  // - Switches via iSCSI/NFS Ethernet
  // - Backup servers as backup source
  // NEVER to internet, users, or firewall directly.
  'storage→switch':     { options: ['iSCSI 10G (datos)', 'NFS / SMB (datos)', 'Management 1G (admin)'] },
  'storage→servidor':   { options: ['iSCSI target presentado', 'NFS export', 'Fibre Channel (FC)'] },
  'storage→backup':     { options: ['Fuente de backup', 'Replicación de volúmenes', 'Snapshot remoto'] },
  'storage→storage':    { options: ['Replicación (IBM Metro Mirror)', 'Mirroring síncrono', 'Mirroring asíncrono', 'Snapshot remoto'] },
  'storage→vm':         { options: ['Volumen / LUN presentado al host'] },
  'storage→internet':   { blocked: true, reason: 'El storage (IBM, Synology, etc.) NUNCA debe tener conexión a internet. Riesgo de exfiltración de datos y ransomware directo al storage.' },
  'storage→usuarios':   { blocked: true, reason: 'Los usuarios no acceden al storage SAN directamente. Acceden a través de servidores de archivos, aplicaciones o NAS con protocolo SMB/NFS gestionado.' },
  'storage→firewall':   { blocked: true, reason: 'El storage no debe conectarse directamente al firewall.' },
  'storage→ap':         { blocked: true, reason: 'El storage no se conecta a APs inalámbricos.' },

  // ── VIRTUALIZACIÓN (VM/host) ──────────────────────────────────────────────
  'vm→switch':          { options: ['vSwitch estándar', 'vDS (Distributed Switch)', 'Uplink 10G', 'Bonding / LAG'] },
  'vm→storage':         { options: ['VMFS en SAN', 'NFS datastore', 'iSCSI datastore', 'vSAN (storage distribuido)', 'RDM (Raw Device Mapping)'] },
  'vm→vm':              { options: ['vMotion (migración en vivo)', 'Replicación (Veeam/SRM)', 'Cluster HA / FT', 'vSAN stretch cluster'] },
  'vm→backup':          { options: ['Snapshot VMware (quiesce)', 'Agentless Veeam (VADP)', 'CDP continuo (Veeam)'] },
  'vm→servidor':        { options: ['VM actúa como servidor físico'] },
  'vm→firewall':        { blocked: true, reason: 'Los hosts de virtualización no se conectan directamente al firewall.' },
  'vm→internet':        { blocked: true, reason: 'Los hosts de virtualización no tienen conexión directa a internet. El tráfico de las VMs sale por el switch y el firewall.' },
  'vm→usuarios':        { blocked: true, reason: 'Topológicamente los usuarios acceden a las VMs, no al revés.' },
  'vm→ap':              { blocked: true, reason: 'Los hosts de virtualización no se conectan a APs WiFi.' },

  // ── BACKUP ────────────────────────────────────────────────────────────────
  // Veeam, etc. connects to servers/VMs as client and to storage as repository.
  'backup→switch':      { options: ['LAN backup 1G', '10G dedicado backup'] },
  'backup→servidor':    { options: ['Agent Veeam (push/pull)', 'Agentless via hipervisor'] },
  'backup→vm':          { options: ['Snapshot VMware (VADP)', 'Agentless Veeam', 'CDP (continuo)'] },
  'backup→storage':     { options: ['Backup Repository local', 'Scale-out Backup Repository', 'Object Storage (S3/Azure Blob)', 'Cinta (Tape)'] },
  'backup→backup':      { options: ['Replica job (offsite)', 'Copy job a sitio alterno', 'Tape offload'] },
  'backup→internet':    { blocked: true, reason: 'El servidor de backup no se conecta directamente a internet. El backup en nube (Veeam Cloud Connect, etc.) sale a través del firewall.' },
  'backup→usuarios':    { blocked: true, reason: 'Los usuarios no se conectan directamente al servidor de backup.' },
  'backup→firewall':    { blocked: true, reason: 'El servidor de backup no se conecta directamente al firewall.' },
  'backup→ap':          { blocked: true, reason: 'El servidor de backup no se conecta a APs WiFi.' },

  // ── ACCESS POINT ──────────────────────────────────────────────────────────
  'ap→usuarios':        { options: ['WiFi 2.4 GHz (802.11n/ac)', 'WiFi 5 GHz (802.11ac/ax)', 'WiFi 6 (802.11ax)', 'WiFi 6E (6 GHz)'] },
  'ap→switch':          { options: ['Uplink PoE al switch', 'Uplink fibra (AP outdoor)'] },
  'ap→internet':        { blocked: true, reason: 'El AP no se conecta directamente a internet. El tráfico WiFi sube al switch y sale por el firewall.' },
  'ap→servidor':        { blocked: true, reason: 'El AP no se conecta directamente a servidores. Los clientes WiFi acceden a través del switch y la red interna.' },
  'ap→storage':         { blocked: true, reason: 'El AP no tiene conexión directa al storage.' },
  'ap→backup':          { blocked: true, reason: 'El AP no tiene conexión directa al servidor de backup.' },
  'ap→vm':              { blocked: true, reason: 'El AP no se conecta directamente a hosts de virtualización.' },
  'ap→firewall':        { blocked: true, reason: 'El AP no se conecta directamente al firewall.' },

  // ── USUARIOS ──────────────────────────────────────────────────────────────
  'usuarios→switch':    { options: ['Ethernet 1G (cable)', 'Ethernet 2.5G', 'VLAN de usuarios'] },
  'usuarios→ap':        { options: ['Cliente WiFi inalámbrico'] },
  'usuarios→internet':  { blocked: true, reason: 'Los usuarios acceden a internet a través de la red interna y el firewall. No hay conexión directa.' },
  'usuarios→storage':   { blocked: true, reason: 'Los usuarios no acceden al storage SAN/NAS directamente. Acceden a través de aplicaciones, servidores de archivos o shares de red administrados.' },
  'usuarios→backup':    { blocked: true, reason: 'Los usuarios no se conectan al servidor de backup directamente.' },
  'usuarios→firewall':  { blocked: true, reason: 'Los usuarios no se conectan directamente al firewall.' },
  'usuarios→vm':        { blocked: true, reason: 'Los usuarios acceden a servicios en VMs a través de la red, no directamente al host.' },
  'usuarios→servidor':  { options: ['Acceso a aplicación / servicio'], warn: 'En arquitectura, este flujo suele representarse al revés (servidor provee servicio a usuarios). Verifica la dirección.' },
  'usuarios→power':     { blocked: true, reason: 'Los usuarios no se conectan directamente a servidores IBM Power.' },
  'usuarios→tape':      { blocked: true, reason: 'Los usuarios no acceden directamente a la library de cintas.' },
  'usuarios→cloud':     { options: ['VPN corporativa hacia nube', 'Escritorio virtual (VDI en nube)'], warn: 'Los usuarios acceden a la nube a través del firewall y VPN. Esta conexión representa el flujo lógico de acceso, no físico.' },
  'usuarios→usuarios':  { blocked: true, reason: 'Los endpoints de usuario no se conectan entre sí en topología de red empresarial.' },

  // ── IBM POWER (AIX / IBM i) ───────────────────────────────────────────────
  'power→switch':       { options: ['1G copper', '10G SFP+', 'Bonding / LAG (LACP)'] },
  'power→storage':      { options: ['SAS directo (DAS)', 'Fibre Channel (FC — HBA requerido)', 'iSCSI', 'NFS', 'IBM i native attach'] },
  'power→servidor':     { options: ['Migración P2P', 'Integración de aplicación distribuida'] },
  'power→vm':           { options: ['PowerVM (LPAR en host Power)', 'Migración a vSphere (P2V)'], warn: 'Si el Power ejecuta PowerVM, el host ES la capa de virtualización. Esta conexión representa migración o integración, no dependencia física.' },
  'power→backup':       { options: ['IBM Spectrum Protect (TSM)', 'Veeam Agent para IBM Power', 'BRMS (IBM i)'] },
  'power→power':        { options: ['PowerHA (HACMP cluster)', 'Replicación LUN (Global Mirror / Metro Mirror)', 'GLVM', 'Heartbeat / Resource Group'] },
  'power→cloud':        { options: ['IBM Power Virtual Server (cloud híbrido)', 'Replicación a sitio remoto', 'Burst de carga a nube'] },
  'power→tape':         { options: ['SAS directo (library local)', 'Fibre Channel (SAN tape library)', 'BRMS backup a cinta'] },
  'power→firewall':     { options: ['Segmento DMZ', 'Segmento interno protegido'] },
  'power→internet':     { blocked: true, reason: 'Los servidores IBM Power no deben conectarse directamente a internet.' },
  'power→ap':           { blocked: true, reason: 'Los servidores IBM Power no se conectan a APs WiFi.' },
  'power→usuarios':     { blocked: true, reason: 'Topológicamente los usuarios acceden a los servidores IBM Power, no al revés.' },

  // ── TAPE LIBRARY (IBM TS Series) ─────────────────────────────────────────
  'tape→backup':        { options: ['Repositorio de cinta (Veeam Tape Server)', 'Fuente de restauración', 'IBM Spectrum Protect Tape Pool'] },
  'tape→storage':       { options: ['HSM — tiering automático a cinta', 'Archivo frío (cold archive)'] },
  'tape→power':         { options: ['Cinta SAS directa (library local al Power)', 'FC (SAN tape library)'] },
  'tape→servidor':      { options: ['Cinta SAS directa', 'FC (SAN tape library)'] },
  'tape→switch':        { options: ['Management (controladora de library vía IP)'] },
  'tape→tape':          { options: ['Expansión de library (módulos adicionales)', 'Multi-frame library (IBM TS4500)'] },
  'tape→internet':      { blocked: true, reason: 'La library de cintas no tiene conexión a internet.' },
  'tape→usuarios':      { blocked: true, reason: 'Los usuarios no acceden directamente a la library de cintas.' },
  'tape→firewall':      { blocked: true, reason: 'La library de cintas no se conecta directamente al firewall.' },
  'tape→ap':            { blocked: true, reason: 'La library de cintas no se conecta a APs WiFi.' },
  'tape→vm':            { blocked: true, reason: 'Los hosts VMware no se conectan directamente a la library de cintas. El servidor de backup (Veeam) es el intermediario.' },
  'tape→cloud':         { blocked: true, reason: 'La library de cintas física no tiene conexión directa a la nube. El servidor de backup es el intermediario.' },

  // ── NUBE PROPIA (CoreSolutions Cloud) ────────────────────────────────────
  'cloud→internet':     { options: ['Uplink ISP (nube propia)', 'Peering directo (BGP)'] },
  'cloud→firewall':     { options: ['VPN site-to-site (IPsec)', 'SD-WAN overlay', 'MPLS / línea dedicada'] },
  'cloud→servidor':     { options: ['Replicación desde nube a on-prem', 'Burst inverso', 'Nube híbrida (sincronización)'] },
  'cloud→storage':      { options: ['Tiering desde nube a on-prem', 'Object Storage (S3-compatible)', 'Replicación asíncrona'] },
  'cloud→backup':       { options: ['Repositorio Veeam Cloud Connect', 'Cloud Tier (SOBR — Scale-out)', 'DR como servicio (DRaaS)'] },
  'cloud→vm':           { options: ['IaaS VMs en nube', 'Replicación hacia sitio local (DR inverso)', 'vMotion cross-cloud (HCX)'] },
  'cloud→power':        { options: ['IBM Power Virtual Server (IaaS cloud)', 'Burst de carga IBM Power a nube'] },
  'cloud→cloud':        { options: ['Multi-cloud / nube híbrida', 'Replicación entre regiones (DR)', 'Peering entre sites'] },
  'cloud→switch':       { blocked: true, reason: 'La nube no se conecta directamente a un switch on-premise. La conectividad pasa por firewall / VPN.' },
  'cloud→tape':         { blocked: true, reason: 'La nube no se conecta directamente a una library de cintas física.' },
  'cloud→usuarios':     { blocked: true, reason: 'Los usuarios acceden a la nube a través de internet y firewall, no hay conexión directa.' },
  'cloud→ap':           { blocked: true, reason: 'La nube no se conecta directamente a APs WiFi.' },

  // ── Tipos existentes → nuevos tipos ──────────────────────────────────────
  'internet→power':     { blocked: true, reason: 'Los servidores IBM Power no deben exponerse directamente a internet.' },
  'internet→tape':      { blocked: true, reason: 'La library de cintas no tiene conexión a internet.' },
  'internet→cloud':     { options: ['WAN / ISP hacia nube propia', 'Peering público (BGP)'], warn: 'Representa la conexión del ISP hacia la nube propia. El acceso de usuarios a la nube debe pasar por el firewall.' },

  'firewall→power':     { options: ['Segmento interno protegido', 'DMZ directa'] },
  'firewall→tape':      { blocked: true, reason: 'La library de cintas no se conecta directamente al firewall.' },
  'firewall→cloud':     { options: ['VPN site-to-site (IPsec)', 'SD-WAN overlay', 'MPLS / línea dedicada'] },

  'switch→power':       { options: ['1G copper', '10G SFP+', 'Bonding / LAG (LACP)'] },
  'switch→tape':        { options: ['Management (controladora de library vía IP)'], warn: 'El switch conecta solo a la interfaz de management de la library. Los datos van por SAS o FC directo al servidor.' },
  'switch→cloud':       { blocked: true, reason: 'Un switch LAN no se conecta directamente a la nube. La conectividad pasa por el firewall / VPN.' },

  'servidor→power':     { options: ['Integración de aplicación distribuida', 'Migración física (P2P)'] },
  'servidor→tape':      { options: ['SAS directo (DAS tape)', 'Fibre Channel (SAN tape library)'] },
  'servidor→cloud':     { options: ['Replicación a nube (DR)', 'Burst de carga a nube', 'Migración (lift and shift)'] },

  'storage→power':      { options: ['iSCSI target presentado al Power', 'NFS export', 'Fibre Channel (storage presenta LUN a Power)'] },
  'storage→tape':       { options: ['Tiering automático (HSM — IBM Spectrum Scale)', 'Archivo frío (cold data)', 'Snapshot offload a cinta'] },
  'storage→cloud':      { options: ['Tiering a object storage (IBM COS / S3)', 'Replicación asíncrona remota', 'Snapshot remoto'] },

  'backup→power':       { options: ['IBM Spectrum Protect (agent)', 'BRMS (IBM i)', 'Veeam Agent para IBM Power'] },
  'backup→tape':        { options: ['Veeam Tape Server (offload a cinta)', 'Offload mensual / anual a cinta', 'DR copy a cinta offsite'] },
  'backup→cloud':       { options: ['Veeam Cloud Connect (repository en nube)', 'Cloud Tier SOBR', 'DRaaS (Disaster Recovery as a Service)'] },

  'vm→power':           { options: ['Migración P2V inversa', 'Integración de carga cross-platform'], warn: 'Conexión inusual. Verifica si es una migración o integración real entre plataformas.' },
  'vm→tape':            { blocked: true, reason: 'Los hosts VMware no se conectan directamente a la library de cintas. El servidor de backup (Veeam) es el intermediario.' },
  'vm→cloud':           { options: ['Replicación a DR en nube (Veeam Cloud Connect)', 'Burst de VMs', 'Migración a IaaS'] },

  'ap→power':           { blocked: true, reason: 'Los APs no se conectan directamente a servidores IBM Power.' },
  'ap→tape':            { blocked: true, reason: 'Los APs no se conectan a libraries de cintas.' },
  'ap→cloud':           { blocked: true, reason: 'Los APs no se conectan directamente a la nube.' },

  // ── Reglas same-type faltantes ────────────────────────────────────────────
  'ap→ap':              { options: ['Mesh (wireless backhaul)', 'Uplink PoE daisy chain'], warn: 'El daisy chain PoE degrada el rendimiento. Usa mesh o sube cada AP directamente al switch.' },
  'internet→internet':  { blocked: true, reason: 'No aplica — representa dos ISP que no se interconectan en el diagrama.' },
}

function getRule(srcType, tgtType) {
  if (!srcType || !tgtType) return null
  // Normalize 'custom' nodes — allow generic connection from/to custom
  const key = `${srcType}→${tgtType}`
  if (CONN_RULES[key]) return CONN_RULES[key]
  // If either side is 'custom', allow with generic options
  if (srcType === 'custom' || tgtType === 'custom') {
    return { options: ['Conexión genérica', '1G Ethernet', '10G Ethernet', 'Fibra óptica'] }
  }
  return null
}

// ─── Model-aware rule adjustments ──────────────────────────────────────────────
const CORE_SWITCH_MODELS = ['CX 6400', 'CX 8100', 'CX 8325', 'CX 8360', 'CX 9300', 'CX 10000']

function adjustRuleForModels(rule, srcType, srcModel, tgtType, tgtModel) {
  if (!rule || rule.blocked) return rule

  // Switches core/agregación/spine no entregan PoE directo a un AP
  if (srcType === 'switch' && tgtType === 'ap' && CORE_SWITCH_MODELS.includes(srcModel)) {
    return {
      options: ['Uplink hacia switch de acceso (sin PoE directo)'],
      warn: `Los switches core/agregación (${CORE_SWITCH_MODELS.join(', ')}) no entregan PoE directo. Coloca un switch de acceso (CX 6000–6300) entre este switch y el AP.`,
    }
  }

  // Storage Synology no soporta Fibre Channel
  const isSynology = m => m?.startsWith('Synology')
  if ((srcType === 'storage' && isSynology(srcModel)) || (tgtType === 'storage' && isSynology(tgtModel))) {
    const filtered = rule.options?.filter(o => !/Fibre Channel|FC\b/.test(o))
    if (filtered && filtered.length !== rule.options.length) {
      if (filtered.length === 0) {
        return { blocked: true, reason: 'Synology no soporta Fibre Channel. Usa iSCSI, NFS/SMB o SAS según el modelo.' }
      }
      return { ...rule, options: filtered }
    }
  }

  return rule
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  existing: { label: 'LEGACY', bg: 'rgba(22,22,22,0.95)', borderStyle: 'dashed', badgeColor: '#8d8d8d', badgeBg: 'rgba(141,141,141,0.12)', dimText: true },
  new:      { label: 'NUEVO',  bg: 'rgba(15,98,254,0.08)', borderStyle: 'solid',  badgeColor: '#0f62fe', badgeBg: 'rgba(15,98,254,0.15)', dimText: false },
}

// ─── Custom node ──────────────────────────────────────────────────────────────
function IBMNode({ data, selected }) {
  const st = STATUS[data.status] || STATUS.existing
  return (
    <div
      style={{
        borderLeftColor: data.color, borderLeftWidth: 4, borderLeftStyle: 'solid',
        borderTopColor: selected ? '#0f62fe' : '#525252', borderTopStyle: st.borderStyle, borderTopWidth: 1,
        borderRightColor: selected ? '#0f62fe' : '#525252', borderRightStyle: st.borderStyle, borderRightWidth: 1,
        borderBottomColor: selected ? '#0f62fe' : '#525252', borderBottomStyle: st.borderStyle, borderBottomWidth: 1,
        background: st.bg, boxShadow: selected ? '0 0 0 2px rgba(15,98,254,0.35)' : undefined, minWidth: 140,
      }}
      className="transition-all cursor-pointer select-none"
    >
      <Handle type="target" position={Position.Top}    style={{ background: '#525252', border: 'none', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left}   style={{ background: '#525252', border: 'none', width: 8, height: 8 }} />
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 font-mono"
            style={{ color: st.badgeColor, backgroundColor: st.badgeBg }}>
            {st.label}
          </span>
          {data.note && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f1c21b' }} title="Tiene nota" />}
        </div>
        <div className="flex items-start gap-2">
          <span className="text-base leading-none mt-0.5 flex-shrink-0">{data.icon}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold leading-tight break-words" style={{ color: st.dimText ? '#a8a8a8' : '#f4f4f4' }}>
              {data.label}
            </p>
            {data.brand && <p className="text-[10px] text-ibm-gray50 font-mono mt-0.5 leading-tight">{data.brand}</p>}
            {data.model && <p className="text-[10px] text-ibm-blue font-mono mt-0.5 leading-tight">{data.model}</p>}
          </div>
        </div>
        <div className="text-[9px] font-mono mt-1.5 leading-none" style={{ color: data.color, opacity: 0.8 }}>
          {data.domainLabel || ''}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#525252', border: 'none', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right}  style={{ background: '#525252', border: 'none', width: 8, height: 8 }} />
    </div>
  )
}

const NODE_TYPE_MAP = { ibmNode: IBMNode }

// ─── Custom edge with label ───────────────────────────────────────────────────
function LabeledEdge({ id, sourceX, sourceY, targetX, targetY, data, markerEnd, style }) {
  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  if (!data?.label) {
    return <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
  }
  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{ position: 'absolute', transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all' }}
          className="nodrag nopan"
        >
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-ibm-gray90 border border-ibm-gray70 text-ibm-gray30 whitespace-nowrap">
            {data.label}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

const EDGE_TYPE_MAP = { labeled: LabeledEdge }

// ─── Add node picker ──────────────────────────────────────────────────────────
const ADDABLE_NODES = [
  { type: 'internet', label: 'Internet / ISP' },   { type: 'firewall', label: 'Firewall' },
  { type: 'switch',   label: 'Switch' },            { type: 'ap',       label: 'Access Point / WiFi' },
  { type: 'servidor', label: 'Servidor x86 (Lenovo)' }, { type: 'power', label: 'IBM Power (AIX / IBM i)' },
  { type: 'storage',  label: 'Storage (IBM / Synology)' }, { type: 'tape', label: 'Tape Library (IBM TS)' },
  { type: 'backup',   label: 'Backup (Veeam)' },   { type: 'vm',       label: 'Host VMware' },
  { type: 'cloud',    label: 'Nube Propia (CoreSolutions)' }, { type: 'usuarios', label: 'Usuarios' },
  { type: 'custom',   label: 'Equipo genérico' },
]

function AddNodePicker({ onAdd, onClose }) {
  return (
    <div className="absolute top-12 left-2 z-10 bg-ibm-gray90 border border-ibm-gray70 shadow-xl w-52" onClick={e => e.stopPropagation()}>
      <div className="px-3 py-2 border-b border-ibm-gray70">
        <p className="text-xs font-semibold text-ibm-gray30 uppercase tracking-widest">Agregar nodo</p>
        <p className="text-[10px] text-ibm-gray50 mt-0.5">Se añade como propuesta nueva</p>
      </div>
      <div className="py-1">
        {ADDABLE_NODES.map(n => {
          const base = NODE_TYPES[n.type]
          return (
            <button key={n.type} onClick={() => { onAdd(n.type); onClose() }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-ibm-gray80 transition-colors">
              <span className="text-sm">{base?.icon}</span>
              <span className="text-xs text-ibm-gray10">{n.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Connection picker modal ──────────────────────────────────────────────────
function ConnectionPicker({ pending, onConfirm, onCancel }) {
  const { src, tgt, rule } = pending
  const [selected, setSelected] = useState(rule?.options?.[0] || '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-ibm-gray90 border border-ibm-gray70 shadow-2xl w-80 max-w-[90vw]"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'sheetIn 0.15s ease-out' }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-ibm-gray70">
          <p className="text-xs font-semibold text-ibm-gray30 uppercase tracking-widest mb-2">Tipo de conexión</p>
          <div className="flex items-center gap-2">
            <span className="text-base">{src.data.icon}</span>
            <span className="text-xs font-medium text-ibm-gray10 truncate max-w-[80px]">{src.data.label}</span>
            <svg className="w-4 h-4 text-ibm-gray50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span className="text-base">{tgt.data.icon}</span>
            <span className="text-xs font-medium text-ibm-gray10 truncate max-w-[80px]">{tgt.data.label}</span>
          </div>
        </div>

        {/* Warning */}
        {rule?.warn && (
          <div className="mx-4 mt-3 px-3 py-2 bg-ibm-yellow/10 border border-ibm-yellow/40 flex gap-2">
            <span className="text-ibm-yellow text-xs flex-shrink-0 mt-0.5">⚠</span>
            <p className="text-xs text-ibm-yellow leading-snug">{rule.warn}</p>
          </div>
        )}

        {/* Options */}
        <div className="p-4 space-y-1.5">
          {(rule?.options || ['Conexión genérica']).map(opt => (
            <button
              key={opt}
              onClick={() => setSelected(opt)}
              className={`w-full text-left px-3 py-2.5 text-xs border transition-colors flex items-center gap-2
                ${selected === opt
                  ? 'bg-ibm-blue/10 border-ibm-blue text-ibm-gray10'
                  : 'border-ibm-gray70 text-ibm-gray30 hover:border-ibm-gray50 hover:text-ibm-gray10'
                }`}
            >
              <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-colors
                ${selected === opt ? 'border-ibm-blue bg-ibm-blue' : 'border-ibm-gray60'}`}
              />
              <span className="font-mono">{opt}</span>
            </button>
          ))}

          {/* Generic fallback when no rule */}
          {!rule && (
            <p className="text-[10px] text-ibm-gray50 px-1">
              Conexión no estándar — se añadirá como genérica.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-4 pb-4">
          <button onClick={onCancel} className="btn-ghost flex-shrink-0 text-xs py-2 px-4">
            Cancelar
          </button>
          <button onClick={() => onConfirm(selected)} className="btn-primary flex-1 text-xs py-2">
            Conectar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Note panel ───────────────────────────────────────────────────────────────
function NotePanel({ node, onUpdate, onClose, onDelete }) {
  const [label,  setLabel]  = useState(node.data.label)
  const [note,   setNote]   = useState(node.data.note || '')
  const [status, setStatus] = useState(node.data.status || 'existing')
  const [model,  setModel]  = useState(node.data.model || '')
  const modelChoices = MODEL_OPTIONS[node.data.nodeType]

  const save = () => { onUpdate(node.id, { label, note, status, model }); onClose() }

  return (
    <div className="absolute right-0 top-0 bottom-0 bg-ibm-gray90 border-l border-ibm-gray70 flex flex-col z-20 shadow-xl" style={{ width: 280 }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-ibm-gray70 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{node.data.icon}</span>
          <span className="text-xs font-semibold text-ibm-gray10 truncate max-w-[160px]">{node.data.label}</span>
        </div>
        <button onClick={onClose} className="text-ibm-gray50 hover:text-ibm-gray10 p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="field-label mb-2">Estado del equipo</label>
          <div className="flex">
            {[{ value: 'existing', label: '📦 Legacy' }, { value: 'new', label: '✨ Nuevo' }].map((s, i) => (
              <button key={s.value} onClick={() => setStatus(s.value)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors border ${i === 0 ? 'border-r-0' : ''}
                  ${status === s.value
                    ? s.value === 'new' ? 'bg-ibm-blue text-white border-ibm-blue' : 'bg-ibm-gray70 text-ibm-gray10 border-ibm-gray70'
                    : 'border-ibm-gray60 text-ibm-gray50 hover:border-ibm-gray50'
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="field-label">Nombre del nodo</label>
          <input className="field text-sm" value={label} onChange={e => setLabel(e.target.value)} />
        </div>
        <div>
          <label className="field-label flex items-center gap-1.5">
            <span className="text-ibm-yellow">📝</span> Nota técnica
          </label>
          <textarea className="field resize-none text-sm" rows={5} value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ej: Switch sin garantía, instalado 2016. No administrado. Reemplazo urgente..."
            autoFocus />
        </div>
        {node.data.brand && (
          <div>
            <label className="field-label">Marca / solución</label>
            <p className="text-xs text-ibm-gray30 font-mono">{node.data.brand}</p>
          </div>
        )}
        {modelChoices && (
          <div>
            <label className="field-label">Modelo</label>
            <select className="field text-sm" value={model} onChange={e => setModel(e.target.value)}>
              <option value="">— Sin especificar —</option>
              {modelChoices.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-2 p-4 border-t border-ibm-gray70 flex-shrink-0">
        <button onClick={save} className="btn-primary flex-1 text-xs py-2">Guardar</button>
        <button onClick={() => { onDelete(node.id); onClose() }}
          className="px-3 py-2 text-xs border border-ibm-red/50 text-ibm-red hover:bg-ibm-red/10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function DiagramLegend() {
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-ibm-gray90 border border-ibm-gray70 text-[10px] flex-wrap">
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-3 border border-dashed border-ibm-gray50 bg-ibm-gray100" />
        <span className="text-ibm-gray50 font-mono">LEGACY</span>
      </div>
      <div className="w-px h-3 bg-ibm-gray70" />
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-3 border border-solid border-ibm-blue bg-ibm-blue/10" />
        <span className="text-ibm-gray50 font-mono">NUEVO</span>
      </div>
      <div className="w-px h-3 bg-ibm-gray70" />
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-ibm-yellow" />
        <span className="text-ibm-gray50 font-mono">nota</span>
      </div>
      <div className="w-px h-3 bg-ibm-gray70" />
      <span className="text-ibm-gray50 font-mono">Arrastra handles para conectar</span>
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
  const [pendingConn, setPendingConn]   = useState(null)
  const [fullscreen, setFullscreen]     = useState(false)
  const idCounter = useRef(100)

  // ── Fullscreen toggle (Fullscreen API + fallback CSS overlay) ──
  const containerRef = useRef(null)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => setFullscreen(f => !f))
    } else {
      document.exitFullscreen().catch(() => setFullscreen(f => !f))
    }
  }
  // Sync state when user presses Escape
  useCallback(() => {
    const handler = () => { if (!document.fullscreenElement) setFullscreen(false) }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])()

  // ── Validate connection while dragging ──
  const isValidConnection = useCallback((connection) => {
    const src = nodes.find(n => n.id === connection.source)
    const tgt = nodes.find(n => n.id === connection.target)
    if (!src || !tgt || src.id === tgt.id) return false
    const rule = adjustRuleForModels(getRule(src.data.nodeType, tgt.data.nodeType), src.data.nodeType, src.data.model, tgt.data.nodeType, tgt.data.model)
    return !rule?.blocked
  }, [nodes])

  // ── Intercept connect — show picker or add directly ──
  const onConnect = useCallback((params) => {
    const src = nodes.find(n => n.id === params.source)
    const tgt = nodes.find(n => n.id === params.target)
    if (!src || !tgt) return

    const rule = adjustRuleForModels(getRule(src.data.nodeType, tgt.data.nodeType), src.data.nodeType, src.data.model, tgt.data.nodeType, tgt.data.model)
    if (rule?.blocked) return

    const needsPicker = (rule?.options && rule.options.length > 1) || rule?.warn
    if (needsPicker) {
      setPendingConn({ params, src, tgt, rule })
    } else {
      const label = rule?.options?.[0] || ''
      addEdgeLabeled(params, label)
    }
  }, [nodes])

  // ── Left-click on edge = delete it ──
  const onEdgeClick = useCallback((_, edge) => {
    setEdges(es => es.filter(e => e.id !== edge.id))
  }, [setEdges])

  function addEdgeLabeled(params, label) {
    setEdges(eds => addEdge({
      ...params,
      type: label ? 'labeled' : 'default',
      data: { label },
      style: { stroke: '#525252', strokeWidth: 1.5 },
      markerEnd: { type: 'arrowclosed', color: '#525252' },
    }, eds))
  }

  const confirmConn = (label) => {
    if (pendingConn) addEdgeLabeled(pendingConn.params, label)
    setPendingConn(null)
  }

  const onNodeClick = useCallback((_, node) => { setSelectedNode(node); setShowPicker(false) }, [])
  const onPaneClick = useCallback(() => { setSelectedNode(null); setShowPicker(false) }, [])

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
    const id = `custom-${idCounter.current++}`
    setNodes(ns => [...ns, {
      id, type: 'ibmNode',
      position: { x: 80 + Math.random() * 200, y: 80 + Math.random() * 200 },
      data: { nodeType: type, icon: base.icon, label: base.label, brand: base.brand,
              color: base.color, domainLabel: base.domainLabel || '', note: '', status: 'new' },
    }])
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%', position: 'relative',
        ...(fullscreen && !document.fullscreenElement
          ? { position: 'fixed', inset: 0, zIndex: 9999, background: '#161616' }
          : {}),
      }}
    >
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodeClick={onNodeClick} onPaneClick={onPaneClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={NODE_TYPE_MAP} edgeTypes={EDGE_TYPE_MAP}
        fitView fitViewOptions={{ padding: 0.3 }}
        deleteKeyCode="Delete"
        style={{ background: '#161616' }}
      >
        <Background color="#262626" variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls style={{ background: '#262626', border: '1px solid #525252' }}
          className="[&>button]:bg-ibm-gray90 [&>button]:border-ibm-gray70 [&>button]:text-ibm-gray10" />

        <Panel position="top-left">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => { setShowPicker(p => !p); setSelectedNode(null) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-colors
                  ${showPicker ? 'bg-ibm-blue text-white border-ibm-blue' : 'bg-ibm-gray90 text-ibm-gray10 border-ibm-gray70 hover:border-ibm-gray50'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar
              </button>
              <p className="text-[10px] text-ibm-gray50 hidden sm:block">
                Click nodo = editar · Click línea = eliminar · Del = borrar nodo
              </p>
              {showPicker && <AddNodePicker onAdd={addNode} onClose={() => setShowPicker(false)} />}
            </div>
            <DiagramLegend />
          </div>
        </Panel>

        {/* Fullscreen button — top-right */}
        <Panel position="top-right">
          <button
            onClick={toggleFullscreen}
            title={document.fullscreenElement || fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            className="flex items-center justify-center w-8 h-8 bg-ibm-gray90 border border-ibm-gray70 text-ibm-gray30 hover:text-ibm-gray10 hover:border-ibm-gray50 transition-colors"
          >
            {document.fullscreenElement || fullscreen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 9V4H4m0 5h5M15 4h5v5m0-5h-5M9 15H4v5m5 0v-5m6 5v-5h5m-5 0h5" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 8V4h4M4 16v4h4m12-4v4h-4m4-12V4h-4" />
              </svg>
            )}
          </button>
        </Panel>
      </ReactFlow>

      {/* Connection type picker */}
      {pendingConn && (
        <ConnectionPicker
          pending={pendingConn}
          onConfirm={confirmConn}
          onCancel={() => setPendingConn(null)}
        />
      )}

      {/* Note panel */}
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

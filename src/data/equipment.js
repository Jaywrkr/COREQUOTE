// Equipment specs database — Aruba CX switches & Lenovo ThinkSystem servers
// Used for node info panel and port-aware connection options.

export const EQUIPMENT_DB = {

  // ─── ARUBA CX SWITCHES ────────────────────────────────────────────────────────

  'CX 6000': {
    name: 'Aruba CX 6000 12G',
    category: 'switch',
    tier: 'access',
    formFactor: '1U (desktop / rack)',
    switching: '56 Gbps',
    routing: 'L2 / L3 lite',
    management: 'AOS-CX, WebUI, REST',
    ports: [
      { label: '8× RJ45 PoE+',  count: 8, speed: '1G',  media: 'copper', poe: 'PoE+ 802.3at (30W)' },
      { label: '4× RJ45',        count: 4, speed: '1G',  media: 'copper', poe: null },
      { label: '2× SFP+',        count: 2, speed: '10G', media: 'sfp+',   poe: null },
    ],
    poe: { budget: '65 W total', standard: '802.3at' },
    notes: 'Ideal para pequeñas sucursales y entornos SOHO. Sin PoE en puertos 9–12.',
  },

  'CX 6100': {
    name: 'Aruba CX 6100 Series',
    category: 'switch',
    tier: 'access',
    formFactor: '1U rack',
    switching: '128 Gbps',
    routing: 'L2 / L3 lite',
    management: 'AOS-CX, WebUI, REST',
    ports: [
      { label: '24× RJ45 PoE+',  count: 24, speed: '1G',  media: 'copper', poe: 'PoE+ 802.3at (30W)' },
      { label: '4× SFP+',         count: 4,  speed: '10G', media: 'sfp+',   poe: null },
    ],
    poe: { budget: '370 W total', standard: '802.3at' },
    notes: 'Switch de acceso para medianas empresas. Variante 48G disponible.',
  },

  'CX 6200': {
    name: 'Aruba CX 6200 Series',
    category: 'switch',
    tier: 'access',
    formFactor: '1U rack',
    switching: '176 Gbps',
    routing: 'L3 completo',
    management: 'AOS-CX, CLI, REST, NAE',
    ports: [
      { label: '48× RJ45 PoE+',  count: 48, speed: '1G',  media: 'copper', poe: 'PoE+ 802.3at (30W)' },
      { label: '4× SFP+',         count: 4,  speed: '10G', media: 'sfp+',   poe: null },
      { label: '2× QSFP+',        count: 2,  speed: '40G', media: 'qsfp+',  poe: null },
    ],
    poe: { budget: '740 W total', standard: '802.3at' },
    notes: 'Switch de acceso con L3 completo (OSPF, VRRP). Ideal piso de distribución.',
  },

  'CX 6300': {
    name: 'Aruba CX 6300 Series',
    category: 'switch',
    tier: 'distribution',
    formFactor: '1U rack',
    switching: '400 Gbps',
    routing: 'L3 completo',
    management: 'AOS-CX, CLI, REST, NAE, VSF',
    ports: [
      { label: '48× RJ45 PoE++', count: 48, speed: '1G',  media: 'copper', poe: 'PoE++ 802.3bt (90W)' },
      { label: '4× SFP28',        count: 4,  speed: '25G', media: 'sfp28',  poe: null },
      { label: '2× QSFP+',        count: 2,  speed: '40G', media: 'qsfp+',  poe: null },
    ],
    poe: { budget: '1440 W total', standard: '802.3bt' },
    notes: 'Distribución con PoE++ (90W por puerto). Soporta VSF stacking. Variante SFP 1G disponible.',
  },

  'CX 6400': {
    name: 'Aruba CX 6400',
    category: 'switch',
    tier: 'core',
    formFactor: '7U modular chassis',
    switching: '6.4 Tbps',
    routing: 'L3 completo + MPLS',
    management: 'AOS-CX, CLI, REST, NAE',
    ports: [
      { label: 'Hasta 96× SFP28', count: 96, speed: '25G', media: 'sfp28', poe: null },
      { label: 'Hasta 48× QSFP28', count: 48, speed: '100G', media: 'qsfp28', poe: null },
    ],
    poe: null,
    notes: 'Chassis modular para núcleo de campus. SIN PoE. Requiere módulos de línea separados.',
  },

  'CX 8100': {
    name: 'Aruba CX 8100',
    category: 'switch',
    tier: 'spine',
    formFactor: '1U rack',
    switching: '6.4 Tbps',
    routing: 'L3 completo + BGP/EVPN',
    management: 'AOS-CX, CLI, REST, NAE',
    ports: [
      { label: '48× SFP28',  count: 48, speed: '25G',  media: 'sfp28',  poe: null },
      { label: '8× QSFP28',  count: 8,  speed: '100G', media: 'qsfp28', poe: null },
    ],
    poe: null,
    notes: 'Spine para data center y campus core. SIN PoE. BGP EVPN VXLAN nativo.',
  },

  'CX 8325': {
    name: 'Aruba CX 8325',
    category: 'switch',
    tier: 'spine',
    formFactor: '1U rack',
    switching: '6.4 Tbps',
    routing: 'L3 completo + BGP/EVPN',
    management: 'AOS-CX, CLI, REST, NAE',
    ports: [
      { label: '32× QSFP+', count: 32, speed: '100G', media: 'qsfp28', poe: null },
    ],
    poe: null,
    notes: 'Spine de alta densidad 100G. SIN PoE. Típico en top-of-rack y spine DC.',
  },

  'CX 8360': {
    name: 'Aruba CX 8360',
    category: 'switch',
    tier: 'spine',
    formFactor: '2U rack',
    switching: '12.8 Tbps',
    routing: 'L3 completo + BGP/EVPN + SR',
    management: 'AOS-CX, CLI, REST, NAE',
    ports: [
      { label: '48× SFP28',  count: 48, speed: '25G',  media: 'sfp28',  poe: null },
      { label: '12× QSFP28', count: 12, speed: '100G', media: 'qsfp28', poe: null },
    ],
    poe: null,
    notes: 'Spine/core avanzado. SIN PoE. Soporte Segment Routing (SR-MPLS).',
  },

  'CX 9300': {
    name: 'Aruba CX 9300',
    category: 'switch',
    tier: 'spine',
    formFactor: '2U rack',
    switching: '25.6 Tbps',
    routing: 'L3 completo + BGP/EVPN',
    management: 'AOS-CX, CLI, REST, NAE',
    ports: [
      { label: '32× QSFP-DD', count: 32, speed: '400G', media: 'qsfp-dd', poe: null },
    ],
    poe: null,
    notes: 'Spine ultra-alta densidad 400G. SIN PoE. Para data centers de gran escala.',
  },

  'CX 10000': {
    name: 'Aruba CX 10000',
    category: 'switch',
    tier: 'spine',
    formFactor: '2U rack',
    switching: '25.6 Tbps',
    routing: 'L3 + firewall distribuido + DPU (Pensando)',
    management: 'AOS-CX + HPE Aruba Networking Central',
    ports: [
      { label: '32× QSFP-DD', count: 32, speed: '400G', media: 'qsfp-dd', poe: null },
    ],
    poe: null,
    notes: 'Switch con DPU integrado (Pensando P4). Firewall distribuido en hardware. SIN PoE.',
  },

  'CX 4100i': {
    name: 'Aruba CX 4100i',
    category: 'switch',
    tier: 'industrial',
    formFactor: 'DIN Rail / IP30',
    switching: '32 Gbps',
    routing: 'L2 / L3 lite',
    management: 'AOS-CX, WebUI, REST',
    ports: [
      { label: '12× SFP+ / RJ45 combo', count: 12, speed: '10G', media: 'sfp+/copper', poe: null },
    ],
    poe: null,
    notes: 'Switch industrial (-40°C a +75°C). Certificación IEC 61850. Para planta o exteriores.',
  },

  // ─── LENOVO THINKSYSTEM SERVERS ──────────────────────────────────────────────

  'SR630 V4': {
    name: 'Lenovo ThinkSystem SR630 V4',
    category: 'servidor',
    formFactor: '1U rack',
    cpu: 'Hasta 2× Intel Xeon Scalable 4ª Gen (Sapphire Rapids)',
    ram: 'Hasta 32× DIMM DDR5 — máx. 4 TB',
    storage: '8× 2.5" SAS/NVMe hot-swap',
    ports: [
      { label: '2× 10GbE OCP 3.0 (LOM)', count: 2, speed: '10G', media: 'copper/sfp+', poe: null },
    ],
    expansion: [
      'PCIe 5.0 ×16 (×2 slots)',
      'PCIe 4.0 ×8 (×1 slot)',
      'OCP 3.0 (NIC adicional SFP+ / 25G / 100G)',
    ],
    notes: 'Servidor 1U de doble socket. Equilibrio precio/rendimiento para virtualización y aplicaciones.',
  },

  'SR650 V4': {
    name: 'Lenovo ThinkSystem SR650 V4',
    category: 'servidor',
    formFactor: '2U rack',
    cpu: 'Hasta 2× Intel Xeon Scalable 4ª Gen',
    ram: 'Hasta 32× DIMM DDR5 — máx. 8 TB',
    storage: 'Hasta 24× 2.5" SAS/NVMe hot-swap',
    ports: [
      { label: '4× 10GbE OCP 3.0 (LOM)', count: 4, speed: '10G', media: 'copper/sfp+', poe: null },
    ],
    expansion: [
      'PCIe 5.0 ×16 (×4 slots)',
      'PCIe 4.0 ×8 (×2 slots)',
      'OCP 3.0 (NIC 25G / 100G)',
      'HBA FC 16G / 32G para SAN',
    ],
    notes: 'Servidor 2U de doble socket. Alta densidad de storage. Ideal para bases de datos y backup.',
  },

  'SR665 V3': {
    name: 'Lenovo ThinkSystem SR665 V3',
    category: 'servidor',
    formFactor: '2U rack',
    cpu: 'Hasta 2× AMD EPYC 9004 (Genoa)',
    ram: 'Hasta 24× DIMM DDR5 — máx. 6 TB',
    storage: 'Hasta 24× 2.5" SAS/NVMe hot-swap',
    ports: [
      { label: '2× 10GbE OCP 3.0 (LOM)', count: 2, speed: '10G', media: 'copper/sfp+', poe: null },
    ],
    expansion: [
      'PCIe 5.0 ×16 (×4 slots)',
      'PCIe 4.0 ×8 (×2 slots)',
      'OCP 3.0 (NIC 25G / 100G)',
      'HBA FC para SAN',
    ],
    notes: 'AMD EPYC — mayor número de cores por socket. Excelente para HPC, virtualización densa y cargas paralelas.',
  },

  'SR635 V3': {
    name: 'Lenovo ThinkSystem SR635 V3',
    category: 'servidor',
    formFactor: '1U rack',
    cpu: '1× AMD EPYC 9004 (single socket)',
    ram: 'Hasta 12× DIMM DDR5 — máx. 3 TB',
    storage: '8× 2.5" SAS/NVMe hot-swap',
    ports: [
      { label: '2× 10GbE OCP 3.0 (LOM)', count: 2, speed: '10G', media: 'copper/sfp+', poe: null },
    ],
    expansion: [
      'PCIe 5.0 ×16 (×2 slots)',
      'OCP 3.0 (NIC adicional)',
    ],
    notes: 'Servidor 1U mono-socket AMD. Buena relación costo/rendimiento para cargas de trabajo medianas.',
  },

  'SR675i': {
    name: 'Lenovo ThinkSystem SR675i V3',
    category: 'servidor',
    formFactor: '2U rack',
    cpu: 'Hasta 2× AMD EPYC 9004',
    ram: 'Hasta 24× DIMM DDR5 — máx. 6 TB',
    storage: 'Hasta 48× SAS/NVMe (alta densidad)',
    ports: [
      { label: '2× 10GbE OCP 3.0 (LOM)', count: 2, speed: '10G', media: 'copper/sfp+', poe: null },
    ],
    expansion: [
      'PCIe 5.0 ×16 (×4 slots)',
      'OCP 3.0',
      'HBA para SAN FC',
    ],
    notes: 'Especializado en alta densidad de almacenamiento. Hasta 48 unidades en 2U.',
  },

  'SR650i': {
    name: 'Lenovo ThinkSystem SR650i V3',
    category: 'servidor',
    formFactor: '2U rack',
    cpu: 'Hasta 2× Intel Xeon Scalable 4ª Gen',
    ram: 'Hasta 32× DIMM DDR5 — máx. 8 TB',
    storage: 'Hasta 24× 2.5" SAS/NVMe',
    ports: [
      { label: '2× 10GbE OCP 3.0 (LOM)', count: 2, speed: '10G', media: 'copper/sfp+', poe: null },
    ],
    expansion: [
      'PCIe 5.0 ×16',
      'PCIe 4.0 ×8',
      'OCP 3.0 (NIC 25G / 100G)',
      'HBA FC 32G para SAN',
    ],
    notes: 'Variante reforzada del SR650 V4 con mayor densidad de PCIe.',
  },

  'SR680a V4': {
    name: 'Lenovo ThinkSystem SR680a V4',
    category: 'servidor',
    formFactor: '4U rack (4-socket)',
    cpu: 'Hasta 4× Intel Xeon Scalable 4ª Gen',
    ram: 'Hasta 64× DIMM DDR5 — máx. 16 TB',
    storage: 'Hasta 8× 2.5" NVMe',
    ports: [
      { label: '4× 10GbE OCP 3.0 (LOM)', count: 4, speed: '10G', media: 'copper/sfp+', poe: null },
    ],
    expansion: [
      'PCIe 5.0 ×16 (múltiples slots)',
      'OCP 3.0',
      'HBA FC para SAN',
    ],
    notes: 'Servidor enterprise de 4 sockets. Máximo rendimiento en memoria y procesamiento. SAP HANA, bases de datos en memoria.',
  },

  'ThinkEdge SE455i': {
    name: 'Lenovo ThinkEdge SE455i',
    category: 'servidor',
    formFactor: '1U rack (edge)',
    cpu: '1× AMD EPYC 9004',
    ram: 'Hasta 12× DIMM DDR5 — máx. 3 TB',
    storage: '2× 2.5" + 4× M.2 NVMe',
    ports: [
      { label: '2× 10GbE (LOM)',        count: 2, speed: '10G', media: 'copper/sfp+', poe: null },
      { label: '2× RJ45 management', count: 2, speed: '1G',  media: 'copper',      poe: null },
    ],
    expansion: [
      'PCIe 5.0 ×16 (×1 slot)',
      'OCP 3.0',
      'Diseñado para entornos de borde (temperatura extendida)',
    ],
    notes: 'Servidor edge tolerante a condiciones ambientales adversas. XClarity + certificaciones NEBS/ETSI.',
  },
}

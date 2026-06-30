// Equipment specs database — Aruba CX, Lenovo ThinkSystem, IBM FlashSystem/Power/TS, Synology, Check Point Quantum
// Used for node info panel and port-aware connection options.
// redundancy: { count, label } → shown as split visual inside the diagram node (dual controller, dual socket, etc.)

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

  // ─── IBM FLASHSYSTEM (ALL-FLASH STORAGE) ─────────────────────────────────────

  'FlashSystem 5600': {
    name: 'IBM FlashSystem 5600',
    category: 'storage',
    formFactor: '2U rack (2 canisters)',
    redundancy: { count: 2, label: 'Canister' },
    ports: [
      { label: '4× FC 32Gb (2 por canister)',    count: 4, speed: '32G FC', media: 'fc',    poe: null },
      { label: '4× iSCSI 25GbE (2 por canister)', count: 4, speed: '25G',   media: 'sfp28', poe: null },
      { label: '4× iSCSI 10GbE (2 por canister)', count: 4, speed: '10G',   media: 'sfp+',  poe: null },
    ],
    specs: {
      switching: null,
      routing: null,
      management: 'IBM Storage Insights / GUI / CLI / REST',
      maxCapacity: '580 TB bruto (NVMe)',
      cache: '64 GB por canister (mirrored)',
      protocols: 'FC 32G · iSCSI 25G/10G · NVMe-oF',
    },
    expansion: [
      'Hasta 4 bandejas de expansión DS8F',
      'Compresión + deduplicación en línea',
      'Replicación Metro Mirror / Global Mirror',
    ],
    notes: 'Activo-activo entre ambos canisters. Cada canister tiene sus propios puertos — conectar host a ambos para multipath redundante.',
  },

  'FlashSystem 7600': {
    name: 'IBM FlashSystem 7600',
    category: 'storage',
    formFactor: '2U rack (2 canisters)',
    redundancy: { count: 2, label: 'Canister' },
    ports: [
      { label: '8× FC 32Gb (4 por canister)',    count: 8, speed: '32G FC', media: 'fc',    poe: null },
      { label: '4× iSCSI 25GbE (2 por canister)', count: 4, speed: '25G',   media: 'sfp28', poe: null },
      { label: '8× iSCSI 10GbE (4 por canister)', count: 8, speed: '10G',   media: 'sfp+',  poe: null },
    ],
    specs: {
      management: 'IBM Storage Insights / GUI / CLI / REST',
      maxCapacity: '5.8 PB bruto (NVMe)',
      cache: '128 GB por canister (mirrored)',
      protocols: 'FC 32G · iSCSI 25G/10G · NVMe-oF',
    },
    expansion: [
      'Hasta 8 bandejas de expansión',
      'IBM FlashCore Module (FCM) con compresión HW',
      'Replicación Metro Mirror / Global Mirror / HyperSwap',
    ],
    notes: 'Mayor densidad y rendimiento que el 5600. HyperSwap permite conmutación transparente entre dos sitios.',
  },

  'FlashSystem 9600': {
    name: 'IBM FlashSystem 9600',
    category: 'storage',
    formFactor: '2U rack (2 canisters)',
    redundancy: { count: 2, label: 'Canister' },
    ports: [
      { label: '8× FC 64Gb (4 por canister)',     count: 8, speed: '64G FC',  media: 'fc',     poe: null },
      { label: '8× iSCSI 100GbE (4 por canister)', count: 8, speed: '100G',   media: 'qsfp28', poe: null },
      { label: '4× iSCSI 25GbE (2 por canister)',  count: 4, speed: '25G',    media: 'sfp28',  poe: null },
    ],
    specs: {
      management: 'IBM Storage Insights / GUI / CLI / REST',
      maxCapacity: '32.6 PB bruto (NVMe FCM)',
      cache: '512 GB por canister (mirrored)',
      protocols: 'FC 64G · iSCSI 100G/25G · NVMe-oF',
    },
    expansion: [
      'Hasta 16 bandejas de expansión',
      'IBM FlashCore Module Gen4 (compresión + encriptación HW)',
      'Replicación Metro Mirror / Global Mirror / HyperSwap / Safeguarded Copy',
      'Data Reduction garantizado (3:1 mínimo)',
    ],
    notes: 'Sistema enterprise top de gama. Cada canister con sus propios puertos FC 64G. Siempre conectar host a ambos canisters (multipath MPIO).',
  },

  // ─── IBM POWER (AIX / IBM i) ──────────────────────────────────────────────────

  'S1012': {
    name: 'IBM Power S1012',
    category: 'power',
    formFactor: '4U rack o tower',
    redundancy: null,
    cpu: '1× POWER10 (hasta 8 cores activos)',
    ram: '4× DDR4 — hasta 256 GB',
    storage: '2× SAS / NVMe internos + expansión',
    ports: [
      { label: '2× RJ45 1GbE (BMC/OS)',  count: 2, speed: '1G', media: 'copper', poe: null },
      { label: '1× USB 3.0',             count: 1, speed: null,  media: 'usb',    poe: null },
    ],
    expansion: [
      'PCIe 4.0 ×16 (×2 slots)',
      'Adaptadores FC 32G para SAN',
      'NIC 10G / 25G adicional',
      'Conectividad PowerVM (LPAR) incluida',
    ],
    notes: 'Entry level POWER10. Un único socket. Soporta AIX, IBM i y Linux. Ideal para cargas de trabajo medianas en entornos POWER.',
  },

  'S1014': {
    name: 'IBM Power S1014',
    category: 'power',
    formFactor: '4U rack',
    redundancy: null,
    cpu: '1× POWER10 (hasta 24 cores)',
    ram: '8× DDR4 — hasta 512 GB',
    storage: '8× SAS/NVMe internos',
    ports: [
      { label: '2× RJ45 1GbE (BMC/OS)', count: 2, speed: '1G', media: 'copper', poe: null },
    ],
    expansion: [
      'PCIe 4.0 ×16 (×3 slots)',
      'Adaptadores FC 32G',
      'NIC 10G / 25G',
      'PowerVM incluido',
    ],
    notes: 'Mid-range POWER10 mono-socket. Hasta 24 cores. Soporta AIX, IBM i y Linux on POWER.',
  },

  'S1022': {
    name: 'IBM Power S1022',
    category: 'power',
    formFactor: '2U rack',
    redundancy: { count: 2, label: 'Socket' },
    cpu: '2× POWER10 (hasta 20 cores c/u — 40 total)',
    ram: '16× DDR4 — hasta 2 TB',
    storage: '8× SAS/NVMe internos',
    ports: [
      { label: '4× RJ45 1GbE (BMC/OS)', count: 4, speed: '1G', media: 'copper', poe: null },
    ],
    expansion: [
      'PCIe 4.0 ×16 (×6 slots)',
      'Adaptadores FC 32G',
      'NIC 10G / 25G',
      'PowerVM incluido',
      'Scale-out: hasta 4 nodos en cluster',
    ],
    notes: 'Dual socket POWER10. Alta densidad de procesamiento en 2U. Popular para entornos AIX y IBM i medianos-grandes.',
  },

  'S1024': {
    name: 'IBM Power S1024',
    category: 'power',
    formFactor: '4U rack',
    redundancy: { count: 2, label: 'Socket' },
    cpu: '2× POWER10 (hasta 24 cores c/u — 48 total)',
    ram: '32× DDR4 — hasta 4 TB',
    storage: '12× SAS/NVMe internos',
    ports: [
      { label: '4× RJ45 1GbE (BMC/OS)', count: 4, speed: '1G', media: 'copper', poe: null },
    ],
    expansion: [
      'PCIe 4.0 ×16 (×8 slots)',
      'Adaptadores FC 32G / NIC 25G',
      'PowerVM incluido',
    ],
    notes: 'El más potente de la línea scale-out POWER10. Dual socket, 4U. Ideal para consolidación AIX/IBM i de alta carga.',
  },

  'E1050': {
    name: 'IBM Power E1050',
    category: 'power',
    formFactor: '4U rack (enterprise)',
    redundancy: { count: 4, label: 'Socket' },
    cpu: '4× POWER10 (hasta 24 cores c/u — 96 total)',
    ram: '64× DDR4 — hasta 8 TB',
    storage: 'NVMe interno + expansión externa',
    ports: [
      { label: '8× RJ45 1GbE (BMC/OS/HMC)', count: 8, speed: '1G', media: 'copper', poe: null },
    ],
    expansion: [
      'PCIe 4.0 ×16 (múltiples slots)',
      'HMC (Hardware Management Console) obligatorio',
      'Adaptadores FC 64G',
      'NIC 25G / 100G',
      'Live Partition Mobility (LPM)',
    ],
    notes: 'Enterprise scale-up POWER10. 4 sockets, hasta 96 cores. HMC requerido. LPAR, LPM, PowerHA disponibles.',
  },

  'E1080': {
    name: 'IBM Power E1080',
    category: 'power',
    formFactor: '4U por drawer — hasta 4 drawers (16 sockets)',
    redundancy: { count: 4, label: 'Drawer' },
    cpu: 'Hasta 16× POWER10 (hasta 15 cores c/u — 240 total)',
    ram: 'Hasta 128× DDR4 — hasta 64 TB',
    storage: 'NVMe interno + bandejas externas',
    ports: [
      { label: '8× RJ45 1GbE por drawer (HMC/BMC)', count: 8, speed: '1G', media: 'copper', poe: null },
    ],
    expansion: [
      'HMC obligatorio (doble para HA)',
      'Adaptadores FC 64G / NIC 100G',
      'Live Partition Mobility, PowerHA SystemMirror',
      'Memoria diferencial entre drawers',
    ],
    notes: 'El servidor POWER10 enterprise más grande. Hasta 4 drawers en un solo sistema. Misión crítica: AIX, IBM i, SAP HANA on Power.',
  },

  // ─── IBM TAPE LIBRARY (TS SERIES) ────────────────────────────────────────────

  'TS4300': {
    name: 'IBM TS4300 Tape Library',
    category: 'tape',
    formFactor: '2U rack (expandible a 4U/6U)',
    redundancy: null,
    ports: [
      { label: '1× RJ45 1GbE (management)', count: 1, speed: '1G', media: 'copper', poe: null },
      { label: '2× FC 16G por drive (data)',  count: 2, speed: '16G FC', media: 'fc', poe: null },
    ],
    specs: {
      management: 'GUI / SNMP / SMI-S',
      maxCapacity: 'Hasta 200 cartuchos (LTO-8/9)',
      drives: '1–2 unidades LTO-8/9 por módulo',
      protocols: 'FC 16G · SAS (directo a servidor)',
    },
    expansion: [
      'Hasta 3 módulos de expansión (200 cart. total)',
      'Soporte LTO-7, LTO-8, LTO-9',
      'WORM (Write Once Read Many)',
    ],
    notes: 'Library mid-range. Conexión de datos vía FC o SAS directo al servidor de backup (Veeam). Management por Ethernet.',
  },

  'TS4500': {
    name: 'IBM TS4500 Tape Library',
    category: 'tape',
    formFactor: 'Frame rack (modular, hasta 16 frames)',
    redundancy: { count: 2, label: 'Accessor' },
    ports: [
      { label: '2× RJ45 1GbE (management)',   count: 2, speed: '1G',    media: 'copper', poe: null },
      { label: '4× FC 32G por drive (data)',   count: 4, speed: '32G FC', media: 'fc',    poe: null },
    ],
    specs: {
      management: 'IBM Spectrum Archive / LTFS / GUI / REST',
      maxCapacity: 'Hasta 20,000 cartuchos (LTO-9)',
      drives: 'Hasta 144 unidades LTO-9',
      protocols: 'FC 32G · LTFS',
    },
    expansion: [
      'Doble accessor (robot) para redundancia y velocidad',
      'Hasta 16 frames de expansión',
      'LTO-8 y LTO-9',
      'Compatible IBM Spectrum Archive (LTFS)',
      'Replication entre frames para DR en sitio',
    ],
    notes: 'Library enterprise de alta capacidad. Doble accessor (robot) independiente — si uno falla, el otro continúa. Management redundante.',
  },

  // ─── SYNOLOGY (NAS) ──────────────────────────────────────────────────────────

  'Synology RS6426xs+': {
    name: 'Synology RackStation RS6426xs+',
    category: 'storage',
    formFactor: '4U rack (26 bahías)',
    redundancy: null,
    ports: [
      { label: '4× RJ45 1GbE',    count: 4, speed: '1G',  media: 'copper', poe: null },
      { label: '2× SFP+ 10GbE',   count: 2, speed: '10G', media: 'sfp+',   poe: null },
      { label: '2× SFP28 25GbE',  count: 2, speed: '25G', media: 'sfp28',  poe: null },
    ],
    specs: {
      management: 'DSM 7 / REST API / Active Directory',
      maxCapacity: '26 bahías SATA/SAS + caché SSD',
      protocols: 'SMB · NFS · iSCSI · AFP · FTP',
      cache: 'SSD cache en bahías dedicadas',
    },
    expansion: [
      'Hasta 2 unidades de expansión (RX-series)',
      'Synology High Availability (SHA) — activo/pasivo con segundo NAS idéntico',
      'Snapshot Replication',
    ],
    notes: 'NAS enterprise Synology de mayor capacidad. NO soporta FC (solo IP: iSCSI/SMB/NFS). Para HA se requiere segundo RS6426xs+ con SHA.',
  },

  'Synology RS4826xs+': {
    name: 'Synology RackStation RS4826xs+',
    category: 'storage',
    formFactor: '4U rack (48 bahías)',
    redundancy: null,
    ports: [
      { label: '4× RJ45 1GbE',   count: 4, speed: '1G',  media: 'copper', poe: null },
      { label: '2× SFP+ 10GbE',  count: 2, speed: '10G', media: 'sfp+',   poe: null },
      { label: '2× SFP28 25GbE', count: 2, speed: '25G', media: 'sfp28',  poe: null },
    ],
    specs: {
      management: 'DSM 7',
      maxCapacity: '48 bahías SATA/SAS',
      protocols: 'SMB · NFS · iSCSI · FTP',
    },
    expansion: ['Expansión con RX-series', 'SHA con unidad idéntica'],
    notes: 'Alta densidad de bahías en 4U. Solo protocolos IP. Sin FC.',
  },

  'Synology RS3626xs': {
    name: 'Synology RackStation RS3626xs',
    category: 'storage',
    formFactor: '4U rack (36 bahías)',
    redundancy: null,
    ports: [
      { label: '4× RJ45 1GbE',   count: 4, speed: '1G',  media: 'copper', poe: null },
      { label: '2× SFP+ 10GbE',  count: 2, speed: '10G', media: 'sfp+',   poe: null },
    ],
    specs: {
      management: 'DSM 7',
      maxCapacity: '36 bahías SATA/SAS',
      protocols: 'SMB · NFS · iSCSI · FTP',
    },
    expansion: ['Expansión RX-series'],
    notes: '36 bahías en 4U. Protocols IP únicamente (sin FC).',
  },

  'Synology RS1626xs+': {
    name: 'Synology RackStation RS1626xs+',
    category: 'storage',
    formFactor: '2U rack (16 bahías)',
    redundancy: null,
    ports: [
      { label: '4× RJ45 1GbE',  count: 4, speed: '1G',  media: 'copper', poe: null },
      { label: '2× SFP+ 10GbE', count: 2, speed: '10G', media: 'sfp+',   poe: null },
    ],
    specs: {
      management: 'DSM 7',
      maxCapacity: '16 bahías SATA/SAS + expansión',
      protocols: 'SMB · NFS · iSCSI',
    },
    expansion: ['Hasta 2 RX-series', 'SHA con unidad idéntica'],
    notes: 'NAS rack 2U compacto de gama alta. Sin FC. Ideal para empresas medianas.',
  },

  'Synology DS1825+': {
    name: 'Synology DiskStation DS1825+',
    category: 'storage',
    formFactor: 'Desktop (18 bahías)',
    redundancy: null,
    ports: [
      { label: '4× RJ45 1GbE',  count: 4, speed: '1G',  media: 'copper', poe: null },
      { label: '2× SFP+ 10GbE', count: 2, speed: '10G', media: 'sfp+',   poe: null },
    ],
    specs: {
      management: 'DSM 7',
      maxCapacity: '18 bahías SATA',
      protocols: 'SMB · NFS · iSCSI',
    },
    expansion: ['DX-series expansion'],
    notes: 'NAS desktop de alta capacidad. Sin FC.',
  },

  'Synology DS1525+': {
    name: 'Synology DiskStation DS1525+',
    category: 'storage',
    formFactor: 'Desktop (15 bahías)',
    redundancy: null,
    ports: [
      { label: '4× RJ45 1GbE',  count: 4, speed: '1G',  media: 'copper', poe: null },
      { label: '2× SFP+ 10GbE (ranura PCIe)', count: 2, speed: '10G', media: 'sfp+', poe: null },
    ],
    specs: { management: 'DSM 7', maxCapacity: '15 bahías SATA', protocols: 'SMB · NFS · iSCSI' },
    expansion: ['DX513 (5 bahías adicionales × 2)'],
    notes: '15 bahías desktop. NIC 10G opcional vía ranura PCIe.',
  },

  'Synology DS925+': {
    name: 'Synology DiskStation DS925+',
    category: 'storage',
    formFactor: 'Desktop (9 bahías)',
    redundancy: null,
    ports: [
      { label: '2× RJ45 2.5GbE',              count: 2, speed: '2.5G', media: 'copper', poe: null },
      { label: '2× SFP+ 10GbE (ranura PCIe)', count: 2, speed: '10G',  media: 'sfp+',   poe: null },
    ],
    specs: { management: 'DSM 7', maxCapacity: '9 bahías SATA/NVMe', protocols: 'SMB · NFS · iSCSI' },
    expansion: [],
    notes: 'NAS compacto de escritorio. 9 bahías con ranura PCIe para expansión 10G.',
  },

  'Synology DS725+': {
    name: 'Synology DiskStation DS725+',
    category: 'storage',
    formFactor: 'Desktop (7 bahías)',
    redundancy: null,
    ports: [
      { label: '2× RJ45 1GbE',               count: 2, speed: '1G',  media: 'copper', poe: null },
      { label: '1× SFP+ 10GbE (ranura PCIe)', count: 1, speed: '10G', media: 'sfp+',   poe: null },
    ],
    specs: { management: 'DSM 7', maxCapacity: '7 bahías SATA', protocols: 'SMB · NFS · iSCSI' },
    expansion: [],
    notes: 'NAS entry desktop. 7 bahías con opción 10G.',
  },

  'Synology FS200T': {
    name: 'Synology FlashStation FS200T',
    category: 'storage',
    formFactor: '2U rack — All-Flash (24 bahías NVMe)',
    redundancy: { count: 2, label: 'Controladora' },
    ports: [
      { label: '4× SFP+ 10GbE por controladora',  count: 8,  speed: '10G',  media: 'sfp+',  poe: null },
      { label: '2× SFP28 25GbE por controladora',  count: 4,  speed: '25G',  media: 'sfp28', poe: null },
    ],
    specs: {
      management: 'DSM 7 / HA activo-pasivo',
      maxCapacity: '24× NVMe SSD (all-flash)',
      protocols: 'iSCSI · NFS · SMB',
    },
    expansion: ['HA integrado — dos controladoras activo/pasivo', 'Failover automático < 30 s'],
    notes: 'Único NAS Synology con dual-controladora real (activo/pasivo). All-flash NVMe. SIN soporte FC — solo iSCSI/NFS/SMB sobre IP.',
  },

  // ─── CHECK POINT QUANTUM FIREWALLS ───────────────────────────────────────────

  'Quantum 3600': {
    name: 'Check Point Quantum 3600',
    category: 'firewall',
    formFactor: '1U rack (desktop / rack)',
    redundancy: null,
    throughput: 'Hasta 10 Gbps NGFW',
    management: 'Check Point SmartConsole / Infinity Portal',
    ports: [
      { label: '6× RJ45 1GbE (LAN/WAN)', count: 6, speed: '1G',  media: 'copper', poe: null },
      { label: '4× SFP+ 10GbE',           count: 4, speed: '10G', media: 'sfp+',   poe: null },
    ],
    expansion: [
      'HA activo/pasivo con segundo Quantum 3600',
      'Blades: IPS, Application Control, URL Filtering, Anti-Bot',
      'Soporte CloudGuard (extensión a nube)',
    ],
    notes: 'Firewall SMB/mid-range. Ideal para sucursales y empresas medianas. Sin módulos de expansión de hardware.',
  },

  'Quantum 3800': {
    name: 'Check Point Quantum 3800',
    category: 'firewall',
    formFactor: '1U rack',
    redundancy: null,
    throughput: 'Hasta 20 Gbps NGFW',
    management: 'Check Point SmartConsole / Infinity Portal',
    ports: [
      { label: '8× RJ45 1GbE (LAN/WAN)', count: 8, speed: '1G',  media: 'copper', poe: null },
      { label: '4× SFP+ 10GbE',           count: 4, speed: '10G', media: 'sfp+',   poe: null },
    ],
    expansion: [
      'HA activo/pasivo',
      'Blades: Threat Prevention, SandBlast, IPS',
      'Licencias por suscripción (Quantum Smart-1)',
    ],
    notes: 'Versión mejorada del 3600. Más throughput con el mismo factor de forma.',
  },

  'Quantum 6000': {
    name: 'Check Point Quantum 6000',
    category: 'firewall',
    formFactor: '1U rack',
    redundancy: { count: 2, label: 'Firewall (HA)' },
    throughput: 'Hasta 40 Gbps NGFW',
    management: 'Check Point SmartConsole / Smart-1 Cloud',
    ports: [
      { label: '18× RJ45 1GbE',  count: 18, speed: '1G',  media: 'copper', poe: null },
      { label: '6× SFP+ 10GbE',  count: 6,  speed: '10G', media: 'sfp+',   poe: null },
    ],
    expansion: [
      'HA Cluster XL (activo/pasivo o activo/activo)',
      'Blades: IPS, App Control, URL, Anti-Virus, Anti-Bot, SandBlast',
      'VSX (múltiples firewalls virtuales en un appliance)',
    ],
    notes: 'Firewall mid-range empresarial. Soporte VSX para virtualización de firewalls. HA recomendado con segundo Quantum 6000.',
  },

  'Quantum 26000': {
    name: 'Check Point Quantum 26000',
    category: 'firewall',
    formFactor: '2U rack',
    redundancy: { count: 2, label: 'Firewall (HA)' },
    throughput: 'Hasta 200 Gbps NGFW',
    management: 'Check Point SmartConsole / Smart-1 Cloud / Infinity XDR',
    ports: [
      { label: '24× SFP+ 10GbE',  count: 24, speed: '10G',  media: 'sfp+',   poe: null },
      { label: '4× QSFP+ 40GbE',  count: 4,  speed: '40G',  media: 'qsfp+',  poe: null },
    ],
    expansion: [
      'HA Cluster XL (activo/pasivo y activo/activo)',
      'Blades completos de Threat Prevention',
      'VSX — hasta 250 contextos virtuales',
      'Integración SIEM / SOC',
    ],
    notes: 'Enterprise high-end. Amplia densidad de puertos 10G. Típico en datacenter y campus core.',
  },

  'Quantum 28000': {
    name: 'Check Point Quantum 28000',
    category: 'firewall',
    formFactor: '2U rack',
    redundancy: { count: 2, label: 'Firewall (HA)' },
    throughput: 'Hasta 800 Gbps NGFW',
    management: 'Check Point SmartConsole / Infinity XDR / Infinity SOC',
    ports: [
      { label: '32× SFP+ 10GbE',  count: 32, speed: '10G',  media: 'sfp+',   poe: null },
      { label: '8× QSFP28 100GbE', count: 8,  speed: '100G', media: 'qsfp28', poe: null },
    ],
    expansion: [
      'HA Cluster XL — activo/activo con sincronización de estado',
      'Maestro Hyperscale (scale-out horizontal)',
      'Blades: SandBlast, Threat Cloud, ThreatEmulation',
      'Integración con Infinity Portal y CloudGuard',
    ],
    notes: 'Top enterprise. Hasta 800 Gbps. Soporte Maestro para escalar horizontalmente añadiendo unidades al clúster.',
  },

  'Quantum Force': {
    name: 'Check Point Quantum Force',
    category: 'firewall',
    formFactor: '2U rack (generación más reciente)',
    redundancy: { count: 2, label: 'Firewall (HA)' },
    throughput: 'Hasta 1.5 Tbps (modelos superiores)',
    management: 'Check Point Infinity Portal / Smart-1 Cloud / XDR',
    ports: [
      { label: '32× SFP28 25GbE',  count: 32, speed: '25G',  media: 'sfp28',  poe: null },
      { label: '8× QSFP28 100GbE', count: 8,  speed: '100G', media: 'qsfp28', poe: null },
      { label: '2× QSFP-DD 400GbE', count: 2, speed: '400G', media: 'qsfp-dd', poe: null },
    ],
    expansion: [
      'Maestro Hyperscale — hasta 52 unidades en cluster',
      'AI-powered Threat Prevention (ThreatCloud AI)',
      'Zero Trust Network Access (ZTNA) integrado',
      'Autonomous Threat Prevention (ATP)',
    ],
    notes: 'Generación más reciente de Quantum. Procesadores de seguridad de última generación. Throughput hasta 1.5 Tbps con todos los blades activos.',
  },

  'Quantum Lightspeed': {
    name: 'Check Point Quantum Lightspeed',
    category: 'firewall',
    formFactor: '1U rack (ASIC personalizado)',
    redundancy: { count: 2, label: 'Firewall (HA)' },
    throughput: '30 Tbps (ASIC hardening)',
    management: 'Check Point Infinity Portal / Smart-1',
    ports: [
      { label: '24× QSFP-DD 400GbE', count: 24, speed: '400G', media: 'qsfp-dd', poe: null },
    ],
    expansion: [
      'Cluster HA Lightspeed',
      'Inspeccion SSL/TLS a velocidad de línea',
      'Threat Prevention acelerada por ASIC',
    ],
    notes: 'El firewall más rápido de Check Point. ASIC personalizado (no CPU general). Para hyperscalers, carriers y centros de datos ultra-densos. 30 Tbps de throughput.',
  },
}


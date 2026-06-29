const STORAGE_KEY = 'cq-assessments'
const CURRENT_KEY = 'cq-current-id'

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function loadAll() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

function saveAll(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }
  catch {}
}

export function getCurrentId() {
  return localStorage.getItem(CURRENT_KEY) || null
}

export function setCurrentId(id) {
  localStorage.setItem(CURRENT_KEY, id)
}

export function saveAssessment(assessment) {
  const list  = loadAll()
  const idx   = list.findIndex(a => a.id === assessment.id)
  const saved = { ...assessment, savedAt: Date.now() }
  if (idx >= 0) list[idx] = saved
  else          list.push(saved)
  saveAll(list)
  setCurrentId(assessment.id)
  return saved
}

export function deleteAssessment(id) {
  const list = loadAll().filter(a => a.id !== id)
  saveAll(list)
  if (getCurrentId() === id) {
    const next = list[list.length - 1]
    setCurrentId(next?.id || null)
  }
}

export function duplicateAssessment(id) {
  const list   = loadAll()
  const source = list.find(a => a.id === id)
  if (!source) return null
  const copy = {
    ...source,
    id: genId(),
    savedAt: Date.now(),
    client: {
      ...source.client,
      company: source.client?.company ? `${source.client.company} (copia)` : '',
    },
  }
  list.push(copy)
  saveAll(list)
  return copy
}

export function createBlankAssessment() {
  return {
    id: genId(),
    savedAt: Date.now(),
    client:  {},
    site:    {},
    domains: [],
    answers: {},
  }
}

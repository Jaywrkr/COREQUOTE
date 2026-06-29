import { useState, useCallback } from 'react'

const STORAGE_KEY = 'cq-section-prefs'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  catch { return {} }
}

function save(prefs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)) }
  catch {}
}

export function usePrefs() {
  const [prefs, setPrefs] = useState(load)

  const setSection = useCallback((domainId, section, value) => {
    setPrefs(prev => {
      const key = `${domainId}.${section}`
      const next = { ...prev }
      if (value === 'normal' || !value) {
        delete next[key]
      } else {
        next[key] = value
      }
      save(next)
      return next
    })
  }, [])

  const getSection = useCallback((domainId, section) => {
    return prefs[`${domainId}.${section}`] || 'normal'
  }, [prefs])

  return { getSection, setSection }
}

export const saveToLocalStorage = (key, val) => {
  const jsonVal = JSON.stringify(val)
  window.localStorage.setItem(key, jsonVal)
}

export const loadFromLocalStorage = (key) => {
  const val = window.localStorage.getItem(key)
  return JSON.parse(val)
}

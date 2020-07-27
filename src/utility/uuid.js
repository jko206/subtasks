const upperCases = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const lowerCases = upperCases.toLowerCase()
const numerals = '0123456789'
const chars = `${upperCases}${lowerCases}${numerals}`

const uuid = () => {
  let str = ''
  let count = 20
  while (count--) str += chars[Math.floor(Math.random() * chars.length)]
  return str
}

export default uuid

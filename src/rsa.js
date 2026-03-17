/**
 * RSA Cryptosystem - Simple implementation for educational purposes.
 * Uses BigInt for step-by-step computation with small numbers.
 */

function isPrime(n) {
  if (n < 2n) return false
  if (n === 2n) return true
  if (n % 2n === 0n) return false
  for (let i = 3n; i * i <= n; i += 2n) {
    if (n % i === 0n) return false
  }
  return true
}

function modPow(base, exp, mod) {
  let result = 1n
  base = base % mod
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod
    exp = exp / 2n
    base = (base * base) % mod
  }
  return result
}

function extendedGcd(a, b) {
  if (a === 0n) return { gcd: b, x: 0n, y: 1n }
  const { gcd, x: x1, y: y1 } = extendedGcd(b % a, a)
  const x = y1 - (b / a) * x1
  const y = x1
  return { gcd, x, y }
}

function modInverse(a, m) {
  const { gcd, x } = extendedGcd((a % m + m) % m, m)
  if (gcd !== 1n) return null
  return (x % m + m) % m
}

/**
 * One step of the Extended Euclidean Algorithm.
 * Uses "quotient" instead of "q" to avoid confusion with the prime q.
 */
export function getExtendedGcdSteps(phi, e) {
  const steps = []
  let a = phi
  let b = e
  let stepNum = 0
  const sHistory = [1n, 0n]
  const tHistory = [0n, 1n]

  while (b !== 0n) {
    stepNum++
    const quotient = a / b
    const r = a % b
    const sNew = sHistory[0] - quotient * sHistory[1]
    const tNew = tHistory[0] - quotient * tHistory[1]
    steps.push({ stepNum, phiVal: a, eVal: b, quotient, r, coeffE: tNew })
    sHistory[0] = sHistory[1]
    sHistory[1] = sNew
    tHistory[0] = tHistory[1]
    tHistory[1] = tNew
    a = b
    b = r
  }

  let d = tHistory[0]
  if (d < 0n) d = (d % phi + phi) % phi
  return { steps, d }
}

const SMALL_PRIMES = [
  2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n, 73n, 79n, 83n, 89n, 97n,
  101n, 103n, 107n, 109n, 113n, 127n, 131n, 137n, 139n, 149n, 151n, 157n, 163n, 167n, 173n, 179n, 181n, 191n, 193n, 197n, 199n, 211n, 223n, 227n, 229n, 233n, 239n, 241n, 251n,
]

export function getRandomPrime() {
  const i = Math.floor(Math.random() * SMALL_PRIMES.length)
  return SMALL_PRIMES[i]
}

export function getRandomPrimeExcluding(exclude) {
  const rest = SMALL_PRIMES.filter((x) => x !== exclude)
  return rest[Math.floor(Math.random() * rest.length)]
}

export function getRandomE(phi) {
  const common = [3n, 17n, 65537n].filter((c) => c < phi && modInverse(c, phi) !== null)
  if (common.length > 0 && Math.random() < 0.6) {
    return common[Math.floor(Math.random() * common.length)]
  }
  for (let attempt = 0; attempt < 200; attempt++) {
    const e = 2n + BigInt(Math.floor(Number(phi - 2n) * Math.random()))
    if (e >= phi) continue
    if (modInverse(e, phi) !== null) return e
  }
  return 17n
}

export function generateKeys(p, q, e = 65537n) {
  if (!isPrime(p) || !isPrime(q)) {
    return { error: 'p and q must be prime numbers.' }
  }
  if (p === q) {
    return { error: 'p and q must be different.' }
  }

  const n = p * q
  const phi = (p - 1n) * (q - 1n)

  if (e >= phi || e <= 1n) {
    return { error: 'e must be in range 1 < e < φ(n) and coprime with φ(n).' }
  }

  const d = modInverse(e, phi)
  if (d === null) {
    return { error: 'e and φ(n) are not coprime. Choose a different e.' }
  }

  return {
    p,
    q,
    n,
    phi,
    e,
    d,
    publicKey: { e, n },
    privateKey: { d, n },
  }
}

export function encrypt(m, publicKey) {
  if (m >= publicKey.n) throw new Error('Message must be less than n.')
  return modPow(m, publicKey.e, publicKey.n)
}

export function decrypt(c, privateKey) {
  return modPow(c, privateKey.d, privateKey.n)
}

export function textToBigInt(text) {
  let num = 0n
  for (let i = 0; i < text.length; i++) {
    num = num * 256n + BigInt(text.charCodeAt(i))
  }
  return num
}

export function bigIntToText(num) {
  const bytes = []
  while (num > 0n) {
    bytes.unshift(Number(num % 256n))
    num = num / 256n
  }
  return String.fromCharCode(...bytes)
}

export function encryptStepByStep(m, e, n) {
  const steps = []
  steps.push({ step: 'Plain message (m)', value: m })
  steps.push({ step: 'Ciphertext: c = m^e mod n', value: modPow(m, e, n) })
  return steps
}

export function decryptStepByStep(c, d, n) {
  const steps = []
  steps.push({ step: 'Ciphertext (c)', value: c })
  steps.push({ step: 'Plain message: m = c^d mod n', value: modPow(c, d, n) })
  return steps
}

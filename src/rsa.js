/**
 * RSA Cryptosystem - Simple implementation for educational purposes.
 * Uses BigInt for step-by-step computation with small numbers.
 */

/**
 * Checks if a BigInt is prime (only divisible by 1 and itself).
 * Note: In JavaScript, the "n" suffix means BigInt — e.g. 2n is the number two, not six.
 * @param {bigint} n - Number to check.
 * @returns {boolean} True if n is prime, false otherwise.
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


/**
 * Computes (base^exp) mod mod efficiently (square-and-multiply).
 * Used for encryption (m^e mod n) and decryption (c^d mod n).
 * @param {bigint} base - Base number.
 * @param {bigint} exp - Exponent.
 * @param {bigint} mod - Modulus.
 * @returns {bigint} base^exp mod mod.
 */
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

/**
 * Extended Euclidean Algorithm: finds gcd(a,b) and Bezout coefficients x, y
 * such that a*x + b*y = gcd(a,b). Used internally to compute the modular inverse.
 * @param {bigint} a - First number.
 * @param {bigint} b - Second number.
 * @returns {{ gcd: bigint, x: bigint, y: bigint }} gcd and coefficients x, y.
 */
function extendedGcd(a, b) {
  if (a === 0n) return { gcd: b, x: 0n, y: 1n }
  const { gcd, x: x1, y: y1 } = extendedGcd(b % a, a)
  const x = y1 - (b / a) * x1
  const y = x1
  return { gcd, x, y }
}



/**
 * Modular inverse: finds x such that (a * x) mod m = 1.
 * Returns null if no inverse exists (when gcd(a, m) !== 1).
 * @param {bigint} a - Number to invert.
 * @param {bigint} m - Modulus.
 * @returns {bigint | null} The inverse of a mod m, or null.
 */
function modInverse(a, m) {
  const { gcd, x } = extendedGcd((a % m + m) % m, m)
  if (gcd !== 1n) return null
  return (x % m + m) % m
}

/**
 * Step-by-step Extended Euclidean Algorithm for teaching.
 * Finds d such that e*d ≡ 1 (mod phi), and returns each division step
 * (with quotient and remainder) plus the "coefficient of e" at each step.
 * Uses "quotient" instead of "q" to avoid confusion with the prime q.
 * @param {bigint} phi - φ(n) = (p-1)(q-1).
 * @param {bigint} e - Public exponent.
 * @returns {{ steps: Array<{ stepNum, phiVal, eVal, quotient, r, coeffE }>, d: bigint }}
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

/**
 * Finds d by trying k = 1, 2, … until (k·φ + 1) is divisible by e; then d = (k·φ + 1) / e.
 * Equivalent to e·d ≡ 1 (mod φ) when gcd(e, φ) = 1. Some k < e always works.
 * @param {bigint} phi - φ(n).
 * @param {bigint} e - Public exponent.
 * @returns {{ attempts: Array<{ k: bigint, kPhi: bigint, plusOne: bigint, remainder: bigint, divisible: boolean }>, d: bigint, winningK: bigint } | { attempts: Array<never>, d: null, winningK: null }}
 */
export function getDByPhiMultiplesSteps(phi, e) {
  const attempts = []
  let k = 1n
  while (k <= e) {
    const kPhi = k * phi
    const plusOne = kPhi + 1n
    const remainder = plusOne % e
    const divisible = remainder === 0n
    attempts.push({ k, kPhi, plusOne, remainder, divisible })
    if (divisible) {
      return { attempts, d: plusOne / e, winningK: k }
    }
    k += 1n
  }
  return { attempts, d: null, winningK: null }
}

const SMALL_PRIMES = [
  2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n, 73n, 79n, 83n, 89n, 97n,
  101n, 103n, 107n, 109n, 113n, 127n, 131n, 137n, 139n, 149n, 151n, 157n, 163n, 167n, 173n, 179n, 181n, 191n, 193n, 197n, 199n, 211n, 223n, 227n, 229n, 233n, 239n, 241n, 251n,
]

/**
 * Picks a random prime from the SMALL_PRIMES list (for demo key generation).
 * @returns {bigint} A random prime from the list.
 */
export function getRandomPrime() {
  const i = Math.floor(Math.random() * SMALL_PRIMES.length)
  return SMALL_PRIMES[i]
}

/**
 * Picks a random prime from SMALL_PRIMES that is not equal to exclude.
 * Used so that p and q are different when using Random for both.
 * @param {bigint} exclude - Prime to exclude (e.g. the chosen p).
 * @returns {bigint} A random prime different from exclude.
 */
export function getRandomPrimeExcluding(exclude) {
  const rest = SMALL_PRIMES.filter((x) => x !== exclude)
  return rest[Math.floor(Math.random() * rest.length)]
}

/**
 * Returns a random valid public exponent e: 1 < e < phi and gcd(e, phi) = 1.
 * Prefers common values 3, 17, 65537 when they are valid; otherwise picks a random coprime e.
 * @param {bigint} phi - φ(n).
 * @returns {bigint} A valid e for RSA.
 */
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

/**
 * Generates an RSA key pair from two primes p, q and public exponent e.
 * Computes n = p*q, φ(n) = (p-1)(q-1), and d = e^(-1) mod φ(n).
 * @param {bigint} p - First prime.
 * @param {bigint} q - Second prime (must be different from p).
 * @param {bigint} [e=65537n] - Public exponent; must be coprime with φ(n).
 * @returns {Object | { error: string }} Key pair { p, q, n, phi, e, d, publicKey, privateKey } or an error object.
 */
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

/**
 * Encrypts a message m with the public key: c = m^e mod n.
 * @param {bigint} m - Plaintext as a number (must be less than n).
 * @param {{ e: bigint, n: bigint }} publicKey - Public key (e, n).
 * @returns {bigint} Ciphertext c.
 * @throws {Error} If m >= n.
 */
export function encrypt(m, publicKey) {
  if (m >= publicKey.n) throw new Error('Message must be less than n.')
  return modPow(m, publicKey.e, publicKey.n)
}

/**
 * Decrypts ciphertext c with the private key: m = c^d mod n.
 * @param {bigint} c - Ciphertext.
 * @param {{ d: bigint, n: bigint }} privateKey - Private key (d, n).
 * @returns {bigint} Plaintext m.
 */
export function decrypt(c, privateKey) {
  return modPow(c, privateKey.d, privateKey.n)
}

/**
 * Converts a string to a BigInt by treating each character as a byte (0–255)
 * and building the number in base 256. Used to turn the message into a number for RSA.
 * @param {string} text - Plain text.
 * @returns {bigint} The text encoded as a single BigInt.
 */
export function textToBigInt(text) {
  let num = 0n
  for (let i = 0; i < text.length; i++) {
    num = num * 256n + BigInt(text.charCodeAt(i))
  }
  return num
}

/**
 * Converts a BigInt back to a string (inverse of textToBigInt).
 * Extracts bytes by repeatedly taking num % 256 and dividing by 256.
 * @param {bigint} num - Number produced by textToBigInt (or decryption).
 * @returns {string} Decoded text.
 */
export function bigIntToText(num) {
  const bytes = []
  while (num > 0n) {
    bytes.unshift(Number(num % 256n))
    num = num / 256n
  }
  return String.fromCharCode(...bytes)
}

/**
 * How many characters can be packed into one RSA block so the numeric value stays less than n.
 * Uses the same base-256 encoding as textToBigInt (worst case byte 255 per position).
 * @param {bigint} n - Modulus.
 * @returns {number} Max characters per block; 0 if n is too small for even one arbitrary byte.
 */
export function maxCharsPerBlock(n) {
  let k = 0
  let maxVal = 0n
  while (true) {
    const nextMax = maxVal * 256n + 255n
    if (nextMax >= n) break
    k++
    maxVal = nextMax
  }
  return k
}

/**
 * Splits plain text into blocks; each block encodes to a BigInt strictly less than n.
 * Long messages are encrypted block-by-block (real RSA uses hybrid or larger keys).
 * @param {string} text - Plain text (may be empty).
 * @param {bigint} n - Modulus.
 * @returns {bigint[]} One BigInt per block (plaintext block values).
 * @throws {Error} If maxCharsPerBlock(n) is 0.
 */
export function textToBlocks(text, n) {
  const chunkLen = maxCharsPerBlock(n)
  if (chunkLen === 0) {
    throw new Error('Modulus n is too small for this encoding. Use larger primes p and q.')
  }
  const blocks = []
  for (let i = 0; i < text.length; i += chunkLen) {
    blocks.push(textToBigInt(text.slice(i, i + chunkLen)))
  }
  return blocks
}

/**
 * Returns a short step-by-step view of encryption: plain m and then c = m^e mod n.
 * @param {bigint} m - Plain message.
 * @param {bigint} e - Public exponent.
 * @param {bigint} n - Modulus.
 * @returns {Array<{ step: string, value: bigint }>} Two steps with labels and values.
 */
export function encryptStepByStep(m, e, n) {
  const steps = []
  steps.push({ step: 'Plain message (m)', value: m })
  steps.push({ step: 'Ciphertext: c = m^e mod n', value: modPow(m, e, n) })
  return steps
}

/**
 * Returns a short step-by-step view of decryption: ciphertext c and then m = c^d mod n.
 * @param {bigint} c - Ciphertext.
 * @param {bigint} d - Private exponent.
 * @param {bigint} n - Modulus.
 * @returns {Array<{ step: string, value: bigint }>} Two steps with labels and values.
 */
export function decryptStepByStep(c, d, n) {
  const steps = []
  steps.push({ step: 'Ciphertext (c)', value: c })
  steps.push({ step: 'Plain message: m = c^d mod n', value: modPow(c, d, n) })
  return steps
}

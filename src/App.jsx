import React, { useState, useMemo } from 'react'
import { generateKeys, getRandomPrime, getRandomPrimeExcluding, getRandomE } from './rsa'
import { KeyGenVisualization } from './components/KeyGenVisualization'
import { EncryptDecryptVisualization } from './components/EncryptDecryptVisualization'
import styles from './App.module.css'

/** Keep only ASCII digits 0–9 (for p, q, e inputs). */
function digitsOnly(value) {
  return value.replace(/\D/g, '')
}

/**
 * Main app component: RSA key generation and encryption/decryption UI.
 * Holds the inputs p, q, e as strings; derives the key pair (or error) via useMemo,
 * and passes them to KeyGenVisualization and EncryptDecryptVisualization.
 */
function App() {
  /** User input for first prime p (string for the input field). */
  const [pStr, setPStr] = useState('61')
  /** User input for second prime q. */
  const [qStr, setQStr] = useState('53')
  /** User input for public exponent e. */
  const [eStr, setEStr] = useState('17')

  /**
   * Runs key generation whenever pStr, qStr, or eStr change.
   * Converts to BigInt and calls generateKeys(p, q, e).
   * On invalid input or key-generation error, returns { error: string }.
   * @type {Object | { error: string }} Key pair object or error object.
   */
  const keyResult = useMemo(() => {
    try {
      const p = BigInt(pStr)
      const q = BigInt(qStr)
      const e = BigInt(eStr)
      return generateKeys(p, q, e)
    } catch {
      return { error: 'Invalid number in p, q or e.' }
    }
  }, [pStr, qStr, eStr])

  /** Resolved key pair (p, q, n, phi, e, d, publicKey, privateKey) or null if error/invalid. */
  const keys = keyResult && 'n' in keyResult ? keyResult : null
  /** Error message from key generation, or null. */
  const error = keyResult && 'error' in keyResult ? keyResult.error : null

  /** Fills p with a random prime from the demo list. */
  const handleRandomP = () => setPStr(getRandomPrime().toString())
  /** Fills q with a random prime different from the current p. */
  const handleRandomQ = () => setQStr(getRandomPrimeExcluding(BigInt(pStr || '2')).toString())
  /**
   * Fills e with a random valid exponent: if p and q are valid, uses getRandomE(phi),
   * otherwise picks randomly from 3, 17, 65537.
   */
  const handleRandomE = () => {
    try {
      const p = BigInt(pStr)
      const q = BigInt(qStr)
      if (p !== q && p > 0n && q > 0n) {
        const phi = (p - 1n) * (q - 1n)
        setEStr(getRandomE(phi).toString())
      } else {
        setEStr(['3', '17', '65537'][Math.floor(Math.random() * 3)])
      }
    } catch {
      setEStr(['3', '17', '65537'][Math.floor(Math.random() * 3)])
    }
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>RSA Cryptosystem</h1>
        <p className={styles.subtitle}>
          Visualization of key generation, encryption and decryption steps
        </p>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Key Generation</h2>
          <p className={styles.hint}>
            Choose two primes <strong>p</strong> and <strong>q</strong>, and public exponent <strong>e</strong>.
            Example: p=61, q=53, e=17 (use short text for small n).
          </p>
          <div className={styles.inputs}>
            <div className={styles.field}>
              <label>p (prime)</label>
              <div className={styles.inputWithButton}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  value={pStr}
                  onChange={(e) => setPStr(digitsOnly(e.target.value))}
                  className={styles.input}
                />
                <button type="button" className={styles.randomBtn} onClick={handleRandomP} title="Random prime">Random</button>
              </div>
            </div>
            <div className={styles.field}>
              <label>q (prime)</label>
              <div className={styles.inputWithButton}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  value={qStr}
                  onChange={(e) => setQStr(digitsOnly(e.target.value))}
                  className={styles.input}
                />
                <button type="button" className={styles.randomBtn} onClick={handleRandomQ} title="Random prime (≠ p)">Random</button>
              </div>
            </div>
            <div className={styles.field}>
              <label>e (public exponent)</label>
              <div className={styles.inputWithButton}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  value={eStr}
                  onChange={(e) => setEStr(digitsOnly(e.target.value))}
                  className={styles.input}
                  placeholder="e.g. 17 or 65537"
                />
                <button type="button" className={styles.randomBtn} onClick={handleRandomE} title="Random valid e">Random</button>
              </div>
            </div>
          </div>
          <KeyGenVisualization keys={keys} error={error} inputPreview={{ p: pStr, q: qStr, e: eStr }} />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Encryption & Decryption</h2>
          <p className={styles.hint}>
            Enter plain text. Encrypted as c = m<sup>e</sup> mod n, decrypted as m = c<sup>d</sup> mod n.
          </p>
          <EncryptDecryptVisualization keys={keys} keysError={error} />
        </section>
      </main>

      <footer className={styles.footer}>
        <p>RSA: Rivest–Shamir–Adleman • n = p×q • φ(n) = (p−1)(q−1) • e⋅d ≡ 1 (mod φ(n))</p>
      </footer>
    </div>
  )
}

export default App

import React from 'react'
import { textToBigInt, bigIntToText, encrypt, decrypt } from '../rsa'
import styles from './EncryptDecryptVisualization.module.css'

export function EncryptDecryptVisualization({ keys }) {
  const [message, setMessage] = React.useState('Hi')
  const [plainNum, setPlainNum] = React.useState(null)
  const [cipherNum, setCipherNum] = React.useState(null)
  const [decryptedNum, setDecryptedNum] = React.useState(null)
  const [decryptedText, setDecryptedText] = React.useState('')
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    if (!keys) {
      setPlainNum(null)
      setCipherNum(null)
      setDecryptedNum(null)
      setDecryptedText('')
      setError(null)
      return
    }
    setError(null)
    try {
      const m = textToBigInt(message)
      if (m >= keys.n) {
        setError(`Message (m) must be less than modulus n (${keys.n}). Use shorter text or larger p, q.`)
        setPlainNum(m)
        setCipherNum(null)
        setDecryptedNum(null)
        setDecryptedText('')
        return
      }
      setPlainNum(m)
      const c = encrypt(m, keys.publicKey)
      setCipherNum(c)
      const m2 = decrypt(c, keys.privateKey)
      setDecryptedNum(m2)
      setDecryptedText(bigIntToText(m2))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    }
  }, [keys, message])

  if (!keys) {
    return (
      <div className={styles.card}>
        <p className={styles.placeholder}>Generate keys first.</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.inputRow}>
        <label className={styles.label}>Plain text</label>
        <input
          type="text"
          className={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Text to encrypt"
        />
      </div>

      <div className={styles.flow}>
        <div className={styles.step}>
          <span className={styles.stepLabel}>m (as number)</span>
          <code className={styles.bigCode}>{plainNum?.toString() ?? '—'}</code>
        </div>
        <div className={styles.arrow}>
          <span>c = m<sup>e</sup> mod n</span>
        </div>
        <div className={styles.step}>
          <span className={styles.stepLabel}>c (ciphertext)</span>
          <code className={styles.bigCode}>{cipherNum?.toString() ?? '—'}</code>
        </div>
        <div className={styles.arrow}>
          <span>m = c<sup>d</sup> mod n</span>
        </div>
        <div className={styles.step}>
          <span className={styles.stepLabel}>m (decrypted)</span>
          <code className={styles.bigCode}>{decryptedNum?.toString() ?? '—'}</code>
        </div>
        <div className={styles.stepHighlight}>
          <span className={styles.stepLabel}>Decrypted text</span>
          <code className={styles.resultText}>{decryptedText || '—'}</code>
        </div>
      </div>
    </div>
  )
}

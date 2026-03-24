import React from 'react'
import { textToBlocks, bigIntToText, encrypt, decrypt, maxCharsPerBlock } from '../rsa'
import styles from './EncryptDecryptVisualization.module.css'

/** Printable / control labels for ASCII reference (0–127). */
function asciiCharLabel(code) {
  if (code === 32) return 'SP'
  if (code === 127) return 'DEL'
  if (code < 32) {
    const names = ['NUL', 'SOH', 'STX', 'ETX', 'EOT', 'ENQ', 'ACK', 'BEL', 'BS', 'TAB', 'LF', 'VT', 'FF', 'CR', 'SO', 'SI', 'DLE', 'DC1', 'DC2', 'DC3', 'DC4', 'NAK', 'SYN', 'ETB', 'CAN', 'EM', 'SUB', 'ESC', 'FS', 'GS', 'RS', 'US']
    return names[code] ?? '—'
  }
  return String.fromCharCode(code)
}

function BlockList({ label, values, className }) {
  if (!values || values.length === 0) {
    return (
      <div className={styles.step}>
        <span className={styles.stepLabel}>{label}</span>
        <code className={styles.bigCode}>—</code>
      </div>
    )
  }
  if (values.length === 1) {
    return (
      <div className={styles.step}>
        <span className={styles.stepLabel}>{label}</span>
        <code className={className || styles.bigCode}>{values[0].toString()}</code>
      </div>
    )
  }
  return (
    <div className={styles.step}>
      <span className={styles.stepLabel}>{label}</span>
      <ul className={styles.blockList}>
        {values.map((v, i) => (
          <li key={i}>
            <span className={styles.blockListIdx}>Block {i + 1}</span>
            <code className={styles.blockListVal}>{v.toString()}</code>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Per-block line: base^exp mod n = result (numeric values only, no m/c letters).
 * @param {object} props
 * @param {string} props.label
 * @param {bigint[]} props.bases - m for encrypt, c for decrypt
 * @param {bigint} props.exp - e or d
 * @param {bigint} props.n
 * @param {bigint[]} props.results - c after encrypt, m after decrypt
 */
function BlockFormulaList({ label, bases, exp, n, results }) {
  const expStr = exp.toString()
  const nStr = n.toString()

  const formulaCode = (base, result) => (
    <code className={styles.blockListVal}>
      {base.toString()}
      <sup className={styles.formulaSup}>{expStr}</sup>
      {' mod '}
      {nStr}
      {' = '}
      {result.toString()}
    </code>
  )

  if (!bases || bases.length === 0 || !results || results.length === 0) {
    return (
      <div className={styles.step}>
        <span className={styles.stepLabel}>{label}</span>
        <code className={styles.bigCode}>—</code>
      </div>
    )
  }
  if (bases.length === 1) {
    return (
      <div className={styles.step}>
        <span className={styles.stepLabel}>{label}</span>
        <div className={styles.blockListSingleFormula}>{formulaCode(bases[0], results[0])}</div>
      </div>
    )
  }
  return (
    <div className={styles.step}>
      <span className={styles.stepLabel}>{label}</span>
      <ul className={styles.blockList}>
        {bases.map((base, i) => (
          <li key={i}>
            <span className={styles.blockListIdx}>Block {i + 1}</span>
            {formulaCode(base, results[i])}
          </li>
        ))}
      </ul>
    </div>
  )
}

function FormulaPlaceholder({ label }) {
  return (
    <div className={styles.step}>
      <span className={styles.stepLabel}>{label}</span>
      <code className={styles.bigCode}>—</code>
    </div>
  )
}

/**
 * @param {object} props
 * @param {object | null} props.keys
 * @param {string | null} [props.keysError] - Message from key generation when keys are invalid.
 */
export function EncryptDecryptVisualization({ keys, keysError }) {
  const [message, setMessage] = React.useState('Hello')
  const [showAsciiTable, setShowAsciiTable] = React.useState(false)
  const [plainBlocks, setPlainBlocks] = React.useState([])
  const [cipherBlocks, setCipherBlocks] = React.useState([])
  const [decryptedBlocks, setDecryptedBlocks] = React.useState([])
  const [decryptedText, setDecryptedText] = React.useState('')
  const [error, setError] = React.useState(null)
  const [charsPerBlock, setCharsPerBlock] = React.useState(1)

  React.useEffect(() => {
    if (!keys) {
      setPlainBlocks([])
      setCipherBlocks([])
      setDecryptedBlocks([])
      setDecryptedText('')
      setError(null)
      return
    }
    setError(null)
    try {
      const k = maxCharsPerBlock(keys.n)
      setCharsPerBlock(k)
      if (k === 0) {
        setError('Modulus n is too small for byte-wise encoding. Increase p and q.')
        setPlainBlocks([])
        setCipherBlocks([])
        setDecryptedBlocks([])
        setDecryptedText('')
        return
      }
      const blocks = textToBlocks(message, keys.n)
      setPlainBlocks(blocks)
      if (blocks.length === 0) {
        setCipherBlocks([])
        setDecryptedBlocks([])
        setDecryptedText('')
        return
      }
      const cs = blocks.map((m) => encrypt(m, keys.publicKey))
      setCipherBlocks(cs)
      const ms = cs.map((c) => decrypt(c, keys.privateKey))
      setDecryptedBlocks(ms)
      setDecryptedText(ms.map((b) => bigIntToText(b)).join(''))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
      setPlainBlocks([])
      setCipherBlocks([])
      setDecryptedBlocks([])
      setDecryptedText('')
    }
  }, [keys, message])

  const blockNote =
    !keys
      ? null
      : message.length === 0
        ? 'Empty message.'
        : `${plainBlocks.length} block${plainBlocks.length === 1 ? '' : 's'} · up to ${charsPerBlock} character${charsPerBlock === 1 ? '' : 's'} per block (each value less than n = ${keys.n.toString()}).`

  return (
    <div className={styles.wrapper}>
      {!keys && (
        <div className={styles.keysHint} role="status">
          {keysError
            ? 'Fix the key values in section 1 to enable encryption steps.'
            : 'Enter valid p, q, and e in section 1 to see ciphertext and decryption here.'}
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.inputRow}>
        <label className={styles.label}>Plain text</label>
        <p className={styles.encodingHint}>
          Each character is a byte; blocks are packed in base-256. If the whole message would be one number
          greater than or equal to <strong>n</strong>, the app splits it into blocks so each block’s numeric value is
          strictly less than <strong>n</strong>. Each block is encrypted separately (<strong>c = m^e mod n</strong>), then decrypted and
          rejoined. Real systems use the same idea (fixed-size chunks or hybrid encryption).
        </p>
        <input
          type="text"
          className={styles.input}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Text to encrypt"
        />
      </div>

      <div className={styles.asciiSection}>
        <button
          type="button"
          className={styles.asciiToggle}
          onClick={() => setShowAsciiTable((v) => !v)}
          aria-expanded={showAsciiTable}
        >
          {showAsciiTable ? 'Hide ASCII table' : 'Show ASCII table'}
        </button>
        {showAsciiTable && (
          <div className={styles.asciiPanel}>
            <p className={styles.asciiPanelIntro}>
              Standard ASCII (0–127). Each character’s <strong>decimal code</strong> is the byte used in <strong>m</strong> (base-256 packing).
            </p>
            <div className={styles.asciiGrid}>
              {Array.from({ length: 128 }, (_, code) => (
                <div key={code} className={styles.asciiCell} title={`Code ${code}`}>
                  <span className={styles.asciiCellCode}>{code}</span>
                  <span className={styles.asciiCellChar}>{asciiCharLabel(code)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.flow}>
        {keys && message.length > 0 && !error && blockNote && (
          <p className={styles.blockBanner}>{blockNote}</p>
        )}
        <BlockList label="m (as number, per block)" values={plainBlocks} />
        <div className={styles.arrow}>
          <span>c = m<sup>e</sup> mod n (per block)</span>
        </div>
        {keys ? (
          <BlockFormulaList
            label="c (ciphertext, per block)"
            bases={plainBlocks}
            exp={keys.publicKey.e}
            n={keys.n}
            results={cipherBlocks}
          />
        ) : (
          <FormulaPlaceholder label="c (ciphertext, per block)" />
        )}
        <div className={styles.arrow}>
          <span>m = c<sup>d</sup> mod n (per block)</span>
        </div>
        {keys ? (
          <BlockFormulaList
            label="m (decrypted, per block)"
            bases={cipherBlocks}
            exp={keys.privateKey.d}
            n={keys.n}
            results={decryptedBlocks}
          />
        ) : (
          <FormulaPlaceholder label="m (decrypted, per block)" />
        )}
        <div className={styles.stepHighlight} style={{ marginTop: '2em' }}>
          <span className={styles.stepLabel}>Decrypted text</span>
          <code className={styles.resultText}>{decryptedText || (message.length === 0 ? '—' : '')}</code>
        </div>
      </div>
    </div>
  )
}

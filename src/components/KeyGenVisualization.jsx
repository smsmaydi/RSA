import React, { useState, useMemo } from 'react'
import { getDByPhiMultiplesSteps } from '../rsa'
import styles from './KeyGenVisualization.module.css'

/** Show every attempt in the panel; beyond this, show first/last chunk + ellipsis (keeps DOM small for large e). */
const MAX_INLINE_PHI_ATTEMPTS = 22

function PhiAttemptCard({ row, e }) {
  const { k, kPhi, plusOne, remainder, divisible } = row
  return (
    <div className={divisible ? styles.dStepCardHighlight : styles.dStepCard}>
      <span className={styles.dStepNum}>k = {k.toString()}</span>
      <p className={styles.dStepFormula}>
        {k.toString()}×φ(n) = {kPhi.toString()} → +1 → {plusOne.toString()}
      </p>
      <p className={styles.dStepLine}>
        {plusOne.toString()} mod {e.toString()} = {remainder.toString()}
        {divisible ? (
          <>
            {' '}
            → divisible by {e.toString()}, so <strong>d</strong> = {plusOne.toString()} ÷ {e.toString()} ={' '}
            <strong>{(plusOne / e).toString()}</strong>
          </>
        ) : (
          <> → not divisible; try the next k.</>
        )}
      </p>
    </div>
  )
}

export function KeyGenVisualization({ keys, error }) {
  const [showDSteps, setShowDSteps] = useState(false)

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.error}>{error}</div>
      </div>
    )
  }

  if (!keys) {
    return (
      <div className={styles.card}>
        <p className={styles.placeholder}>Enter p, q and e to generate keys.</p>
      </div>
    )
  }

  const { p, q, n, phi, e, d } = keys
  const phiMultiples = useMemo(() => getDByPhiMultiplesSteps(phi, e), [phi, e])

  const attemptChunks = useMemo(() => {
    const { attempts } = phiMultiples
    if (attempts.length <= MAX_INLINE_PHI_ATTEMPTS) {
      return { mode: 'all', rows: attempts }
    }
    const head = 5
    const tail = 1
    return {
      mode: 'collapsed',
      headRows: attempts.slice(0, head),
      skipped: attempts.length - head - tail,
      tailRows: attempts.slice(-tail),
    }
  }, [phiMultiples])

  return (
    <div className={styles.wrapper}>
      <div className={styles.flow}>
        <div className={styles.step}>
          <span className={styles.label}>1. Prime numbers</span>
          <div className={styles.formula}>
            <code>p = {p.toString()}</code>
            <code>q = {q.toString()}</code>
          </div>
        </div>
        <div className={styles.arrow}>↓</div>
        <div className={styles.step}>
          <span className={styles.label}>2. Modulus</span>
          <div className={styles.formula}>
            <code>n = p × q = {n.toString()}</code>
          </div>
        </div>
        <div className={styles.arrow}>↓</div>
        <div className={styles.step}>
          <span className={styles.label}>3. Euler totient</span>
          <div className={styles.formula}>
            <code>φ(n) = (p−1)(q−1) = {phi.toString()}</code>
          </div>
        </div>
        <div className={styles.arrow}>↓</div>
        <div className={styles.step}>
          <div className={styles.labelRow}>
            <span className={styles.label}>4. Public exponent (e) and private exponent (d)</span>
            <button
              type="button"
              className={styles.helpIcon}
              onClick={() => setShowDSteps((v) => !v)}
              title="How is d calculated?"
              aria-label="Show d calculation steps"
            >
              ?
            </button>
          </div>
          <div className={styles.formula}>
            <code>e = {e.toString()}</code>
            <code>d ≡ e⁻¹ (mod φ(n)) = {d.toString()}</code>
          </div>
        </div>
      </div>

      {showDSteps && (
        <div className={styles.dStepsPanel}>
          <h3 className={styles.dStepsTitle}>How is d calculated?</h3>

          <div className={styles.dStepBlock}>
            <span className={styles.dStepTag}>The idea</span>
            <p>
              We need <strong>d</strong> such that <strong>e · d ≡ 1 (mod φ(n))</strong>. That means <strong>e · d = 1 + k · φ(n)</strong> for some whole number <strong>k ≥ 1</strong>. So we list numbers <strong>k · φ(n) + 1</strong> for k = 1, 2, 3, … and stop at the first one that <strong>e</strong> divides exactly; then <strong>d = (k · φ(n) + 1) / e</strong>.
            </p>
          </div>

          <div className={styles.dStepBlock}>
            <span className={styles.dStepTag}>Multiples of φ(n), then +1</span>
            <p>
              φ(n) = <strong>{phi.toString()}</strong>, e = <strong>{e.toString()}</strong>. For each k, form <strong>k · φ(n)</strong>, add 1, and check whether the result is divisible by e.
            </p>
          </div>

          {phiMultiples.d === null ? (
            <div className={styles.dStepBlock}>
              <p className={styles.dStepLine}>No suitable k was found (this should not happen for a valid RSA key).</p>
            </div>
          ) : (
            <>
              {attemptChunks.mode === 'all'
                ? attemptChunks.rows.map((row) => (
                    <PhiAttemptCard key={row.k.toString()} row={row} e={e} />
                  ))
                : (
                    <>
                      {attemptChunks.headRows.map((row) => (
                        <PhiAttemptCard key={row.k.toString()} row={row} e={e} />
                      ))}
                      <p className={styles.dStepEllipsis}>
                        … {attemptChunks.skipped} more values of k (same pattern: k · φ(n) + 1, then check remainder mod e) …
                      </p>
                      {attemptChunks.tailRows.map((row) => (
                        <PhiAttemptCard key={row.k.toString()} row={row} e={e} />
                      ))}
                    </>
                  )}
            </>
          )}
        </div>
      )}

      <div className={styles.keys}>
        <div className={styles.keyBox}>
          <span className={styles.keyTitle}>🔓 Public key</span>
          <code>(e, n) = ({e.toString()}, {n.toString()})</code>
        </div>
        <div className={styles.keyBox}>
          <span className={styles.keyTitle}>🔐 Private key</span>
          <code>(d, n) = ({d.toString()}, {n.toString()})</code>
        </div>
      </div>
    </div>
  )
}

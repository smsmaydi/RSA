import React, { useState } from 'react'
import { getExtendedGcdSteps } from '../rsa'
import styles from './KeyGenVisualization.module.css'

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
  const { steps: gcdSteps } = getExtendedGcdSteps(phi, e)

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
              We need a number <strong>d</strong> so that when you multiply <strong>e</strong> by <strong>d</strong> and take the remainder after dividing by <strong>φ(n)</strong>, you get 1. In maths: <strong>e · d ≡ 1 (mod φ(n))</strong>. So d is the “inverse” of e in clock arithmetic with φ(n).
            </p>
          </div>

          <div className={styles.dStepBlock}>
            <span className={styles.dStepTag}>Greatest common divisor (gcd)</span>
            <p>
              The <strong>greatest common divisor</strong> of two numbers is the largest integer that divides both. For RSA we chose e so that gcd(φ(n), e) = 1 (they have no common factor). The Extended Euclidean Algorithm finds this gcd by repeatedly dividing and keeping the remainder.
            </p>
          </div>

          <div className={styles.dStepBlock}>
            <span className={styles.dStepTag}>Step by step</span>
            <p>
              We start with <strong>φ(n) = {phi.toString()}</strong> and <strong>e = {e.toString()}</strong>. In each step we divide the bigger by the smaller and take the <strong>remainder</strong>. At the same time we keep a number called the <strong>coefficient of e</strong>: it is the number such that <strong>remainder = φ(n)×(…) + e×(coefficient of e)</strong>. When the remainder becomes <strong>1</strong>, that coefficient (mod φ(n)) is exactly <strong>d</strong>.
            </p>
          </div>

          {gcdSteps.map((row, i) => {
            const isRemainderOne = row.r === 1n
            return (
              <div key={row.stepNum} className={isRemainderOne ? styles.dStepCardHighlight : styles.dStepCard}>
                <span className={styles.dStepNum}>Step {row.stepNum}</span>
                <p className={styles.dStepLine}>
                  We divide <strong>φ(n) = {row.phiVal.toString()}</strong> by <strong>e = {row.eVal.toString()}</strong>:
                </p>
                <p className={styles.dStepFormula}>
                  {row.phiVal.toString()} = {row.eVal.toString()} × {row.quotient.toString()} + {row.r.toString()}  →  remainder = <code>{row.r.toString()}</code>
                </p>
                <p className={styles.dStepLine}>
                  The algorithm also computes the <strong>coefficient of e</strong> for this remainder (using the formula: new coefficient = previous − quotient × previous previous). Here: <strong>coefficient of e = {row.coeffE.toString()}</strong>. So we have: remainder {row.r.toString()} = φ(n)×(…) + e×({row.coeffE.toString()}).
                </p>
                {isRemainderOne && (
                  <p className={styles.dStepBridge}>
                    → Because the remainder is <strong>1</strong>, we get <strong>1 = φ(n)×(…) + e×({row.coeffE.toString()})</strong>, so <strong>e×({row.coeffE.toString()}) ≡ 1 (mod φ(n))</strong>. So the inverse of e modulo φ(n) is {row.coeffE.toString()}. We take it mod φ(n) to get a positive number: <strong>d = {d.toString()}</strong>.
                  </p>
                )}
                {!isRemainderOne && i < gcdSteps.length - 1 && (
                  <p className={styles.dStepLine}>Next step: we repeat with the smaller number and this remainder.</p>
                )}
                {row.r === 0n && (
                  <p className={styles.dStepLine}>Remainder 0 → we stop. The gcd is the previous remainder (1). The d we need came from the previous step (when remainder was 1).</p>
                )}
              </div>
            )
          })}

          <div className={styles.dStepBlock}>
            <span className={styles.dStepTag}>Summary: from the steps to d</span>
            <p>
              The divisions give us remainders. The “coefficient of e” is updated each time so that <strong>remainder = φ(n)×(something) + e×(coefficient of e)</strong>. The step where <strong>remainder = 1</strong> is the important one: there we have <strong>1 = e×(coefficient of e) + φ(n)×(something)</strong>, so <strong>e × (coefficient of e) ≡ 1 (mod φ(n))</strong>. So that coefficient is the inverse of e; we write it as a positive number less than φ(n), and that is <strong>d = {d.toString()}</strong>. Check: e × d = {(e * d).toString()}; remainder when divided by φ(n) = {phi.toString()} is {(e * d % phi).toString()} (should be 1).
            </p>
          </div>
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

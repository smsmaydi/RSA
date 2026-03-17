# RSA Cryptosystem Visualizer

React (Vite + TypeScript) example project that visualizes RSA key generation, encryption and decryption steps.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173` (or the port shown in the terminal) in your browser.

## Features

- **Key generation**: Enter p, q (primes) and e; n, φ(n), d and public/private key pair are shown step by step.
- **Encryption / Decryption**: Enter plain text; the flow m → c = m^e mod n → m = c^d mod n and numeric values are computed live.

## Note

With small p, q (e.g. 61, 53), n is small; the numeric value of the message must be less than n. Use larger primes for longer text or keep the message short.

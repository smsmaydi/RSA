# RSA Cryptosystem Visualizer

A small **React** app that shows step-by-step how the **RSA** cryptosystem works: key generation, encryption, and decryption. You can try different numbers and see the maths in real time.

---

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (e.g. `http://localhost:5173`) in your browser.

---

## What is RSA?

**RSA** is a way to encrypt and decrypt messages using two keys:

- A **public key** – anyone can use it to encrypt. You can share it.
- A **private key** – only you have it. You use it to decrypt.

Important idea: something encrypted with the public key can only be decrypted with the private key. So people send you encrypted messages with your public key, and only you can read them with your private key.

---

## How does key generation work?

The app lets you choose three numbers and then computes the rest.

### 1. Choose two primes: **p** and **q**

- **Prime** = number greater than 1 that is only divisible by 1 and itself (e.g. 2, 3, 5, 7, 11, 61, 53).
- In the app you type **p** and **q** (e.g. 61 and 53). You can use the **Random** button to pick primes from a list.

### 2. Compute **n** (the modulus)

- **n = p × q**
- Example: if p = 61 and q = 53, then n = 3233.
- **n** is part of both the public and the private key. It is the “size” of the numbers we work with.

### 3. Compute **φ(n)** (Euler’s totient)

- **φ(n) = (p − 1) × (q − 1)**
- Example: φ(n) = 60 × 52 = 3120.
- This number is used to build the keys but is **not** published.

### 4. Choose **e** (public exponent)

- **e** is a number between 2 and φ(n)−1 that has no common factor with φ(n) (we say “e and φ(n) are coprime”).
- Often people use **e = 17** or **e = 65537**.
- **(e, n)** together are the **public key**.

### 5. Compute **d** (private exponent)

- **d** is the number such that: **e × d ≡ 1 (mod φ(n))**.
- In words: when you multiply e by d and take the remainder after dividing by φ(n), you get 1. So **d** is the “inverse” of **e** in clock arithmetic with φ(n).
- We find **d** using the **Extended Euclidean Algorithm** (the app shows the steps when you click **?** next to **d**).
- **(d, n)** together are the **private key**.

Summary: you pick **p**, **q**, and **e**. The app computes **n**, **φ(n)**, and **d**, and shows you the public key (e, n) and private key (d, n).

---

## How does encryption and decryption work?

### Encryption (with the public key)

- Turn your message into a number **m** (e.g. letter by letter into digits).
- Compute **c = m^e mod n**. This is the **ciphertext**.
- Only someone who knows **d** can get back **m** from **c**.

### Decryption (with the private key)

- You receive **c**.
- Compute **m = c^d mod n**. This gives back the original number **m**, and then you turn it back into text.

Why it works (short version): **m^(e×d) ≡ m (mod n)** because we chose **d** so that **e×d ≡ 1 (mod φ(n))**. So encrypting with **e** and then decrypting with **d** returns the original **m**.

---

## What does the app show?

1. **Key generation**
   - Inputs: **p**, **q**, **e** (with Random buttons).
   - The app shows **n**, **φ(n)**, **d**, and the two keys.
   - Click **?** next to **d** to see how **d** is found step by step (Extended Euclidean Algorithm).

2. **Encryption & decryption**
   - You type a short message.
   - The app converts it to a number **m**, then shows **c = m^e mod n**, then **m again = c^d mod n**, and the decrypted text.

---

## Project structure (simple)

| Path | What it is |
|------|------------|
| `index.html` | Entry HTML; loads the React app. |
| `src/main.jsx` | Starts the React app and mounts it in `#root`. |
| `src/App.jsx` | Main page: inputs for p, q, e and the two sections (key generation + encrypt/decrypt). |
| `src/rsa.js` | All RSA logic: prime check, key generation, encrypt, decrypt, Extended Euclidean steps, random primes. |
| `src/components/KeyGenVisualization.jsx` | Renders the key-generation steps and the “?” panel that explains how **d** is computed. |
| `src/components/EncryptDecryptVisualization.jsx` | Renders the plain text input and the encryption/decryption flow (m → c → m). |
| `src/*.css` | Styles for the app and components. |
| `vite.config.js` | Vite config (build tool). |

So: **App.jsx** is the UI and state; **rsa.js** is the maths; the two visualization components show the key generation and the encrypt/decrypt steps.

---

## Message length and blocks

RSA requires each plaintext number **m** to satisfy **m &lt; n**. The app does **not** force you to type only one character:

- It computes how many characters fit in one block (base-256 packing) so the block value stays **&lt; n**.
- Long text is **split into several blocks**; each block is encrypted with **c = m^e mod n** and decrypted separately, then the pieces are concatenated.

With small **n** (e.g. 3233), each block holds **one** character, so “Hello” becomes five blocks. With larger **p** and **q**, **n** grows and **several characters per block** are possible (fewer ciphertext numbers for the same message).

---

## Commands

| Command | What it does |
|--------|----------------|
| `npm install` | Install dependencies. |
| `npm run dev` | Start the app in development mode (with hot reload). |
| `npm run build` | Build for production (output in `dist/`). |
| `npm run preview` | Serve the production build locally. |

---

## License

This project is for learning. Use it freely to understand RSA.

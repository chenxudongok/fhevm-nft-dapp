# 🧠 Zama Mint DApp (Full SDK Version)

This React + Vite DApp integrates **@zama-fhe/relayer-sdk/bundle** with automatic initialization on **Sepolia**.

## 🪄 Features
- Connect MetaMask (shows short address + disconnect option)
- Fill contract address + image URL
- Mint NFT (calls `safeMint` / `mint` / `mintNFT` automatically)
- Zama SDK auto-initialized using `SepoliaConfig`
- Vercel-compatible (no build issues)

## 🚀 Local Development
```bash
npm install
npm run dev
```
Then open [http://localhost:5173](http://localhost:5173)

## 🌐 Deploy to Vercel
- Build Command: `npm run build`
- Output Directory: `dist`

## ⚙️ Notes
You can modify `App.jsx` to interact with your own smart contract and customize the relayer configuration.

# ZAMA NFT DApp

**ZAMA NFT DApp** is a decentralized application built on the **Ethereum Sepolia Test Network**, allowing users to mint unique **ZAMA mascot NFTs**. Each NFT represents wisdom and curiosity, combining digital art with collectible value.

---

## Features

### Connect Wallet
Connect your wallet via MetaMask, with automatic network switching to Sepolia Test Network.

### Decentralized Minting
Mint ZAMA NFTs directly through the smart contract. Metadata is encrypted to ensure uniqueness and security.

### Smooth Interactive Experience
- **React + Framer Motion** for dynamic animations  
- **react-confetti** celebrates successful minting  
- **ethers.js** handles smart contract calls and real-time transaction status  

### Transaction Explorer Links
After minting, view the transaction hash and click to open it on the Sepolia blockchain explorer.

### Powered by Zama Relayer SDK
Simplifies smart contract interactions and transaction handling, ensuring secure and efficient operations.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/fhevm-nft-dapp.git
cd fhevm-nft-dapp
Install dependencies:

bash
复制代码
npm install
Start the development server:

bash
复制代码
npm start
Your DApp should now be running at http://localhost:3000.

Usage
Install MetaMask and connect to the Sepolia Test Network.

Open the DApp and click Connect Wallet.

Click Mint ZAMA-NFT to mint your NFT.

View the transaction hash and enjoy the confetti animation!

Deployment on Vercel
Make sure your package.json includes:

json
复制代码
{
  "type": "module",
  "homepage": "."
}
Build the project:

bash
复制代码
npm run build
Deploy the build folder to Vercel as a static site.

Known Issues
Zama Relayer SDK Import Error:

java
复制代码
Failed to resolve entry for package "@zama-fhe/relayer-sdk".
The package may have incorrect main/module/exports specified in its package.json.
Solution: Use ESM import instead of CommonJS:

js
复制代码
import { Relayer } from "@zama-fhe/relayer-sdk";
Ensure your bundler (Vite, Webpack) supports package exports.

Mint button may be disabled if MetaMask is not installed or the wallet is not connected.

License
This project is MIT Licensed.

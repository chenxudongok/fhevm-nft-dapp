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

## Zama Technology Highlights (Powered by Zama)

**ZAMA NFT DApp** leverages Zama protocol and Relayer SDK to enhance smart contract interactions, security, and user experience:

1. **Zama Relayer SDK**  
   - Simplifies smart contract interactions and transaction management, so users do not need to handle complex gas or transaction signing manually.  
   - Provides transaction status queries and callbacks, allowing the frontend to display mint status in real time.

2. **Encrypted Metadata Handling (FHE Support)**  
   - Uses Zama’s **Fully Homomorphic Encryption (FHE)** capabilities to encrypt NFT metadata (name, description).  
   - Ensures all NFT metadata is secure, private, and immutable.

3. **Network Compatibility**  
   - Frontend can seamlessly connect to Ethereum Sepolia Test Network or mainnet.  
   - Supports automatic network switching to ensure users can transact immediately after connecting their wallet.

4. **Transaction Security and Simplified Flow**  
   - Relayer SDK supports **delegated transactions**, reducing user steps.  
   - Built-in error handling and transaction retry mechanisms improve DApp stability.

5. **Frontend Integration and User Experience**  
   - SDK integrates with **React + ethers.js**, enabling one-click minting and real-time transaction status display.  
   - After successful minting, the transaction hash is displayed with a clickable link to the blockchain explorer and celebratory confetti animations.

---

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/fhevm-nft-dapp.git
cd fhevm-nft-dapp

Install dependencies:
npm install

Start the development server:
npm start

Your DApp should now be running at http://localhost:3000
.



Usage

Install MetaMask and connect to the Sepolia Test Network.

Open the DApp and click Connect Wallet.

Click Mint ZAMA-NFT to mint your NFT.

View the transaction hash and enjoy the confetti animation!

Deployment on Vercel

Make sure your package.json includes:
{
  "type": "module",
  "homepage": "."
}

Build the project:
npm run build


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';

export default function App() {
  const [tokenURI, setTokenURI] = useState('https://placekitten.com/512/512'); // 🐱 Placeholder image
  const [status, setStatus] = useState('');
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setStatus('🦊 Please install MetaMask!');
      return;
    }
    try {
      const [selectedAccount] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(selectedAccount);
      setStatus(`✅ Connected: ${selectedAccount.substring(0, 6)}...${selectedAccount.slice(-4)}`);
    } catch (error) {
      setStatus('❌ Connection failed.');
    }
  };

  const mintNFT = async () => {
    if (!account) {
      setStatus('⚠️ Please connect your wallet first.');
      return;
    }
    setStatus('⏳ Simulating mint...');
    await new Promise((r) => setTimeout(r, 2000));
    setStatus('✅ NFT minted successfully!');
  };

  const viewEncryptedCount = async () => {
    if (!account) {
      setStatus('⚠️ Please connect your wallet first.');
      return;
    }
    setStatus('🔐 Encrypted mint count: (ciphertext example) 0x8a2f...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md text-center"
      >
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          🔐 Encrypted NFT DApp
        </h1>
        <p className="text-gray-500 mb-6">
          Mint your NFT using Zama FHEVM encryption.
        </p>

        <img
          src={tokenURI}
          alt="Zama Mascot NFT"
          className="w-64 h-64 object-contain mx-auto mb-6 rounded-xl shadow-md"
        />

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={connectWallet}
          className="bg-gray-800 hover:bg-gray-900 text-white w-full py-3 rounded-xl mb-4 font-medium shadow-md"
        >
          {account ? 'Wallet Connected' : 'Connect Wallet'}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={mintNFT}
          className="bg-pink-500 hover:bg-pink-600 text-white w-full py-3 rounded-xl mb-3 font-medium shadow-md"
        >
          Mint NFT
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={viewEncryptedCount}
          className="bg-purple-500 hover:bg-purple-600 text-white w-full py-3 rounded-xl font-medium shadow-md"
        >
          View Encrypted Mint Count
        </motion.button>

        {status && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-gray-700 font-semibold"
          >
            {status}
          </motion.p>
        )}
      </motion.div>

      <footer className="mt-8 text-sm text-gray-400">
        Built with ❤️ using Zama FHEVM SDK
      </footer>
    </div>
  );
}

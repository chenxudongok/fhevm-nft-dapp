import React, { useState } from "react";
import { ethers } from "ethers";
import { Relayer } from "@zama-fhe/relayer-sdk";

const App = () => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [minting, setMinting] = useState(false);

  const NFT_CONTRACT_ADDRESS = "YOUR_NFT_CONTRACT_ADDRESS_HERE";
  const NFT_IMAGE_URL = "";

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setProvider(new ethers.BrowserProvider(window.ethereum));
        setAccount(accounts[0]);
      } catch (err) {
        console.error("Wallet connection error:", err);
      }
    } else {
      alert("Please install MetaMask first!");
    }
  };

  const mintNFT = async () => {
    if (!account) return;
    setMinting(true);
    try {
      const relayer = new Relayer({ signer: provider.getSigner() });
      const tx = await relayer.mintNFT({
        contractAddress: NFT_CONTRACT_ADDRESS,
        to: account,
        metadataURI:
          NFT_IMAGE_URL ||
          "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='300' height='300' fill='%23724bff'/></svg>",
      });
      console.log("Mint tx:", tx);
      await tx.wait();
      alert("🎉 NFT Mint Successful!");
    } catch (err) {
      console.error("Minting error:", err);
      alert("Mint failed.");
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-indigo-900 to-black flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-5xl font-extrabold mb-8 drop-shadow-lg">🧬 FHE NFT DApp</h1>

      <div className="relative group">
        <div className="w-80 h-80 rounded-2xl overflow-hidden shadow-2xl border-2 border-purple-400 transform group-hover:scale-105 transition duration-300">
          <img
            src={
              NFT_IMAGE_URL ||
              "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='300' height='300' fill='%232b1f4f'/></svg>"
            }
            alt="NFT Preview"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-10">
        <button
          onClick={connectWallet}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-lg font-semibold hover:scale-105 hover:shadow-[0_0_25px_#a855f7] transition-all duration-300"
        >
          {account ? "✅ Wallet Connected" : "🔗 Connect Wallet"}
        </button>

        <button
          onClick={mintNFT}
          disabled={!account || minting}
          className={`px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-300 ${
            !account
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-cyan-400 to-blue-600 hover:scale-105 hover:shadow-[0_0_25px_#22d3ee]"
          }`}
        >
          {minting ? "⏳ Minting..." : "💎 Mint NFT"}
        </button>
      </div>

      {account && (
        <p className="mt-6 text-gray-300 text-sm">
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </p>
      )}

      <footer className="mt-10 text-gray-500 text-xs">
        Powered by Zama FHE • EVM Privacy Tech
      </footer>
    </div>
  );
};

export default App;

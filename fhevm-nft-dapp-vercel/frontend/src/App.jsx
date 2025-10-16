import React, { useState } from "react";
import { ethers } from "ethers";

const NFT_IMAGE_URL = ""; // 填 NFT 图片 URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "/api/mint";

export default function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) return alert("请安装 MetaMask");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setWalletAddress(accounts[0]);
  };

  const mintNFT = async () => {
    if (!walletAddress) return alert("请先连接钱包");
    setLoading(true);
    setStatus("Minting NFT...");

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      const data = await res.json();
      if (data.success) setStatus(`✅ Mint 成功! txHash: ${data.txHash}`);
      else setStatus(`❌ Mint 失败: ${data.error}`);
    } catch (err) {
      setStatus(`❌ Mint 失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <h1 className="text-5xl font-bold mb-6">🎨 Zama FHE NFT Mint DApp</h1>

      <div
        className={`w-72 h-72 rounded-2xl shadow-2xl mb-8 ${
          NFT_IMAGE_URL
            ? "bg-cover bg-center"
            : "bg-gradient-to-br from-purple-400 to-pink-500"
        }`}
        style={NFT_IMAGE_URL ? { backgroundImage: `url(${NFT_IMAGE_URL})` } : {}}
      ></div>

      {!walletAddress ? (
        <button onClick={connectWallet} className="px-8 py-3 bg-yellow-400 rounded-full font-bold">
          连接钱包
        </button>
      ) : (
        <button
          onClick={mintNFT}
          disabled={loading}
          className={`px-8 py-3 rounded-full font-bold ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500"
          }`}
        >
          {loading ? "铸造中..." : "Mint NFT 💎"}
        </button>
      )}

      <p className="mt-6">{status}</p>
    </div>
  );
}

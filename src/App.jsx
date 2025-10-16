import React, { useState } from "react";
import { ethers } from "ethers";
import { Relayer } from "@zama-fhe/relayer-sdk";

const NFT_CONTRACT_ADDRESS = ""; // ← 填写你的 NFT 合约地址
const NFT_IMAGE_URL = ""; // ← 填写 NFT 图片 URL（留空时用渐变背景）

export default function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("请先安装 MetaMask!");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setWalletAddress(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const mintNFT = async () => {
    if (!NFT_CONTRACT_ADDRESS) {
      alert("请先设置 NFT_CONTRACT_ADDRESS!");
      return;
    }
    setLoading(true);
    setStatus("正在通过 Zama Relayer 铸造 NFT...");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const relayer = new Relayer({ network: "sepolia" });
      await relayer.initialize();

      const contract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        ["function mint(address to) public returns (uint256)"],
        signer
      );

      const tx = await contract.mint(walletAddress);
      await tx.wait();

      setStatus("✅ Mint 成功！");
    } catch (error) {
      console.error(error);
      setStatus("❌ Mint 失败，请查看控制台日志。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <h1 className="text-5xl font-bold mb-6 drop-shadow-lg">
        🎨 Zama FHE NFT Mint DApp
      </h1>

      <div
        className={\`w-72 h-72 rounded-2xl shadow-2xl mb-8 transition-all duration-500 \${NFT_IMAGE_URL
          ? "bg-cover bg-center"
          : "bg-gradient-to-br from-purple-400 to-pink-500"}\`}
        style={NFT_IMAGE_URL ? { backgroundImage: \`url(\${NFT_IMAGE_URL})\` } : {}}
      ></div>

      <div className="flex gap-6">
        {!walletAddress ? (
          <button
            onClick={connectWallet}
            className="px-8 py-3 bg-yellow-400 text-black rounded-full font-bold hover:bg-yellow-300 transition-all shadow-md"
          >
            连接钱包 🔗
          </button>
        ) : (
          <button
            onClick={mintNFT}
            disabled={loading}
            className={\`px-8 py-3 rounded-full font-bold shadow-md transition-all \${loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-400"}\`}
          >
            {loading ? "铸造中..." : "Mint NFT 💎"}
          </button>
        )}
      </div>

      <p className="mt-6 text-sm opacity-80">{status}</p>
      {walletAddress && (
        <p className="mt-2 text-xs text-gray-200">已连接: {walletAddress}</p>
      )}
    </div>
  );
}

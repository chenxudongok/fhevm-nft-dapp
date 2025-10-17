import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import "./index.css";

const CONTRACT_ADDRESS = "0x21e63270f85f81fb81f2c2319c6bb52f9015881d";
const ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "bytes", name: "encryptedMetadata", type: "bytes[]" }
    ],
    name: "mintWithEncryptedMetadata",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  }
];

const NFT_NAME = "Zama-Beyond: Two Souls";
const NFT_DESC = "The official ZAMA mascot NFT, symbolizing wisdom and curiosity, a unique digital collectible.";
const catImage = "https://i.imgur.com/YUeySct.png";

let fheInstance = null;

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [fheReady, setFheReady] = useState(false);
  const [minting, setMinting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState("");
  const { width, height } = useWindowSize();

  // 初始化 Zama SDK
  useEffect(() => {
  const loadFHE = async () => {
    if (!window.startFHE) {
      console.error("Zama SDK loader not found");
      return;
    }
    try {
      await window.startFHE();
      fheInstance = window.fheInstance;
      setFheReady(true);
      console.log("✅ Zama SDK Ready");
    } catch (err) {
      console.error("加载 Zama SDK 失败:", err);
    }
  };

  // 等待 DOM Ready 再执行（防止 Vercel SSR 环境提前运行）
  if (document.readyState === "complete") {
    loadFHE();
  } else {
    window.addEventListener("load", loadFHE);
    return () => window.removeEventListener("load", loadFHE);
  }
}, []);

  const shortenAddress = (address) =>
    address ? address.slice(0,6) + "..." + address.slice(-4) : "";

  const getContract = (signer) => new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const connectWallet = async () => {
    if (!window.ethereum) { alert("Please install MetaMask!"); return; }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
    } catch(err) {
      console.error(err);
      alert("Failed to connect wallet: " + err.message);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setShowFireworks(false);
    setTxHash(null);
  };

  const handleMint = async () => {
    if (!walletAddress) { alert("Please connect wallet first"); return; }
    if (!fheReady) { alert("SDK initializing, please wait..."); return; }

    setMinting(true);
    setProgress(0);
    setToast("Encrypting and preparing transaction...");
    setTimeout(() => setToast(""), 20000);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);

      const encodedText = ethers.toUtf8Bytes(`${NFT_NAME} - ${NFT_DESC}`);
      const chunkSize = 32;
      let ciphertextHandles = [];

      for (let i = 0; i < encodedText.length; i += chunkSize) {
        const chunk = encodedText.slice(i, i + chunkSize);
        const buffer = fheInstance.createEncryptedInput(CONTRACT_ADDRESS, await signer.getAddress());
        for (let j = 0; j < chunk.length; j++) {
          buffer.add64(BigInt(chunk[j]));
        }
        const ciphertext = await buffer.encrypt();
        ciphertextHandles.push(...ciphertext.handles);
        setProgress(Math.min(100, Math.floor(((i + chunk.length) / encodedText.length) * 100)));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const tx = await contract.mintWithEncryptedMetadata(
        await signer.getAddress(),
        ciphertextHandles,
        { gasLimit: 11800_000 }
      );

      setTxHash(tx.hash);
      setShowFireworks(true);
    } catch(err) {
      console.error(err);
      alert("Mint failed: " + err.message);
    } finally {
      setMinting(false);
      setProgress(0);
      setToast("");
    }
  };

  
  return (
    <div style={{ textAlign:"center", padding:"2rem", position:"relative", fontFamily: "Arial, sans-serif" }}>
      {showFireworks && <Confetti width={width} height={height} />}

      {/* 钱包按钮 */}
      <div style={{ position:"absolute", top:"1rem", right:"1rem" }}>
        <button
          style={{
            padding:"0.5rem 1rem",
            borderRadius:"1rem",
            cursor: walletAddress ? "pointer" : "pointer",
            border:"none",
            backgroundColor: walletAddress ? "#ff4d4f" : "#4caf50",
            color:"#fff",
            fontWeight: "600",
            boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
            transition: "all 0.2s ease-in-out",
          }}
          onClick={walletAddress ? disconnectWallet : connectWallet}
          onMouseEnter={e => e.currentTarget.style.transform="scale(1.05)"}
          onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
        >
          {walletAddress ? "Disconnect" : "Connect Wallet"}
        </button>
      </div>

      {/* 顶部文字 */}
      <div style={{ position: "relative", zIndex: 1, paddingTop: "1rem" }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{
            fontSize: "4rem",
            fontWeight: "800",
            background: "linear-gradient(90deg, #ff6a00, #ee0979, #00f260, #0575e6)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            marginBottom: "0.5rem",
            textShadow: "0 4px 10px rgba(0,0,0,0.3)"
          }}
        >
          ZAMA NFT DApp
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            color: "#2b65c9ff",
            marginTop: 0,
            textShadow: "0 3px 8px rgba(0,0,0,0.4)",
            fontStyle: "italic",
            letterSpacing: "1px"
          }}
        >
          {NFT_NAME}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          style={{
            maxWidth: "500px",
            margin: "0.5rem auto",
            fontSize: "1.1rem",
            color: "#030303ff",
            lineHeight: 1.6,
            fontWeight: "500",
            textShadow: "0 2px 6px rgba(0,0,0,0.25)"
          }}
        >
          The official ZAMA mascot NFT, symbolizing <span style={{ color: "#ff6a00", fontWeight: "700" }}>wisdom</span> and <span style={{ color: "#0575e6", fontWeight: "700" }}>curiosity</span>, a unique digital collectible for the blockchain era.
        </motion.p>
      </div>

    {/* 图片 + 外框 + 动画 */}
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  style={{
    display: "inline-block",
    padding: "12px",
    borderRadius: "1.5rem",
    background: "linear-gradient(135deg, #ff6a00, #ee0979, #00f260, #0575e6)",
    boxShadow: "0 0 30px rgba(255, 105, 180, 0.7), 0 0 40px rgba(0, 242, 255, 0.6)",
    position: "relative",
    marginTop: "1rem",
    animation: "glowRotate 5s linear infinite"
  }}
>
  <motion.img
    src={catImage}
    alt="cat"
    style={{ width: 300, height: 300, borderRadius: "1rem", display: "block" }}
    initial={{ scale: 0.95 }}
    animate={{ scale: [1, 0.98, 1] }}
    transition={{ duration: 2, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
  />
</motion.div>

      {/* Mint 按钮 */}
      {!showFireworks && (
        <div style={{ marginTop:"1.5rem", textAlign: "center" }}>
          <button
            style={{
              padding:"0.8rem 2rem",
              fontSize:"1rem",
              borderRadius:"1rem",
              cursor: !walletAddress || !fheReady || minting ? "not-allowed" : "pointer",
              border:"none",
              backgroundColor: !walletAddress || !fheReady || minting ? "#a0a0a0" : "#1890ff",
              color:"#fff",
              fontWeight: "600",
              boxShadow: !walletAddress || !fheReady || minting ? "none" : "0 4px 12px rgba(0,0,0,0.25)",
              transition: "all 0.2s ease-in-out",
            }}
            onClick={handleMint}
            disabled={!walletAddress || !fheReady || minting}
            onMouseEnter={e => {
              if (!e.currentTarget.disabled) e.currentTarget.style.transform="scale(1.05)";
            }}
            onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
          >
            {minting ? `Minting... ${progress}%` : "Mint ZAMA-NFT"}
          </button>

          {/* Toast 精确显示在按钮下方 */}
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{
                marginTop: "0.8rem",
                backgroundColor: "#222",
                color: "#fff",
                padding: "0.6rem 1.2rem",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                fontWeight: "200",
                whiteSpace: "nowrap",
              }}
            >
              {toast}
            </motion.div>
          )}
        </div>
      )}

      {/* Mint 成功 */}
      {showFireworks && (
        <div style={{ marginTop:"1.5rem" }}>
          <h2 style={{ color:"#52c41a" }}>Mint Success!</h2>
          {txHash && (
            <p>
              Transaction: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color:"#1890ff", textDecoration:"underline" }}>{txHash}</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

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

const NFT_NAME = "ZamaPuff";
const NFT_DESC = "The official ZAMA mascot NFT, symbolizing wisdom and curiosity, a unique digital collectible.";
const catImage = "https://i.imgur.com/YUeySct.png";

const SEPOLIA_PARAMS = {
  chainId: "0xaa36a7",
  chainName: "Sepolia Test Network",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"]
};

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
useEffect(() => {
  const loadFHE = async () => {
    if (typeof window === "undefined") return; // SSR 安全
    try {
      // 动态创建 script 标签加载 SDK
      await new Promise((resolve, reject) => {
        if (window.fhevm) return resolve(); // 已经加载过了
        const script = document.createElement("script");
        script.src = "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js";
        script.type = "module";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (err) => reject(new Error("加载 Zama SDK 脚本失败"));
        document.body.appendChild(script);
      });

      // 等待 SDK 挂载到 window
      if (!window.fhevm) throw new Error("window.fhevm 未定义");

      // 初始化 SDK
      await window.fhevm.initSDK();

      // 创建实例
      fheInstance = await window.fhevm.createInstance({
        aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
        kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
        inputVerifierContractAddress: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
        verifyingContractAddressDecryption: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
        verifyingContractAddressInputVerification: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
        chainId: 11155111,
        gatewayChainId: 55815,
        network: window.ethereum,
        relayerUrl: 'https://relayer.testnet.zama.cloud',
      });

      setFheReady(true);
      console.log("Zama SDK 初始化完成");
    } catch (err) {
      console.error("加载 Zama SDK 失败:", err);
    }
  };

  loadFHE();
}, []);


  const shortenAddress = (address) =>
    address ? address.slice(0,6) + "..." + address.slice(-4) : "";

  const getContract = (signer) => new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const connectWallet = async () => {
    if (!window.ethereum) { alert("Please install MetaMask!"); return; }
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== SEPOLIA_PARAMS.chainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_PARAMS.chainId }]
          });
        } catch (switchError) {
          if(switchError.code === 4902){
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [SEPOLIA_PARAMS]
            });
          } else { throw switchError; }
        }
      }
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
    setToast("Encrypting data, please wait...");

    setTimeout(() => setToast(""), 10000); // Toast disappears after 10s

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
        { gasLimit: 800_000 }
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
    <div style={{ textAlign:"center", padding:"2rem", position:"relative" }}>
      {showFireworks && <Confetti width={width} height={height} />}
      {toast && (
        <div style={{
          position: "fixed",
          top: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#333",
          color: "#fff",
          padding: "0.8rem 1.5rem",
          borderRadius: "0.5rem",
          zIndex: 1000,
        }}>
          {toast}
        </div>
      )}
      <div style={{ position:"absolute", top:"1rem", right:"1rem" }}>
        <button
          style={{ padding:"0.3rem 0.8rem", borderRadius:"0.5rem", cursor:"pointer" }}
          onClick={walletAddress ? disconnectWallet : connectWallet}>
          {walletAddress ? shortenAddress(walletAddress) : "Connect Wallet"}
        </button>
      </div>

      <h1>ZAMA NFT DApp</h1>
      <h2>{NFT_NAME}</h2>

      <motion.img
        src={catImage}
        alt="cat"
        style={{ width:300, height:300, borderRadius:"1rem" }}
        initial={{ opacity:0, scale:0.8 }}
        animate={{ opacity:1, scale:1 }}
        transition={{ duration:0.5 }}
      />

      <p style={{ maxWidth:"400px", margin:"0.5rem auto" }}>{NFT_DESC}</p>

      {!showFireworks && (
        <div style={{ marginTop:"1rem" }}>
          <button
            style={{ padding:"0.5rem 1.5rem", fontSize:"1rem", borderRadius:"0.5rem", cursor:"pointer" }}
            onClick={handleMint}
            disabled={!walletAddress || !fheReady || minting}>
            {minting ? `Minting... ${progress}%` : "Mint ZAMA-NFT"}
          </button>
        </div>
      )}

      {showFireworks && (
        <div style={{ marginTop:"1rem" }}>
          <h2>Mint Success!</h2>
          {txHash && (
            <p>
              Transaction: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash}</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

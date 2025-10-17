import { useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import "./index.css";

const CONTRACT_ADDRESS = "0x55832d181ea2e73c872884b499d8255f72f2e76a";
const ABI = [
  {inputs:[{internalType:"address",name:"to",type:"address"},{internalType:"bytes",name:"encryptedMetadata",type:"bytes"}],
   name:"mintWithEncryptedMetadata",
   outputs:[{internalType:"uint256",name:"",type:"uint256"}],
   stateMutability:"nonpayable",
   type:"function"}
];

const NFT_NAME = "ZamaPuff";
const NFT_DESC = "因为这是 ZAMA 吉祥物的 NFT，象征智慧与好奇心，独一无二的数字收藏品。";
const catImage = "https://i.imgur.com/YUeySct.png";

const SEPOLIA_PARAMS = {
  chainId: "0xaa36a7",
  chainName: "Sepolia Test Network",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"]
};

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const { width, height } = useWindowSize();

  const shortenAddress = (address) =>
    address ? address.slice(0,6) + "..." + address.slice(-4) : "";

  const getContract = (signer) => new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const connectWallet = async () => {
    if (!window.ethereum) { alert("请安装 MetaMask!"); return; }
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

      // Mint 状态检查可在此实现，如果钱包已 mint 过，可直接触发烟花
      // 目前无限 mint，不做限制
    } catch(err) { console.error(err); alert("连接钱包失败: " + err.message); }
  };

  const disconnectWallet = () => { setWalletAddress(null); setShowFireworks(false); setTxHash(null); };

  const handleMint = async () => {
    if (!window.ethereum) { alert("请安装 MetaMask!"); return; }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getContract(signer);
      const encryptedMetadata = ethers.toUtf8Bytes(`${NFT_NAME} - ${NFT_DESC}`);
      const tx = await contract.mintWithEncryptedMetadata(await signer.getAddress(), encryptedMetadata);

      setTxHash(tx.hash);
      setShowFireworks(true);

    } catch(err){
      console.error(err);
      alert("Mint 失败: " + err.message);
    }
  };

  return (
    <div style={{ textAlign:"center", padding:"2rem", position:"relative" }}>
      {showFireworks && <Confetti width={width} height={height} />}
      <div style={{ position:"absolute", top:"1rem", right:"1rem" }}>
        <button
          style={{ padding:"0.3rem 0.8rem", borderRadius:"0.5rem", cursor:"pointer" }}
          onClick={walletAddress ? disconnectWallet : connectWallet}>
          {walletAddress ? shortenAddress(walletAddress) : "连接钱包"}
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
            disabled={!walletAddress}>
            Mint ZAMA-NFT
          </button>
        </div>
      )}

      {showFireworks && (
        <div style={{ marginTop:"1rem" }}>
          <h2>Mint 成功！</h2>
          {txHash && (
            <p>
              交易: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer">{txHash}</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
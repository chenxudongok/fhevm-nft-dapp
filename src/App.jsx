import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import MyEncryptedNFTJson from "./MyEncryptedNFT.json";
import { FHEVM } from "fhevm";

const ZAMA_TESTNET_RPC = "https://rpc.testnet.zama.ai";
const ZAMA_CHAIN_ID = 12345; // 替换为官方提供的测试链ID

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [minted, setMinted] = useState([]);
  const [fhe, setFhe] = useState(null);
  const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

  useEffect(() => {
    const fheInstance = new FHEVM();
    setFhe(fheInstance);
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x" + ZAMA_CHAIN_ID.toString(16),
            chainName: "Zama Testnet",
            rpcUrls: [ZAMA_TESTNET_RPC],
            nativeCurrency: { name: "ZAMA", symbol: "ZAMA", decimals: 18 },
            blockExplorerUrls: ["https://explorer.testnet.zama.ai"]
          }]
        });

        const prov = new ethers.BrowserProvider(window.ethereum);
        await prov.send("eth_requestAccounts", []);
        const s = await prov.getSigner();
        const addr = await s.getAddress();
        setProvider(prov);
        setSigner(s);
        setAccount(addr);
        const c = new ethers.Contract(contractAddress, MyEncryptedNFTJson.abi, s);
        setContract(c);
        alert(`Wallet connected: ${addr}`);
      } catch (err) {
        console.error(err);
        alert("Failed to connect or switch network.");
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const mintNFT = async () => {
    if (!contract) return alert("Connect wallet first");
    const tx = await contract.mint(account);
    await tx.wait();
    alert("Minted!");
    fetchNFTs();
  };

  const fetchNFTs = async () => {
    if (!contract) return;
    const total = await contract.nextTokenId();
    const nfts = [];
    for (let i = 0; i < total; i++) nfts.push(i);
    setMinted(nfts);
  };

  const setEncryptedData = async (tokenId) => {
    if (!contract || !fhe) return;
    const encrypted = await fhe.encrypt("Hello Encrypted NFT!");
    const tx = await contract.setEncryptedData(tokenId, encrypted);
    await tx.wait();
    alert(`Encrypted data set for token #${tokenId}`);
  };

  useEffect(() => {
    fetchNFTs();
  }, [contract]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">My Encrypted NFT DApp</h1>

        {!account ? (
          <div className="text-center">
            <button
              onClick={connectWallet}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <p className="mb-2">Connected: {account}</p>
            <button
              onClick={mintNFT}
              className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              Mint NFT
            </button>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-4">Minted NFTs</h2>
        {minted.length === 0 ? (
          <p className="text-gray-500">No NFTs minted yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {minted.map((id) => (
              <div key={id} className="bg-gray-50 p-4 rounded-lg shadow flex flex-col justify-between">
                <img 
                  src="https://placekitten.com/200/200" 
                  alt={`NFT #${id}`} 
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <p className="font-bold text-lg mb-2">Token #{id}</p>
                <button
                  onClick={() => setEncryptedData(id)}
                  className="mt-auto px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                >
                  Set Encrypted Data
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
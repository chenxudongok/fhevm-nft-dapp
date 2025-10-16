import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RelayerSdk from '@zama-fhe/relayer-sdk';

const NFT_CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE';
const NFT_ABI = [
  { inputs: [{ internalType: 'address', name: 'to', type: 'address' }], name: 'mint', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], name: 'nextTokenId', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }
];

export default function App() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [fheInstance, setFheInstance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [minted, setMinted] = useState([]);

  useEffect(() => {
    const initFHE = async () => {
      const instance = await RelayerSdk.createInstance(RelayerSdk.SepoliaConfig);
      setFheInstance(instance);
    };
    initFHE();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask!');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const s = await provider.getSigner();
      const addr = await s.getAddress();
      setAccount(addr);
      setSigner(s);
      const c = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, s);
      setContract(c);
      fetchMintedNFTs(c);
    } catch (err) {
      console.error(err);
      alert('Failed to connect wallet.');
    }
  };

  const mintNFT = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      if (fheInstance) {
        const encryptedMessage = await fheInstance.encrypt('Hello NFT!');
        console.log('Encrypted message:', encryptedMessage);
      }
      const tx = await contract.mint(account);
      await tx.wait();
      alert('Mint success!');
      fetchMintedNFTs(contract);
    } catch (err) {
      console.error(err);
      alert('Mint failed!');
    }
    setLoading(false);
  };

  const fetchMintedNFTs = async (c) => {
    if (!c) return;
    try {
      const total = await c.nextTokenId();
      const nfts = [];
      for (let i = 0; i < total; i++) {
        nfts.push({ id: i, imageUrl: 'https://placekitten.com/200/200' });
      }
      setMinted(nfts);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">FHE NFT DApp</h1>
        {!account ? (
          <button onClick={connectWallet} className="w-full mb-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">Connect Wallet</button>
        ) : (
          <p className="mb-4 font-medium text-gray-700">Connected: {account}</p>
        )}
        <button onClick={mintNFT} disabled={!account || loading} className={`w-full px-6 py-3 font-semibold rounded-lg transition ${account ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}>{loading ? 'Minting...' : 'Mint NFT'}</button>
      </div>

      {minted.length > 0 && (
        <div className="mt-8 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {minted.map((nft) => (
            <div key={nft.id} className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
              <img src={nft.imageUrl} alt={`NFT #${nft.id}`} className="w-full h-40 object-cover rounded mb-2" />
              <p className="font-bold">Token #{nft.id}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
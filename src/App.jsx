import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';
import catImage from './assets/cat.png';
import './index.css';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contractAddress, setContractAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [sdk, setSdk] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const instance = await initSDK(SepoliaConfig);
        const client = await createInstance(instance);
        setSdk(client);
        console.log('✅ Zama SDK Initialized');
      } catch (err) {
        console.error('Zama SDK Init Error:', err);
      }
    };
    init();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      const prov = new ethers.BrowserProvider(window.ethereum);
      const accounts = await prov.send('eth_requestAccounts', []);
      setProvider(prov);
      setAccount(accounts[0]);
    } else {
      alert('Please install MetaMask');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
  };

  const mintNFT = async () => {
    if (!provider || !account || !contractAddress) return;
    try {
      const signer = await provider.getSigner();
      const abi = ['function mint(address to, string memory uri) public returns (uint256)'];
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.mint(account, imageUrl || 'https://placekitten.com/400/400');
      const receipt = await tx.wait();
      setTxHash(receipt.transactionHash);
    } catch (err) {
      alert('Mint Failed: ' + err.message);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Zama NFT Mint DApp</h1>
        <div className="wallet-section">
          {account ? (
            <div className="wallet-info" onClick={() => setShowMenu(!showMenu)}>
              {account.slice(0, 6)}...{account.slice(-4)}
              {showMenu && (
                <div className="wallet-menu" onClick={disconnectWallet}>
                  Disconnect
                </div>
              )}
            </div>
          ) : (
            <button onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </header>

      <main>
        <img src={imageUrl || catImage} alt="NFT Preview" className="nft-image" />
        <input
          type="text"
          placeholder="Contract Address"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="NFT Image URL (optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button disabled={!account} onClick={mintNFT}>
          {account ? 'Mint NFT' : 'Connect Wallet First'}
        </button>
        {txHash && <div className="tx-toast">✅ Mint Success! Tx: {txHash.slice(0, 10)}...</div>}
      </main>
    </div>
  );
}

export default App;

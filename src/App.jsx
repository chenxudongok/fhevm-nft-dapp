import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk/bundle'

export default function App() {
  const [account, setAccount] = useState(null)
  const [contractAddress, setContractAddress] = useState('')
  const [imageURL, setImageURL] = useState('https://placekitten.com/300/300')
  const [txHash, setTxHash] = useState(null)
  const [relayer, setRelayer] = useState(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const sdk = await initSDK(SepoliaConfig)
        const relayerInstance = createInstance(sdk)
        console.log('✅ Zama Relayer Initialized:', relayerInstance)
        setRelayer(relayerInstance)
      } catch (err) {
        console.error('Failed to init Zama Relayer:', err)
      }
    })()
  }, [])

  async function connectWallet() {
    if (!window.ethereum) {
      alert('MetaMask not detected!')
      return
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const accounts = await provider.send('eth_requestAccounts', [])
    setAccount(accounts[0])
  }

  async function mintNFT() {
    if (!account || !contractAddress) {
      alert('Please connect wallet and input contract address!')
      return
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const abi = [
        'function safeMint(address to, string memory uri) public',
        'function mint(address to, string memory uri) public',
        'function mintNFT(address to, string memory uri) public',
      ]
      const contract = new ethers.Contract(contractAddress, abi, signer)

      let tx
      try {
        tx = await contract.safeMint(account, imageURL)
      } catch {
        try {
          tx = await contract.mint(account, imageURL)
        } catch {
          tx = await contract.mintNFT(account, imageURL)
        }
      }
      setTxHash(tx.hash)
      alert('✅ Mint success! Tx: ' + tx.hash)
    } catch (err) {
      console.error(err)
      alert('❌ Mint failed: ' + err.message)
    }
  }

  function shorten(addr) {
    return addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h2>Zama Mint NFT DApp</h2>
      <div style={{ position: 'absolute', top: 10, right: 20 }}>
        {account ? (
          <div>
            <button onClick={() => setShowMenu(!showMenu)}>
              {shorten(account)}
            </button>
            {showMenu && (
              <div style={{ position: 'absolute', right: 0, background: '#fff', border: '1px solid #ccc', padding: '5px' }}>
                <button onClick={() => { setAccount(null); setShowMenu(false) }}>Disconnect</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={connectWallet}>Connect MetaMask</button>
        )}
      </div>

      <img src={imageURL} alt="NFT Preview" width="300" style={{ borderRadius: '10px', marginTop: '40px' }} />

      <div style={{ marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Contract address"
          value={contractAddress}
          onChange={e => setContractAddress(e.target.value)}
          style={{ width: '300px', marginBottom: '10px', display: 'block' }}
        />
        <input
          type="text"
          placeholder="NFT image URL"
          value={imageURL}
          onChange={e => setImageURL(e.target.value)}
          style={{ width: '300px', marginBottom: '10px', display: 'block' }}
        />
        <button disabled={!account} onClick={mintNFT}>
          Mint NFT
        </button>
      </div>

      {txHash && (
        <div style={{ position: 'fixed', bottom: 10, right: 10, background: '#e0ffe0', padding: '10px', borderRadius: '6px' }}>
          ✅ Minted successfully!<br />
          Tx: {shorten(txHash)}
        </div>
      )}
    </div>
  )
}

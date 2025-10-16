import React, { useEffect, useState } from 'react';
import NFTCard from './components/NFTCard';
import { getNFTs } from './utils/web3';

function App() {
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    async function fetchNFTs() {
      const data = await getNFTs();
      setNfts(data);
    }
    fetchNFTs();
  }, []);

  return (
    <div className="app">
      <h1>FHEVM NFT DApp</h1>
      <div className="nft-list">
        {nfts.map((nft) => (
          <NFTCard key={nft.tokenId} nft={nft} />
        ))}
      </div>
    </div>
  );
}

export default App;

import React from 'react';

export default function NFTCard({ nft }) {
  return (
    <div className="nft-card">
      <img src={nft.image} alt={nft.name} width={200} />
      <h3>{nft.name}</h3>
      <p>Token ID: {nft.tokenId}</p>
    </div>
  );
}

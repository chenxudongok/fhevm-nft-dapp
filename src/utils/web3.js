import { ethers } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export async function getNFTs() {
  try {
    return [
      { tokenId: 1, name: 'NFT #1', image: '/favicon.ico' },
      { tokenId: 2, name: 'NFT #2', image: '/favicon.ico' }
    ];
  } catch (err) {
    console.error(err);
    return [];
  }
}

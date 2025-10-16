import { Relayer } from "@zama-fhe/relayer-sdk";
import { ethers } from "ethers";

const NFT_CONTRACT_ADDRESS = ""; // 填你的 NFT 合约地址

const relayer = new Relayer({ network: "sepolia" });
await relayer.initialize();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { walletAddress } = req.body;
  if (!walletAddress) return res.status(400).json({ error: "walletAddress missing" });

  try {
    const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/YOUR_INFURA_KEY");
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      ["function mint(address to) public returns (uint256)"],
      signer
    );
    const tx = await contract.mint(walletAddress);
    await tx.wait();
    res.status(200).json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

import express from "express";
import cors from "cors";
import { Relayer } from "@zama-fhe/relayer-sdk";
import { ethers } from "ethers";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const NFT_CONTRACT_ADDRESS = ""; // 填你的 NFT 合约地址

const relayer = new Relayer({ network: "sepolia" });
await relayer.initialize();

app.post("/api/mint", async (req, res) => {
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

    res.json({ success: true, txHash: tx.hash });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));

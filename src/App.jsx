import React, {useState, useEffect} from "react";
import { ethers } from "ethers";

function truncate(address){
  if(!address) return "";
  return address.slice(0,6) + "..." + address.slice(-4);
}

export default function App(){
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("/cat.png");
  const [minting, setMinting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [relayerLoaded, setRelayerLoaded] = useState(false);

  // Dynamic import of Zama SDK
  useEffect(() => {
    (async () => {
      try {
        const mod = await import("@zama-fhe/relayer-sdk");
        console.log("Zama SDK loaded", mod);
        setRelayerLoaded(true);
      } catch (err) {
        console.warn("Zama SDK not loaded:", err);
      }
    })();
  }, []);

  useEffect(()=>{
    if(window.ethereum){
      const p = new ethers.BrowserProvider(window.ethereum);
      setProvider(p);
      p.getSigner().then(s=> {
        s.getAddress().then(addr=>{
          setSigner(s);
          setAddress(addr);
        }).catch(()=>{/*not connected*/});
      }).catch(()=>{/*no signer yet*/});
      window.ethereum.on && window.ethereum.on("accountsChanged", (accounts)=> {
        if(accounts.length===0){
          disconnect();
        }else{
          setAddress(accounts[0]);
        }
      });
    }
  },[]);

  async function connect(){
    if(!window.ethereum) return alert("Please install MetaMask");
    try{
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const p = new ethers.BrowserProvider(window.ethereum);
      const s = await p.getSigner();
      const addr = await s.getAddress();
      setProvider(p);
      setSigner(s);
      setAddress(addr);
    }catch(e){
      console.error(e);
      alert("Failed to connect: " + (e.message||e));
    }
  }

  function disconnect(){
    setAddress("");
    setSigner(null);
  }

  async function mint(){
    if(!signer) return;
    if(!contractAddress) return alert("Please fill contract address");
    setMinting(true);
    setToast(null);
    try{
      const abi = [
        "function safeMint(address to, string memory tokenURI) public returns (uint256)",
        "function mint(address to, string memory tokenURI) public returns (uint256)",
        "function mintToken(address to, string memory tokenURI) public returns (uint256)",
        "function mintNFT(address to, string memory tokenURI) public returns (uint256)"
      ];
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const to = address || (await signer.getAddress());
      let tx;
      const variants = ["safeMint","mint","mintToken","mintNFT"];
      let called = false;
      for(const fn of variants){
        try{
          if(contract[fn]){
            tx = await contract[fn](to, imageUrl);
            called = true;
            break;
          }
        }catch(err){
          console.warn("error calling",fn,err);
        }
      }
      if(!called){
        throw new Error("No supported mint function found.");
      }
      setToast({status:"pending", msg:"Transaction submitted: " + tx.hash});
      await tx.wait();
      setToast({status:"success", msg:"Mint succeeded: " + tx.hash});
    }catch(e){
      console.error(e);
      setToast({status:"error", msg: "Mint failed: " + (e.message||e)});
    }finally{
      setMinting(false);
      setTimeout(()=>setToast(null),15000);
    }
  }

  return (
    <div className="app">
      <div className="header">
        <div className="brand">Zama Mint DApp (Dynamic SDK)</div>
        <div>
          {address ? (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button className="wallet-btn" onClick={()=>setShowWalletModal(v=>!v)}>{truncate(address)}</button>
              {showWalletModal && (
                <div className="modal">
                  <div className="small">Connected: <strong>{address}</strong></div>
                  <div style={{height:8}}/>
                  <button className="wallet-btn" onClick={()=>{disconnect();setShowWalletModal(false);}}>Disconnect</button>
                </div>
              )}
            </div>
          ) : (
            <button className="wallet-btn" onClick={connect}>Connect MetaMask</button>
          )}
        </div>
      </div>

      <div style={{display:"flex",gap:20}}>
        <div>
          <img src={imageUrl||"/cat.png"} alt="nft" className="cat"/>
        </div>
        <div style={{flex:1}}>
          <div className="small">Contract Address</div>
          <input className="input" placeholder="0x..." value={contractAddress} onChange={(e)=>setContractAddress(e.target.value)}/>
          <div style={{height:10}}/>
          <div className="small">NFT Image URL (or leave default)</div>
          <input className="input" placeholder="https://..." value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)}/>
          <div style={{height:18}}/>
          <div className="actions">
            <button className="mint-btn" disabled={!address || minting} onClick={mint}>
              {minting ? "Minting..." : "Mint"}
            </button>
            {!address && <div className="small">Connect wallet to enable mint</div>}
          </div>
          <div style={{marginTop:18}} className="small">
            {relayerLoaded ? "Zama SDK loaded dynamically ✅" : "Zama SDK not loaded yet ⚙️"}
          </div>
        </div>
      </div>

      {toast && (
        <div className="footer-toast">
          <div style={{fontWeight:700}}>{toast.status}</div>
          <div style={{marginTop:6}}>{toast.msg}</div>
        </div>
      )}
    </div>
  );
}
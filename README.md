# Zama Mint DApp (Vite + React)

This is a minimal DApp scaffold that:
- Shows an NFT image (default placeholder cat).
- Connects to MetaMask and shows truncated address in top-right with a disconnect button.
- Provides inputs for contract address and image URL.
- Mint button disabled until wallet is connected. Attempts to call common ERC-721 mint functions.
- Includes `@zama-fhe/relayer-sdk` as a dependency ready for initialization per Zama docs.

## Local development

1. Install dependencies:
```bash
npm install
# or
yarn
```

2. Run dev server:
```bash
npm run dev
# open http://localhost:5173
```

3. Build for production:
```bash
npm run build
```

## Vercel deployment

1. Push this repository to GitHub.
2. On Vercel, create a new project and import the repo.
3. Vercel will detect the Vite app. Build command: `npm run build`. Output directory: `dist`.
4. Set any environment variables if you plan to use Zama Relayer (e.g. RELAYER_URL) in Vercel dashboard.
5. Deploy.

## Notes & Caveats

- The mint function here tries multiple common function names. If your contract uses a custom mint method or requires payment, you will need to adapt the ABI and call parameters.
- MetaMask does not provide a programmatic "disconnect" method; we clear local UI state when the user clicks Disconnect.
- To integrate the Relayer SDK properly, follow Zama's Relayer SDK docs and initialize `Relayer` with `relayerUrl` and any required configuration.
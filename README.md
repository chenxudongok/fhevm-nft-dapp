# Zama Mint DApp (Dynamic Import Fix)

This version uses **dynamic import** for `@zama-fhe/relayer-sdk`, making it compatible with **Vercel** and **Vite**.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:5173
```

## Deploy to Vercel

Build command: `npm run build`  
Output directory: `dist`

## Notes
- SDK is imported dynamically to prevent "Missing '.' specifier" build error.
- The app can still initialize the SDK in runtime if needed.
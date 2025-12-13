<!-- Don't delete it -->

<div name="readme-top"></div>



<!-- Organization Logo -->

<div align="center" style="display: flex; align-items: center; justify-content: center; gap: 16px;">

  <img alt="Stability Nexus" src="public/stability.svg" width="175">

  <img src="public/todo-project-logo.svg" width="175" />

</div>



&nbsp;



<!-- Organization Name -->

<div align="center">



[![Static Badge](https://img.shields.io/badge/Stability_Nexus-/Plaza-228B22?style=for-the-badge&labelColor=FFC517)](https://plaza.stability.nexus/)



<!-- Correct deployed url to be added -->



</div>



<!-- Organization/Project Social Handles -->

<p align="center">
<!-- Telegram -->
<a href="https://t.me/StabilityNexus">
<img src="https://img.shields.io/badge/Telegram-black?style=flat&logo=telegram&logoColor=white&logoSize=auto&color=24A1DE" alt="Telegram Badge"/></a>
&nbsp;&nbsp;
<!-- X (formerly Twitter) -->
<a href="https://x.com/StabilityNexus">
<img src="https://img.shields.io/twitter/follow/StabilityNexus" alt="X (formerly Twitter) Badge"/></a>
&nbsp;&nbsp;
<!-- Discord -->
<a href="https://discord.gg/YzDKeEfWtS">
<img src="https://img.shields.io/discord/995968619034984528?style=flat&logo=discord&logoColor=white&logoSize=auto&label=Discord&labelColor=5865F2&color=57F287" alt="Discord Badge"/></a>
&nbsp;&nbsp;
<!-- Medium -->
<a href="https://news.stability.nexus/">
  <img src="https://img.shields.io/badge/Medium-black?style=flat&logo=medium&logoColor=black&logoSize=auto&color=white" alt="Medium Badge"></a>
&nbsp;&nbsp;
<!-- LinkedIn -->
<a href="https://linkedin.com/company/stability-nexus">
  <img src="https://img.shields.io/badge/LinkedIn-black?style=flat&logo=LinkedIn&logoColor=white&logoSize=auto&color=0A66C2" alt="LinkedIn Badge"></a>
&nbsp;&nbsp;
<!-- Youtube -->
<a href="https://www.youtube.com/@StabilityNexus">
  <img src="https://img.shields.io/youtube/channel/subscribers/UCZOG4YhFQdlGaLugr_e5BKw?style=flat&logo=youtube&logoColor=white&logoSize=auto&labelColor=FF0000&color=FF0000" alt="Youtube Badge"></a>
</p>



---



<div align="center">

<h1>Plaza</h1>

</div>



[Plaza](https://plaza.stability.nexus/) is a map-first, onchain coordination hub where anyone can create, explore, and contribute to location-anchored impact projects. Each project deploys its own ERC20 token, tracks contributors and volunteers on-chain, and can receive ETH contributions directly through the dApp.



---



## Tech Stack



Plaza combines an App Router Next.js frontend with on-chain coordination primitives:

### Frontend



- Next.js 15 (App Router)
- TypeScript
- TailwindCSS + tailwind-merge + tailwindcss-animate
- shadcn/ui primitives (Radix UI)
- RainbowKit + wagmi + viem for wallet connectivity
- Mapbox GL for interactive location selection
- Framer Motion for motion design

### Blockchain



- Solidity smart contracts (Foundry)
- OpenZeppelin (Ownable, ERC20, ReentrancyGuard)
- PlazaFactory deploys per-project `Plaza` ERC20s that track fundraising and volunteering
- Deployed on Scroll Sepolia (Chain ID 534351)



---



## Getting Started



### Prerequisites



- Node.js 18+
- npm/yarn/pnpm
- MetaMask or any other web3 wallet browser extension
- A Scroll Sepolia RPC endpoint and testnet funds for interactions
- Mapbox access token (for the location picker)

### Installation



> The Next.js app lives in `src/`. The Solidity contracts live in `contracts/`.

#### 1. Clone the Repository



```bash
git clone https://github.com/StabilityNexus/Plaza.git
cd Plaza/src
```



#### 2. Install Dependencies



Using your preferred package manager:



```bash
npm install
# or
yarn install
# or
pnpm install
```



#### 3. Configure Environment Variables



Create `src/.env.local` and set your Mapbox token:

```
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_actual_token_here
```

If you need a Mapbox token, see `MAPBOX_SETUP.md` for step-by-step guidance.



#### 4. Run the Development Server



Start the app locally:



```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```



#### 5. Open your Browser



Navigate to [http://localhost:3000](http://localhost:3000) to see the application. The landing page renders the interactive Mapbox experience; use the Create Project and Explorer routes to deploy and browse on-chain projects.



---



## Smart Contracts (Foundry)



Contracts live in `contracts/`:

- `PlazaFactory.sol` deploys project-specific `Plaza` contracts and tracks creators and deployments.
- `Plaza.sol` mints per-project ERC20 tokens, tracks contributors/volunteers, collects a protocol fee, and holds raised ETH until withdrawn by the project owner.

Common commands (from `contracts/`):

```bash
forge build
forge test
forge fmt
```



---



## Contributing



We welcome contributions of all kinds! To contribute:

1. Fork the repository and create your feature branch (`git checkout -b feature/AmazingFeature`).
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
3. Run the development workflow commands to ensure code quality:
   - `npm run lint`
   - `npm run build`
4. Push your branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request for review.

If you encounter bugs, need help, or have feature requests:

- Please open an issue in this repository providing detailed information.
- Describe the problem clearly and include any relevant logs or screenshots.



We appreciate your feedback and contributions!



© 2025 The Stable Order.

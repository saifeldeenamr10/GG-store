<div align="center">

  <img src="public/assets/logo.png" alt="GG-Store Logo" width="130" style="border-radius: 24px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6); margin-bottom: 20px;" />

  # GG-STORE
  ### Enterprise-Grade High-Performance Digital Game Marketplace & Management Platform

  <p align="center">
    A lightweight, ultra-performant Single Page Application (SPA) engineered with modern web standards, featuring dynamic game catalog ingestion, bidirectional internationalization (i18n), real-time filtering pipelines, and a streamlined administrative operations engine.
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/JavaScript-ESNext-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript ESNext">
    <img src="https://img.shields.io/badge/Architecture-Modular_SPA-00D2FF?style=for-the-badge" alt="Modular Architecture">
    <img src="https://img.shields.io/badge/Vite-6.x_Bundler-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/CSS3-Design_Tokens_%26_Glassmorphism-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
    <img src="https://img.shields.io/badge/License-MIT-4ade80?style=for-the-badge" alt="License">
  </p>

  <p align="center">
    <a href="#-architecture--key-capabilities">Key Capabilities</a> •
    <a href="#-system-design--engineering-highlights">System Design</a> •
    <a href="#-technical-stack">Tech Stack</a> •
    <a href="#-directory-structure">Project Layout</a> •
    <a href="#-getting-started">Development Workflow</a>
  </p>

</div>

---

## ⚡ Architecture & Key Capabilities

- **🚀 Zero-Framework Pure JavaScript Engine**: Constructed entirely with modern Vanilla ESNext modules, eliminating runtime framework overhead and ensuring instant First Contentful Paint (FCP) and near-zero Total Blocking Time (TBT).
- **🌐 Comprehensive Bidirectional i18n Engine**: Custom localization layer providing full runtime language switching with seamless LTR/RTL document tree synchronization (English / Arabic).
- **⚡ Client-Side State & Filtering Pipeline**: High-efficiency in-memory query engine supporting multi-attribute facet search, fuzzy search, category indexing, and dynamic sorting without round-trip database latencies.
- **🎛️ Dedicated Administrative Control Plane**: Complete inventory management suite for updating catalog assets, managing pricing, configuring regional availability, and mutating game collections.
- **💎 Micro-Interaction UI System**: Designed with modular CSS Custom Properties (Tokens), glassmorphism layers, fluid typography, responsive flex-grid layouts, and GPU-accelerated transition keyframes.

---

## 📸 Interface Preview

| 🌟 Storefront Experience | 🎯 Catalog & Search |
| :---: | :---: |
| <img src="ChatGPT Image Aug 3, 2026, 08_43_01 AM.png" width="420" alt="GG-Store Storefront" /> | <img src="1.png" width="420" alt="GG-Store Catalog" /> |

---

## 🛠️ Technical Stack

| Domain | Technology / Specification | Architectural Role |
| :--- | :--- | :--- |
| **Runtime & Core** | `Vanilla JavaScript (ESNext / Modular)` | Client-side reactive views, state management, and event bus |
| **Layout & Styling** | `Modern CSS3` (Custom Properties, Flex, Grid) | Zero-dependency styling engine, theme tokens & fluid responsiveness |
| **Tooling & Build** | `Vite 6.x` | Native ESM HMR development server and tree-shaken Rollup production bundler |
| **Data Format** | `JSON Schemas` | Portable, serialized catalog storage and API simulation |

---

## 🏛️ System Design & Engineering Highlights

```
┌─────────────────────────────────────────────────────────────┐
│                      GG-Store Client                        │
├─────────────────┬─────────────────────────┬─────────────────┤
│  Router Engine  │  State & Store Manager  │  i18n Provider  │
│  (Hash/History) │     (src/js/data.js)    │ (src/js/i18n.js)│
└────────┬────────┴────────────┬────────────┴────────┬────────┘
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ View Renderers  │   │  Catalog Query  │   │ CSS Design Token│
│ (src/js/views)  │   │ Filter/Search/UI│   │ Engine (Tokens) │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

- **Separation of Concerns**: Complete decoupling of application routing, data ingestion, view templates, and presentation layers.
- **Resilient Asset Management**: Built-in fallbacks and optimized web-format assets (`.webp`, `.avif`, `.png`) to ensure visual fidelity across diverse network environments.
- **Modular Style Architecture**: Maintainable CSS taxonomy isolating layout, components, responsive breakpoints, animations, and color tokens.

---

## 📂 Directory Structure

```
GG-store/
├── 📁 public/
│   ├── 📁 assets/
│   │   ├── 📁 image of the games/     # Optimized cover artwork & media
│   │   └── logo.png                   # Project branding assets
│   └── 📁 data/
│       └── games.json                 # Serialized catalog state
├── 📁 src/
│   ├── 📁 js/
│   │   ├── admin.js                   # Administrative dashboard & mutations
│   │   ├── data.js                    # In-memory store & persistence adapters
│   │   ├── i18n.js                    # Internationalization dictionary & LTR/RTL engine
│   │   ├── main.js                    # Application orchestrator
│   │   ├── router.js                  # Client-side SPA navigation handler
│   │   └── views.js                   # Declarative view templates & UI renderer
│   └── 📁 styles/
│       ├── animations.css             # Keyframes & dynamic transitions
│       ├── components.css             # Reusable UI component definitions
│       ├── layout.css                 # Page layout scaffolds & grids
│       ├── main.css                   # Global styles & resets
│       ├── responsive.css             # Viewport breakpoint adapters
│       └── variables.css              # Theme tokens, palettes & design variables
├── index.html                         # Entrypoint HTML document
├── package.json                       # Manifest & dependency scripts
├── update_data.js                     # Catalog aggregation & maintenance script
└── vite.config.js                     # Vite build configuration
```

---

## 💻 Getting Started

### Prerequisites
- **Node.js** >= `18.0.0`
- **npm** >= `9.0.0` (or `pnpm` / `yarn`)

### 1. Clone the Repository
```bash
git clone https://github.com/saifeldeenamr10/GG-store.git
cd GG-store
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
> Spawns local development environment at `http://localhost:5173/` with Instant Hot Module Replacement (HMR).

### 4. Production Build
```bash
npm run build
```
> Compiles and minifies assets into `/dist` for high-speed edge distribution.

---

## 👤 Author

**Saifeldeen Amr**  
- GitHub: [@saifeldeenamr10](https://github.com/saifeldeenamr10)

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for further information.

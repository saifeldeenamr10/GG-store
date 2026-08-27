<div align="center">

  <img src="public/assets/logo.png" alt="GG-Store Logo" width="130" style="border-radius: 24px; box-shadow: 0 8px 30px rgba(0,0,0,0.5); margin-bottom: 16px;" />

  # 🎮 GG-Store — Premium Digital Gaming Marketplace

  <p align="center">
    <strong>An ultra-fast, modern, and interactive gaming store built for gamers and game collectors.</strong>
  </p>

  <p align="center">
    <a href="https://github.com/saifeldeenamr10/GG-store/stargazers"><img src="https://img.shields.io/github/stars/saifeldeenamr10/GG-store?style=for-the-badge&color=8A2BE2&logo=github" alt="Stars"></a>
    <a href="https://github.com/saifeldeenamr10/GG-store/network/members"><img src="https://img.shields.io/github/forks/saifeldeenamr10/GG-store?style=for-the-badge&color=00D2FF&logo=github" alt="Forks"></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
    <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" alt="Vercel"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"></a>
  </p>

  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-project-structure">Structure</a> •
    <a href="#-deploying-to-vercel">Deployment</a>
  </p>

</div>

---

## 🕹️ Overview

**GG-Store** is a comprehensive, client-side digital game store designed with glassmorphism aesthetics, responsive layouts, multi-language localization (Arabic & English), instant search filters, and an integrated management admin panel.

---

## ✨ Features

- 🎮 **Dynamic Game Catalog**: Rich showcase of trending, featured, and popular games.
- ⚡ **Instant Search & Filter**: Real-time filtering by category, genre, price range, and platform.
- 🌐 **Multilingual & RTL Support**: Full localization support for English (LTR) and Arabic (RTL).
- 🛠️ **Admin Management Panel**: Easily manage titles, descriptions, price tags, and inventory.
- 📱 **Mobile & Desktop Optimized**: Fluid layout designed for all screen sizes from mobile to ultra-wide displays.
- 🎨 **Modern Cyber-Dark Theme**: Sleek dark UI with glowing neon highlights, card hover micro-animations, and fast page load times.

---

## 📸 Preview

| 🌟 Storefront Experience | 🎯 Catalog & Search |
| :---: | :---: |
| <img src="ChatGPT Image Aug 3, 2026, 08_43_01 AM.png" width="420" alt="GG-Store Preview" /> | <img src="1.png" width="420" alt="Catalog Preview" /> |

---

## 🛠️ Tech Stack

- **Core**: HTML5, Vanilla JavaScript (ESNext Modules)
- **Styling**: Modern CSS3 (Variables, Flexbox, Grid, Glassmorphism, Animations)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Hosting**: [Vercel](https://vercel.com/)

---

## 📁 Project Structure

```
GG-store/
├── 📁 public/
│   ├── 📁 assets/
│   │   ├── 📁 image of the games/    # Game artwork and thumbnails
│   │   └── logo.png                  # Project branding logo
│   └── 📁 data/
│       └── games.json                # Game catalog data store
├── 📁 src/
│   ├── 📁 js/
│   │   ├── admin.js                  # Store management dashboard
│   │   ├── data.js                   # State manager & API handlers
│   │   ├── i18n.js                   # Internationalization engine
│   │   ├── main.js                   # App initialization
│   │   ├── router.js                 # SPA view routing
│   │   └── views.js                  # Dynamic view rendering
│   └── 📁 styles/
│       ├── animations.css            # Micro-interactions & transitions
│       ├── components.css            # UI component styles
│       ├── layout.css                # Scaffolding and layouts
│       ├── main.css                  # Core global stylesheet
│       ├── responsive.css            # Responsive media queries
│       └── variables.css             # Colors, gradients & tokens
├── index.html                        # Application entry point
├── package.json                      # Dependencies and scripts
└── vite.config.js                    # Vite bundler configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed.

### 2. Clone the Repository
```bash
git clone https://github.com/saifeldeenamr10/GG-store.git
cd GG-store
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🌐 Deploying to Vercel

1. Go to [Vercel](https://vercel.com) and connect your GitHub account.
2. Click **"Add New..."** → **"Project"**.
3. Select **`saifeldeenamr10/GG-store`** and click **Import**.
4. Click **Deploy**. Vercel will automatically build and publish your website.

---

## 👤 Author

**Saifeldeen Amr**
- GitHub: [@saifeldeenamr10](https://github.com/saifeldeenamr10)

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

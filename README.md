# ER

![GitHub stars](https://img.shields.io/github/stars/Alone-Prodipta/ER?style=for-the-badge&logo=github) ![GitHub forks](https://img.shields.io/github/forks/Alone-Prodipta/ER?style=for-the-badge&logo=github) ![GitHub issues](https://img.shields.io/github/issues/Alone-Prodipta/ER?style=for-the-badge&logo=github) ![Last commit](https://img.shields.io/github/last-commit/Alone-Prodipta/ER?style=for-the-badge&logo=github) 
## 📑 Table of Contents

- [Description](#description)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Key Dependencies](#key-dependencies)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Contributors](#contributors)
- [Contributing](#contributing)


## 📝 Description

ER — a backend api built with Express.js, JavaScript, MongoDB, React, Tailwind CSS, Vite.

## 🛠️ Tech Stack

![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Notable libraries:** Mongoose

## 🏗️ Architecture

A high-level view of how the main pieces fit together:

```mermaid
flowchart TD
    User["👤 User / Browser"]
    FE["🖼️ React Frontend"]
    User --> FE
    API["⚙️ Express API"]
    FE --> API
    DB[("🗄️ MongoDB")]
    API --> DB
```

## ⚡ Quick Start

```bash

# 1. Clone the repository
git clone https://github.com/Alone-Prodipta/ER.git

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

## 📦 Key Dependencies

```
@xyflow/react: ^12.12.0
bootstrap: ^5.3.8
cors: ^2.8.6
dotenv: ^18.0.5
express: ^5.2.1
mongoose: ^9.10.4
react: ^19.2.8
react-dom: ^19.2.8
tailwindcss: ^4.3.3
```

## 🚀 Available Scripts

- **dev** — `npm run dev`
- **build** — `npm run build`
- **lint** — `npm run lint`
- **preview** — `npm run preview`

## 📁 Project Structure

```
modelling
├── eslint.config.js
├── index.html
├── package.json
├── src
│   ├── App.css
│   ├── App.jsx
│   ├── TableNode.jsx
│   ├── backend
│   │   └── server.database.js
│   ├── index.css
│   └── main.jsx
└── vite.config.js
```

## 🛠️ Development Setup

### Node.js / JavaScript
1. Install Node.js (v18+ recommended)
2. Install dependencies: `npm install` (or `yarn` / `pnpm install` / `bun install`)
3. Start the dev server: see the **Quick Start** above

## 👥 Contributors

Thanks to everyone who has contributed to this project:

<p align="left">
<a href="https://github.com/Alone-Prodipta" title="Alone-Prodipta"><img src="https://avatars.githubusercontent.com/u/226836266?v=4&s=64" width="64" height="64" alt="Alone-Prodipta" style="border-radius:50%" /></a>
</p>

[See the full list of contributors →](https://github.com/Alone-Prodipta/ER/graphs/contributors)

## 👥 Contributing

Contributions are welcome! Here's the standard flow:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/Alone-Prodipta/ER.git`
3. **Branch**: `git checkout -b feature/your-feature`
4. **Commit**: `git commit -m 'feat: add some feature'`
5. **Push**: `git push origin feature/your-feature`
6. **Open** a pull request

Please follow the existing code style and include tests for new behavior where applicable.

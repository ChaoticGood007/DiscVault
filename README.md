# DiscVault

DiscVault is a professional-grade, self-hosted disc golf inventory management system. Designed for collectors and throwers alike, it features a unique "Vault-first" architecture that allows you to manage multiple separate collections (e.g., your Main Bag, Storage, and Collector's Vault) within a single unified interface.

![DiscVault Dashboard](public/window.svg) *(Logo Placeholder)*

## 🚀 Key Features

- **Vault Workspaces:** Dedicated environments for different collections with strict isolation.
- **Smart CSV Importer:** Interactive tool with fuzzy auto-mapping for existing spreadsheets.
- **Advanced Search:** Range filtering by Flight Numbers (Speed, Glide, Turn, Fade), Weight, Condition, and more.
- **Deep Analytics:** Real-time stats on brand distribution, stability, condition averages, and even total collection weight.
- **Infinite Browsing:** High-performance Card and Table views with infinite scroll for 1,000+ disc collections.
- **Global Awareness:** A "Total Inventory" workspace for searching across all your vaults at once.
- **Docker Ready:** Plug-and-play deployment with automatic database initialization.

## 📦 Quick Start (Docker)

The easiest way to run DiscVault is via Docker.

### Using Docker Run
```bash
docker run -d \
  -p 3000:3000 \
  -v discvault_data:/app/data \
  -e DATABASE_URL="file:/app/data/vault.db" \
  ghcr.io/chaoticgood007/discvault:latest
```

### Using Docker Compose
Create a `docker-compose.yml` file:
```yaml
services:
  discvault:
    image: ghcr.io/chaoticgood007/discvault:latest
    ports:
      - "3000:3000"
    volumes:
      - discvault_data:/app/data
    environment:
      - DATABASE_URL=file:/app/data/vault.db
    restart: unless-stopped

volumes:
  discvault_data:
```
Then run:
```bash
docker-compose up -d
```

Open `http://localhost:3000` to start your first vault.

## 🛠️ Development Setup

If you want to contribute or run the project from source:

1. **Clone the Repo:**
   ```bash
   git clone git@github.com:ChaoticGood007/DiscVault.git
   cd discvault
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Database Setup:**
   Create a `.env` file with `DATABASE_URL="file:./data/dev.db"`, then run:
   ```bash
   npx prisma db push
   ```

4. **Run Dev Server:**
   ```bash
   npm run dev
   ```

## 🏗️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** SQLite with Prisma 6
- **Styling:** Tailwind CSS (Forced Light Theme / Slate palette)
- **UI Components:** Lucide Icons, Recharts, Framer Motion
- **Containerization:** Docker (Standalone multi-stage build)

## ⚖️ License

This project is licensed under the **GNU General Public License v3 (GPLv3)** - see the [LICENSE](LICENSE) file for details. 

Source code headers are licensed under **Apache-2.0**.

---
*Created by [ChaoticGood007](https://github.com/ChaoticGood007)*

# Streaming Site

A modern content discovery and streaming platform built with **NestJS**, **Next.js**, and **TypeScript**.

## 🚀 Features

- **Unified Search**: Instantly search across Movies, TV Shows, and Anime.
- **Content Discovery**: Browse trending titles, filter by genre, or explore via the A-Z index.
- **Streaming**: Integrated player with dynamic source selection (Movies, TV, Anime).
- **Responsive UI**: Sleek, dark-themed interface with mobile-friendly design.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, CSS Modules
- **Backend**: NestJS, Prisma
- **Data Sources**: TMDb, Jikan (Anime), VidLink/VidSrc

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js & npm
- PostgreSQL (for Prisma)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd streaming-site
   ```

2. **Setup API**
   ```bash
   cd api
   npm install
   npx prisma generate
   npm run start:dev
   ```
   *Runs on http://localhost:4001*

3. **Setup Web**
   ```bash
   cd web
   npm install
   npm run dev
   ```
   *Runs on http://localhost:3000*
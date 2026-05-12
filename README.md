# Uni Textbook Marketplace

> **A marketplace for students, by students.**
> A verified, module-aware platform where university students can buy, sell, and swap textbooks. Safely, affordably, and without the chaos of WhatsApp groups.

---

## Presented by 
# NexusDev

---

## Project Description

**NexusDev - Uni Textbook Marketplace - A web-based marketplace where verified university students can buy, sell, or swap second-hand textbooks. The platform features university email verification, structured listings with ISBN, edition, condition and module code, module-aware browsing by faculty and semester, smart filters, and privacy-first in-app messaging.**

Built for [Agile Bridge](https://www2.agilebridge.co.za/) as part of the COS 301 Software Engineering Capstone Project at the University of Pretoria.

---

## Documentation

| Document | Link |
|---|---|
|  Software Requirements Specification (SRS) | [View SRS](https://github.com/COS301-SE-2026/Uni-Textbook-Marketplace/blob/main/docs/srs.md) |
|  Architecture Overview | *Coming soon — Sprint 2* |
|  Brand Style Guide | [View Brand Guide](https://github.com/COS301-SE-2026/Uni-Textbook-Marketplace/blob/main/docs/brand-style-guide.md) |
|  User Guide | *Coming soon* |
|  Setup Instructions | See [Getting Started](#getting-started) below |

---

## Project Board & CI Status

| Resource | Link |
|---|---|
|  GitHub Project Board | [View Sprint Board](https://github.com/orgs/COS301-SE-2026/projects/64/views/1) |
|  Issue Tracker | [GitHub Issues](../../issues) |

---

## Build & Quality Badges

[![NexusDev CI](https://github.com/COS301-SE-2026/Uni-Textbook-Marketplace/actions/workflows/ci.yml/badge.svg)](https://github.com/COS301-SE-2026/Uni-Textbook-Marketplace/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/COS301-SE-2026/Uni-Textbook-Marketplace/branch/main/graph/badge.svg)](https://codecov.io/gh/COS301-SE-2026/Uni-Textbook-Marketplace)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=COS301-SE-2026_Uni-Textbook-Marketplace&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=COS301-SE-2026_Uni-Textbook-Marketplace)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=COS301-SE-2026_Uni-Textbook-Marketplace&metric=coverage)](https://sonarcloud.io/summary/new_code?id=COS301-SE-2026_Uni-Textbook-Marketplace)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-blue)](https://nodejs.org)
![NestJS](https://img.shields.io/badge/backend-NestJS-red)
![NextJS](https://img.shields.io/badge/frontend-NextJS-black)
![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-336791)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## Repository Structure

```
Uni-Textbook-Marketplace/
│
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions CI/CD pipeline
│
├── backend/                              # NestJS modular monolith API
│   ├── src/
│   │   ├── app.controller.spec.ts              
│   │   ├── app.controller.ts                 
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── test/   
|   ├── .dockerignore              
│   ├── .gitignore                
│   ├── .prettierrc   
|   ├── Dockerfile.dev                   # Docker file setup for containerization
│   ├── eslint.config.mjs                  
│   ├── nest-cli.json
|   ├── package-lock.json
│   ├── package.json
│   ├── tsconfig.build.json
│   └── tscofig.json
│
├── frontend/                             # Next.js (React) web application
│   ├── src/
│   │   ├── app/                          # Next.js App Router
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx          # /auth/login
│   │   │   │   └── register/
│   │   │   │       └── page.tsx          # /auth/register
│   │   │   ├── listings/
│   │   │   │   └── page.tsx              # /listings
│   │   │   ├── admin/
│   │   │   │   └── page.tsx              # /admin
│   │   │   ├── layout.tsx                # Root layout with NavBar
│   │   │   ├── page.tsx                  # Landing page /
│   │   │   └── globals.css              # Global styles + brand tokens
│   │   └── components/
│   │       ├── NavBar.tsx                # Navigation bar (auth-aware)
│   │       └── ui/                       # Reusable UI component library
│   ├── public/                           # Static assets
│   ├── .env.example                      # Environment variable template
|   ├── .gitignore                    
|   ├── .dockerignore
|   ├── Dockerfile.dev                    # Docker file setup for containerization
│   ├── jest.config.js                    # Jest configuration
│   ├── jest.setup.ts                     # Jest setup
│   ├── eslint.config.mjs 
│   ├── next.config.ts
│   ├── tailwind.config.ts                # Brand colours and tokens
│   ├── tsconfig.json
│   └── package.json
│
├── messaging/                            # External Firebase microservice
│   └── .gitkeep                          # Populated in Sprint 2
│
├── database/
│   ├── migrations/                       # TypeORM migration files
│   ├── schema/
│   │   └── schema.sql                    # Full PostgreSQL schema
│   └── seeds/                            # Demo seed data
│
├── docs/
│   ├── architecture/                     # Architecture diagrams
│   ├── wireframes/                       # UI wireframes
│   ├── brand-style-guide.md              # Agile Bridge brand guidelines
│   └── srs.md                            # Software Requirements Specification
│
├── .gitignore
├── .npmrc
├── CONTRIBUTING.md                       # Branching strategy and commit conventions
├── docker-compose.yml                    # Local PostgreSQL development database
├── package.json                          # Root npm workspace coordinator
├── package-lock.json
├── README.md
└── tsconfig.json                         # Shared TypeScript base config
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (for local PostgreSQL)
- Git (system-installed — no GUI clients)

### Installation

```bash
# Clone the repository
git clone https://github.com/COS301-SE-2026/Uni-Textbook-Marketplace.git
cd Uni-Textbook-Marketplace

# Install all dependencies from root (installs both frontend and backend)
npm install
```

### Running locally

```bash
# Start the database
docker compose up -d

# Start the backend (from root)
npm run backend

# Start the frontend (from root)
npm run frontend
```

### Environment variables

Copy the example env files and fill in the values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

> Full environment setup guide will be added to `/docs/setup.md` in Sprint 2.

---

## Branching Strategy

We follow **GitHub Flow**:

| Branch | Purpose |
|---|---|
| `main` | Always stable and production-ready. Protected — no direct commits. |
| `develop` | Integration branch for completed features. |
| `feature/[issue-number]-[name]` | New features (e.g. `feature/7-backend-scaffold`) |
| `fix/[issue-number]-[name]` | Bug fixes (e.g. `fix/12-listing-validation`) |
| `docs/[name]` | Documentation updates (e.g. `docs/srs-update`) |
| `test/[name]` | Test additions (e.g. `test/auth-unit-tests`) |

All changes go through a **Pull Request** with at least one review before merging into `develop`. Only sprint-complete code merges into `main`.

> See [CONTRIBUTING.md](./CONTRIBUTING.md) for full branching rules and commit conventions.

---

## Testing

| Layer | Framework |
|---|---|
| Backend unit tests | Jest |
| Backend integration tests | Jest + Supertest |
| Frontend component tests | Jest + React Testing Library |
| End-to-end tests | Cypress |

```bash
# Run backend tests
npm run test:backend

# Run backend tests with coverage
cd backend && npm run test:cov

# Run frontend tests
npm run test:frontend

# Run all tests from root
npm run test:all
```

---

## Architecture Overview

The system follows a **modular monolith** architecture for core features with an **external messaging microservice**:

- **Frontend** : Next.js (React) responsive web app
- **Backend** : NestJS modular monolith (Auth, Listings, Moderation, Modules)
- **Database** : Azure Database for PostgreSQL
- **Messaging** : Firebase Firestore real-time chat (external microservice)
- **Hosting** : Azure Static Web Apps + Azure App Service
- **CI/CD** : GitHub Actions

> Full architecture diagram available in the [SRS document](https://github.com/COS301-SE-2026/Uni-Textbook-Marketplace/blob/main/docs/srs.md).

---

## The Team

### Tiego Mokwena - Project Manager & UI Engineer 1 & DevOps
> Sprint planning, client communication, milestone tracking, frontend UI development (Next.js), CI/CD pipeline (GitHub Actions), Azure deployment, and QA strategy.

[![GitHub](https://img.shields.io/badge/GitHub-tl21thebe-181717?logo=github)](https://github.com/tl21thebe)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Tiego%20Mokwena-0077B5?logo=linkedin)](https://www.linkedin.com/in/tiego-leroy-t-mokwena-5273413b3)

---

### Josh Kretschmer - Services Engineer 1 & Integration Engineer 1
> Backend API development (NestJS), real-time messaging microservice (Socket.io/Firebase), integration between frontend and backend, Docker environment setup.

[![GitHub](https://img.shields.io/badge/GitHub-JoshKretschmer-181717?logo=github)](https://github.com/JoshKretschmer)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Josh%20Kretschmer-0077B5?logo=linkedin)](https://www.linkedin.com/in/josh-kretsch-754804401)

---

### Gift Mohuba - Services Engineer 2 & Integration Engineer 2
> Backend API development, user authentication (JWT), university email verification, API security, integration between frontend and backend.

[![GitHub](https://img.shields.io/badge/GitHub-GiftMHB-181717?logo=github)](https://github.com/GiftMHB)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Gift%20Mohuba-0077B5?logo=linkedin)](https://www.linkedin.com/in/gift-mohuba-67097b23b/)

---

### Neo Bosoga - Data Engineer & Backend Tester
> PostgreSQL database design and management, complex queries, database indexing, seed data, backend unit tests, and integration tests.

[![GitHub](https://img.shields.io/badge/GitHub-u23591732-181717?logo=github)](https://github.com/u23591732)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Neo%20Bosoga-0077B5?logo=linkedin)](https://www.linkedin.com/in/neo-bosoga-67167227a/)

---

### Omphemetse Mokgothadi - UI Engineer 2 & Frontend Tester
> Frontend UI components (Next.js/React), responsive design, filter UI, messaging UI (Socket.io client), frontend unit tests, and end-to-end tests (Cypress).

[![GitHub](https://img.shields.io/badge/GitHub-nalediO-181717?logo=github)](https://github.com/nalediO)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Omphemetse%20Mokgothadi-0077B5?logo=linkedin)](https://www.linkedin.com/in/omphemetse-mokgothadi-7671aa367/)

---

## Contact

| | |
|---|---|
| Team email | nexusdev.cos301@gmail.com |
| Client | Agile Bridge |
| University | University of Pretoria - COS 301 Software Engineering 2026 |

---

*© 2026 NexusDev - University of Pretoria COS 301 Capstone Project*
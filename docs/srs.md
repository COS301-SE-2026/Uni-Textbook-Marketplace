# Software Requirements Specification (SRS)

**Project:** Uni Textbook Marketplace
**Team:** NexusDev
**Client:** Agile Bridge
**University:** University of Pretoria - COS 301 Software Engineering 2026
**Document version:** 1.0 - Sprint 1
**Last updated:** 6 May 2026
**Author:** Tiego Mokwena (Project Manager)

---

## Document Status

| Section | Status | Owner | Sprint |
|---|---|---|---|
| 1. Introduction |  Complete | Tiego | Sprint 1 |
| 2. User Stories / User Characteristics |  Complete | Tiego | Sprint 1 |
| 3. Use Cases + Use Case Diagrams |  In progress | Gift | Sprint 2 |
| 4. Functional Requirements |  In progress | Josh + Gift | Sprint 2 |
| 5. API Service Contracts |  In progress | Josh | Sprint 2 |
| 6. Domain Model |  In progress | Neo | Sprint 2 |
| 7. Architectural Requirements |  In progress | Tiego | Sprint 2 |
| 8. Technology Requirements |  In progress | Tiego | Sprint 2 |

> **Note:** This document follows an incremental Agile approach. Sections are
> added and refined each sprint. Old versions of changed sections are moved
> to the Appendix. The document must be complete by Demo 1 on 22 May 2026.

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Business Need](#11-business-need)
   - 1.2 [Platform Overview](#12-platform-overview)
   - 1.3 [Scope](#13-scope)
   - 1.4 [Constraints](#14-constraints)
   - 1.5 [Definitions and Abbreviations](#15-definitions-and-abbreviations)
2. [User Stories / User Characteristics](#2-user-stories--user-characteristics)
   - 2.1 [Actors](#21-actors)
   - 2.2 [User Stories — Verified Student (Buyer)](#22-user-stories--verified-student-buyer)
   - 2.3 [User Stories — Verified Student (Seller)](#23-user-stories--verified-student-seller)
   - 2.4 [User Stories — Admin](#24-user-stories--admin)
3. [Use Cases + Use Case Diagrams](#3-use-cases--use-case-diagrams) *(Sprint 2)*
4. [Functional Requirements](#4-functional-requirements) *(Sprint 2)*
5. [API Service Contracts](#5-api-service-contracts) *(Sprint 2)*
6. [Domain Model](#6-domain-model) *(Sprint 2)*
7. [Architectural Requirements](#7-architectural-requirements) *(Sprint 2)*
   - 7.1 [Quality Requirements](#71-quality-requirements)
   - 7.2 [Architectural Patterns](#72-architectural-patterns)
   - 7.3 [Design Patterns](#73-design-patterns)
8. [Technology Requirements](#8-technology-requirements) *(Sprint 2)*
9. [Appendix](#9-appendix)

---

## 1. Introduction

### 1.1 Business Need

University students across South Africa face significant challenges when
trying to access affordable textbooks each semester. The current landscape
for buying and selling used textbooks is fragmented and inefficient, and students rely on informal channels such as WhatsApp groups, Facebook
Marketplace, and word of mouth. These platforms were never designed for
academic textbook trading and suffer from three critical problems.

**First, discovery is broken.** Listings lack critical structured details
such as edition, condition, and module code. A student looking for the
fifth edition of a specific textbook for a specific module has no reliable
way to filter for exactly what they need. They are forced to scroll through
irrelevant listings and contact multiple sellers only to discover the
edition is wrong.

**Second, trust is absent.** There is no mechanism to verify that a seller
is a genuine university student. Privacy breaches are common, buyers and
sellers exchange personal contact details with strangers before any
agreement is reached, exposing both parties to risk.

**Third, the process is misaligned with academic needs.** No existing
platform understands the academic calendar, module codes, or faculty
structure. Students cannot browse by module, filter by semester, or find
listings relevant to their specific course.

The Uni Textbook Marketplace directly addresses all three problems by
providing a purpose-built, verified, module-aware platform for university
students.

---

### 1.2 Platform Overview

The Uni Textbook Marketplace is a responsive web-based platform that
enables verified university students to buy, sell, and swap second-hand
textbooks in a safe, structured, and module-aware environment. Students
register using their university email address, which is verified via a
one-time password (OTP). Once verified, students
can create structured textbook listings with details including ISBN,
edition, condition, annotation level, module code, price, and supplementary
notes. Buyers can browse listings filtered by faculty, module code,
semester, edition, price range, and condition. A privacy-first in-app
messaging system allows students to communicate without exposing personal
contact details until both parties explicitly consent to share them. An
admin moderation layer ensures listing quality. All listings enter a
pending state and are reviewed by an admin before becoming visible to other
students. The platform is built for Agile Bridge and hosted on Microsoft
Azure.

---

### 1.3 Scope

#### In scope for MVP (Demo 1 — 22 May 2026)

- Student registration with university email domain verification (OTP)
- Student login with JWT-based authentication
- Role-based access control (Student vs Admin)
- Structured textbook listing creation (UC1): ISBN, title, author,
  edition, condition, annotation level, module code, price, has notes
- Listing detail view for students (UC2): view own listings (approved +
  pending) and browse others' approved listings
- Admin listing review dashboard (UC3): approve or reject pending
  listings with soft delete and audit trail
- Module code search-as-you-type lookup, filterable by university
- Basic themes and form validation
- Responsive web interface (mobile + desktop)
- GitHub Actions CI/CD pipeline
- PostgreSQL database with full schema and seed data

#### In scope for later sprints (Demo 2+)

- Privacy-first in-app messaging (Firebase Firestore microservice)
- Smart search filters (price cap, edition, condition, annotation level)
- Saved searches and notifications
- Meetup ratings (successful, no-show, cancelled)
- Wanted board per module
- Swap mode (book-for-book or swap plus cash)
- Pickup preferences (on-campus spots, residences)
- Trust signals (verified badge, account age, listing history)
- Bundle deals per module
- Admin ban and report management tools

#### Explicitly out of scope

- Payment processing: the platform facilitates meetup-based exchanges
  only. No payment gateway will be integrated in any sprint.
- Mobile application: a React Native (Expo) mobile app is a stretch goal
  only, pursued after all core web requirements are delivered.
- ISBN metadata API lookup: manual entry only for Demo 1. External ISBN
  API integration is deferred.
- Online textbook renting system: identified as a potential future feature
  with legal considerations. Stubbed for now.
- Multiple university support beyond UP: initial allowlist is
  @tuks.co.za. Multi-institution support is deferred.

---

### 1.4 Constraints

| Constraint | Detail |
|---|---|
| Hosting | Provided by Agile Bridge on Microsoft Azure. The team does not control the infrastructure provider. |
| Authentication | OTP email verification is required. Students must verify their university email before accessing seller and messaging features. |
| Email allowlist | Only @tuks.co.za in the initial MVP. The allowlist is configurable for future institutions. |
| No payment processing | The MVP focuses entirely on meetup-based exchanges. No payment gateway, escrow, or financial transaction of any kind is included. |
| ISBN metadata | External ISBN lookup APIs are not integrated for Demo 1. All book details are entered manually by the seller. The system allows manual edits to compensate for incomplete metadata. |
| No mobile app in MVP | The platform is a responsive web application only. React Native is a post-MVP stretch goal. |
| Firebase credentials | Firebase Firestore credentials for the messaging microservice are pending from Agile Bridge. The messaging layer is mocked for Demo 1. |
| Azure environment access | Azure dev and staging environments are expected to be provisioned by Agile Bridge in week 2 of Sprint 1. Deployment is blocked until access is granted. |

---

## 2. User Stories / User Characteristics

### 2.1 Actors

The system has three actor types:

**Verified Student (Buyer)**
A registered and OTP-verified university student who uses the platform
primarily to find and purchase or swap textbooks. They have a university
email address on the approved allowlist. They can browse all approved
listings, view listing details, contact sellers via in-app messaging, and
save listings to favourites. They cannot create listings, access admin
tools, or view pending listings created by other students.

**Verified Student (Seller)**
A registered and OTP-verified university student who uses the platform to
list textbooks for sale or swap. This is the same account type as the
buyer — any verified student can act as both buyer and seller simultaneously.
They can create listings, view their own listings (including pending ones
awaiting admin review), edit or remove their own listings, and receive
messages from interested buyers.

**Admin**
A platform moderator appointed by Agile Bridge. Admin accounts are seeded
manually — there is no public sign-up flow for admin roles. Admins can
view all pending listings, approve or reject listings with notes, soft-
delete listings that violate platform rules, and access the admin dashboard.
Admins inherit the same login/logout flow as students but have elevated
role-based permissions enforced at the API level via JWT role claims.

---

### 2.2 User Stories - Verified Student (Buyer)

**US-B01**
As a verified student buyer, I want to browse approved textbook listings
filtered by module code so that I can quickly find the exact textbook
required for my course without scrolling through irrelevant listings.

**US-B02**
As a verified student buyer, I want to view the full details of a listing which is including edition, condition, annotation level, price, and whether study
notes are included. So that I can make an informed decision about whether
the textbook meets my needs before contacting the seller.

**US-B03**
As a verified student buyer, I want to search for textbooks by title,
author, ISBN, or module code so that I can find listings even when I do
not know the exact module code.

**US-B04**
As a verified student buyer, I want to filter listings by condition (new,
good, fair, poor) and price range so that I can find affordable textbooks
that meet my quality expectations within my budget.

**US-B05**
As a verified student buyer, I want to contact a seller through in-app
messaging without exposing either party's personal contact details so that
I can negotiate and arrange a meetup safely and privately.

---

### 2.3 User Stories - Verified Student (Seller)

**US-S01**
As a verified student seller, I want to create a structured listing with
my textbook's ISBN, title, author, edition, condition, annotation level,
module code, and price so that buyers can find exactly what they need and
assess the listing without having to contact me first.

**US-S02**
As a verified student seller, I want to see my listings that are pending
admin review, which are clearly marked with a "Pending Review" badge so that I
know my listing has been submitted successfully and understand why it is
not yet visible to other students.

**US-S03**
As a verified student seller, I want to indicate whether my listing
includes supplementary study notes so that buyers who need additional
study materials can identify and prioritise my listing.

**US-S04**
As a verified student seller, I want to view all my active approved
listings in one place so that I can track what I currently have listed
and manage my inventory.

**US-S05**
As a verified student seller, I want to receive a notification when an
admin has approved or rejected my listing so that I know whether my
textbook is now visible to buyers or whether I need to revise my listing
details.

---

### 2.4 User Stories - Admin

**US-A01**
As an admin, I want to see a dashboard of all listings currently in
PENDING status so that I can review new submissions and ensure they meet
platform standards before they become visible to students.

**US-A02**
As an admin, I want to approve a pending listing with a single action so
that verified, accurate listings become available to buyers as quickly as
possible without unnecessary delays.

**US-A03**
As an admin, I want to reject a pending listing with an optional note
explaining the reason so that the seller understands why their listing was
not approved and can correct the issue and resubmit.

**US-A04**
As an admin, I want rejected listings to be soft-deleted and retained in the
database with a deleted_at timestamp and audit log entry so that there
is a complete and recoverable record of all moderation actions for
accountability purposes.

**US-A05**
As an admin, I want to browse all approved listings the same way a student
can so that I can monitor listing quality and identify any listings that
should be removed after approval.

---

## 3. Use Cases + Use Case Diagrams

>  **Sprint 2** - To be completed by Gift Mohuba.
>
> This section must include:
> - High-level use case diagrams for UC1, UC2, and UC3
> - Use case diagram for Authentication (base features)
> - Actor hierarchy diagram (User → Student, User → Admin)
> - High-level use case descriptions (TUCBW / TUCEW format)
> - Expanded use case tables (actor-system interaction step by step)
> - Requirements-use case traceability matrix

---

## 4. Functional Requirements

>  **Sprint 2** - To be completed by Josh Kretschmer and Gift Mohuba.
>
> This section must include functional requirements assigned to subsystems:
> - AuthService (FR-AUTH-01 to FR-AUTH-XX)
> - ListingService (FR-LIST-01 to FR-LIST-XX)
> - ModerationService (FR-MOD-01 to FR-MOD-XX)
> - ModulesService (FR-MOD-01 to FR-MOD-XX)

---

## 5. API Service Contracts

>  **Sprint 2** - To be completed by Josh Kretschmer.
>
> This section must include request/response contracts for all endpoints:
> - POST /auth/register
> - POST /auth/verify-otp
> - POST /auth/login
> - POST /listings
> - GET /listings
> - GET /listings/mine
> - GET /listings/:id
> - GET /admin/listings/pending
> - PATCH /admin/listings/:id/approve
> - PATCH /admin/listings/:id/reject
> - GET /modules?search=COS&university=UP

---

## 6. Domain Model

>  **Sprint 2** - To be completed by Neo Bosoga.
>
> This section must include:
> - A valid UML class diagram illustrating the software solution
> - All entities: University, User, OTP, Module, Book, Listing, AuditLog
> - Relationships, multiplicities, and key attributes
> - The diagram must be exported as an image and embedded in this document

---

## 7. Architectural Requirements

>  **Sprint 2** - To be completed by Tiego Mokwena.

### 7.1 Quality Requirements

> This subsection must specify and quantify system quality requirements.
> Placeholder targets based on technical spike and client requirements:

| Quality Attribute | Requirement | Measure |
|---|---|---|
| Performance | Multi-filter listing search must return results quickly | < 100ms query execution (validated in technical spike) |
| Reliability | Core listing and auth features must remain available if messaging service is down | Graceful degradation - messaging failure does not affect listings |
| Scalability | API layer must be stateless to support horizontal scaling | JWT-based auth, no server-side session state |
| Security | Only verified university students can create listings or send messages | OTP verification + JWT role claims enforced on all protected routes |
| Maintainability | Codebase must be modular and independently deployable per service | NestJS modular monolith - Auth, Listings, Moderation, Modules as bounded modules |
| Accessibility | UI must meet WCAG AA contrast standards | SonarCloud accessibility checks enforced on all PRs |

### 7.2 Architectural Patterns

>  **Sprint 2** - To be completed by Tiego Mokwena.
>
> Must cover: modular monolith pattern for core, external microservice
> pattern for messaging, stateless API layer, read-heavy performance
> strategy (indexes, pagination, caching).

### 7.3 Design Patterns

>  **Sprint 2** - To be completed by Tiego Mokwena.
>
> Must cover: Repository pattern (TypeORM), Guard pattern (JWT + Role),
> DTO pattern (class-validator), Observer pattern (notifications).

---

## 8. Technology Requirements

>  **Sprint 2** - To be completed by Tiego Mokwena.
>
> This section must include the full technology stack with justification
> for each choice, referencing the client's architectural requirements.

| Layer | Technology | Justification |
|---|---|---|
| Frontend | Next.js 15 (React) + TypeScript | SSR for read-heavy listing browsing, responsive by default, team expertise |
| Backend | NestJS + TypeScript | Modular architecture maps to client's modular monolith requirement |
| Database | Azure Database for PostgreSQL | Relational data model, full-text search, Azure-native |
| Authentication | Azure B2C OTP + JWT | University email OTP verification, stateless JWT for API access |
| Messaging | Firebase Firestore | External microservice for real-time chat, graceful degradation |
| Hosting | Azure App Service + Azure Static Web Apps | Client-provided Azure infrastructure |
| CI/CD | GitHub Actions | Automated build, test, and deploy on every PR |
| Testing (backend) | Jest + Supertest | NestJS first-class support, integrated with CI |
| Testing (frontend) | Jest + React Testing Library + Cypress | Component and e2e testing |
| Code quality | SonarCloud | Static analysis, security hotspot detection, coverage reporting |
| API documentation | Swagger (OpenAPI) | Auto-generated from NestJS decorators |

---

## 9. Appendix

> This section holds previous versions of changed SRS sections.
> Sections are moved here when substantially updated, not deleted.
> This maintains a historical record of requirement evolution.

*No appendix entries yet - document is in its first version.*

---

*© 2026 NexusDev - University of Pretoria COS 301 Capstone Project*
*This document is version-controlled in the GitHub repository under /docs/srs.md*
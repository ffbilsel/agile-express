# 🚀 Agile Express

> A production-grade, full-stack agile project management platform — built solo in **4 weeks** during the OBSS 2025 Java Summer Internship.

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=springboot)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![OpenLDAP](https://img.shields.io/badge/OpenLDAP-Auth-lightgrey?style=flat-square)

---

## 🧑‍💻 About This Project

This is a **solo project** I built entirely from scratch over **4 weeks** as part of the OBSS 2025 Java Summer Internship. Competing individually against other intern candidates, the challenge was to deliver a fully functional, production-quality agile project management system — from database schema to UI — in a single month.

The evaluation rubric covered functional completeness, architecture, security, UX, and maintainability, totalling **120 points**. I implemented all required features plus multiple extra features (burndown charts, scheduled email notifications, advanced search/filtering), achieving a comprehensive implementation that went well beyond the base requirements.

**This project demonstrates my ability to:**
- Architect and deliver a complex full-stack system independently under time pressure
- Implement enterprise-grade security (LDAP + OAuth2 + JWT) from scratch
- Make real architectural decisions and defend them — the internship included a formal jury presentation
- Build clean, maintainable code across a multi-layered system spanning both backend and frontend

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack & Why I Chose It](#tech-stack--why-i-chose-it)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [Security Implementation](#security-implementation)
- [Getting Started](#getting-started)
- [Development Notes](#development-notes)
- [Internship Context](#internship-context)

---

## ✨ Features

### 🗂️ Project Management
- Create and manage multiple projects with configurable start/end dates
- Assign Project Managers and Team Leads per project
- Product backlog with full issue lifecycle management
- Project settings: edit, delete, user management via a dedicated panel

### 🏃 Sprint Management
- Create, activate, cancel, and complete sprints
- Kanban board with customizable status columns (TODO → IN PROGRESS → TEST → DONE → Unassigned)
- Sprint progress tracking with story point summaries
- **Sprint Burndown Chart** (Chart.js) comparing actual vs. ideal velocity — an extra feature beyond the base requirements

### 🎯 Issue Tracking
- Issue types: **Story**, **Bug**, **Epic**, **Task**
- Story points, estimated effort, and status per issue
- Assignee and assigner distinction (both tracked)
- Full issue detail view with all metadata, efforts, and team info

### ⏱️ Effort Logging
- Log time efforts against individual issues with start/end timestamps
- Auto-calculated duration displayed prominently
- Time Analysis panel per effort entry
- Multiple effort entries per issue supported

### 👥 User & Role Management
- Four roles: **Admin**, **Project Manager**, **Team Lead**, **Team Member**
- Per-project user management with inline role assignment
- LDAP users automatically provisioned with Team Member role on first login
- Role changes cascade: issues unlinked, project memberships cleared, sessions invalidated

### 🔍 Search & Advanced Filtering
- Global search bar with results grouped by Projects and Issues
- Advanced filter panel: Project, Type, Status, User, Title, Description
- URL-based filter state — filters persist across page refreshes and are shareable
- Active filter chips with one-click clear

### 📊 Dashboard
- High-level stats: Active Projects, Open Issues, Active Sprints, Completed This Week
- My Projects cards with progress bars and team member avatars
- Role-aware rendering throughout

### 📧 Scheduled Notifications
- Gmail SMTP integration — an **extra feature** added beyond the base spec
- Sprint-end reminder emails automatically sent at **9 AM daily** to Project Managers and Team Leads
- Implemented with Spring's `@Scheduled` and Spring Mail

---

## 🛠️ Tech Stack & Why I Chose It

### Backend — Java 17 + Spring Boot 3.x

I chose Spring Boot because it's the industry standard for Java backend development and the framework I have the most production experience with (from my time at Turkish Airlines and Avsos). It gave me:

- **Spring Security 6** for the full RBAC + JWT + LDAP + OAuth2 security pipeline — far more powerful than rolling custom auth
- **Spring Data JPA / Hibernate** for clean ORM with custom JPQL queries for the complex filtering logic
- **`@PreAuthorize` on controllers** — method-level security enforcement, not just route-based
- **Spring Mail + `@Scheduled`** — dead simple email notification scheduling without adding another dependency
- **Swagger / OpenAPI** — auto-generated API documentation throughout development

**Why not Quarkus?** I had migrated Spring Boot microservices to Quarkus at Avsos, so I know the tradeoffs. For a solo 4-week project, Spring Boot's maturity and my existing familiarity outweighed Quarkus's startup-time benefits.

### Frontend — Next.js 14 + TypeScript + TanStack Query

Next.js with the App Router is the modern React standard and offers SSR capabilities while keeping a familiar component model. **TypeScript** was a deliberate choice — catching type errors at compile time saved hours of debugging during a tight timeline. **ESLint** enforced consistency throughout.

**TanStack Query (React Query v5)** was the most impactful frontend decision. Instead of managing loading/error/caching state manually in each component, React Query gave me automatic cache invalidation on mutations, optimistic updates for a snappy UI, and background refetching — all with API calls neatly encapsulated in custom hooks so components stay clean and declarative.

**Error and Confirmation Contexts** — I built global React contexts for toast-style error handling and confirmation dialogs, keeping UI feedback consistent across the app without prop-drilling.

### Why MySQL?

MySQL 8.0 was appropriate for this domain — clearly relational entities with well-defined boundaries. The ER diagram reflects clean normalization. The internship spec even flagged the search feature as a SQL vs. NoSQL decision point; I chose SQL with custom JPQL queries since the data relationships made a relational approach cleaner and more consistent.

### Infrastructure — Docker Compose

All four services (Next.js frontend, Spring Boot backend, MySQL, OpenLDAP) are containerized and orchestrated with Docker Compose. One command runs the whole stack. Persistent volumes for both MySQL and OpenLDAP data.

---

## 🏗️ Architecture

Full-stack layered monolith — simple to operate and deploy, with clean domain boundaries (Project, Sprint, Issue, User) that would allow microservice extraction later if needed.

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│                   Next.js Frontend :3000                    │
│         (App Router, React Query, Custom Hooks)             │
└──────────────┬──────────────────────────────────────────────┘
               │ HTTP / REST (Bearer JWT)
┌──────────────▼──────────────────────────────────────────────┐
│                    Application Layer                         │
│                  Spring Boot Backend :8080                   │
│                                                             │
│   Controllers (@PreAuthorize) → Services → Repositories     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Security Layer                      │   │
│  │  JWT Filter │ RBAC │ LDAP Integration │ Google OAuth2 │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│        Email/Notification Service (@Scheduled)              │
└──────┬───────────────────────────────┬───────────────────────┘
       │ JDBC                          │ LDAP
┌──────▼───────┐              ┌────────▼────────┐
│  MySQL 8.0   │              │   OpenLDAP      │
│  :3306       │              │  :389 / :636    │
│  [persistent]│              │  [persistent]   │
└──────────────┘              └─────────────────┘
```

| External System | Purpose |
|----------------|---------|
| Google OAuth2 | Social login |
| OpenLDAP | Corporate directory auth & user provisioning |
| Gmail SMTP | Sprint reminder notifications |

---

## 🗄️ Database Design

Normalized relational schema with 7 entities:

```
User ──────────────────────────────────────────────────────┐
 │ manages / leads                                          │ logs effort
 ▼                                                         │
Project ──── has backlog/active ──► Sprint ──► Issue ◄─────┘
 │                                              │
 │ has members                                  │ current status
 ▼                                              ▼
project_team_members                    Status (per-project custom statuses)
```

| Entity | Key Fields |
|--------|-----------|
| `User` | `username` PK, `email`, `role (UserRole enum)`, `tokenVersion` |
| `Project` | `id`, `name` UK, `startDate`, `endDate`, `manager_username` FK, `team_leader_username` FK, `backlog_sprint_id` FK, `active_sprint_id` FK |
| `Sprint` | `id`, `startDate`, `endDate`, `sprintStatus enum`, `project_id` FK |
| `Issue` | `id`, `title`, `description`, `storyPoints`, `estimatedEffort`, `issueType enum`, `status_id` FK, `sprint_id` FK, `assigner_username` FK, `assignee_username` FK |
| `Effort` | `id`, `description`, `startTime`, `endTime`, `issue_id` FK, `person_username` FK |
| `Status` | `id`, `name`, `project_id` FK — custom per project |
| `project_team_members` | `project_id` PK+FK, `user_username` PK+FK — join table |

**Notable design decisions:**

- **`tokenVersion` on User** — incrementing this integer invalidates all existing JWTs for that user, enabling forced re-login on role changes without maintaining a token blacklist
- **Separate `assigner` and `assignee`** — both tracked on Issue for audit clarity
- **`backlog_sprint_id` and `active_sprint_id` on Project** — makes "move to sprint" and board queries simple and efficient
- **Per-project custom `Status` entities** — teams define their own workflow columns rather than a hardcoded global set

---

## 🔐 Security Implementation

### Authentication Pipeline

```
[LDAP Credentials]              [Google OAuth2]
        │                              │
        ▼                              ▼
Spring Security              Spring OAuth2 Client
authenticates vs             Google consent → callback
OpenLDAP :389                        │
        │                              │
        └──────────────┬───────────────┘
                       ▼
          User fetched/created in DB
          (first login → auto-provisioned as Team Member)
                       │
                       ▼
                JWT issued
          (signed, contains username + tokenVersion)
                       │
                       ▼
           Stored client-side, sent as Bearer token
           Validated on every request via Spring Security filter
           (tokenVersion in token must match DB — catches role changes)
```

### Authorization

- `@PreAuthorize` on every controller method — role checks at the method level, not just route-level
- Custom `tokenVersion` check in JWT filter — if DB version doesn't match token, request is rejected
- Search results filtered by the requesting user's role and project memberships

### Role Change Security Flow

```
Admin changes a user's role
    → All issues unlinked from user
    → User removed from all project memberships
    → tokenVersion incremented in DB
    → Next request with old JWT rejected → re-login required
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- Ports `3000`, `8080`, `3306`, `389`, `636` available

### Run the Stack

```bash
git clone https://github.com/fatihfurkanbilsel/agile-express.git
cd agile-express

docker compose up --build
```

| Container | Service | Port |
|-----------|---------|------|
| `nextjs-fe` | Next.js Frontend | `:3000` |
| `springboot-be` | Spring Boot API | `:8080` |
| `mysql-db` | MySQL 8.0 | `:3306` |
| `openldap-server` | OpenLDAP | `:389` / `:636` |

Open **http://localhost:3000** — sign in with Google OAuth2 or LDAP credentials.

**Swagger UI:** http://localhost:8080/swagger-ui.html

### Default Config

```yaml
LDAP:
  Organisation: OBSS
  Domain:       obss.com
  Base DN:      dc=obss,dc=com
  Admin PW:     adminpassword

Database:
  Name:     mydatabase
  User:     myuser
  Password: mypassword
```

---

## 🧪 Development Notes

| Area | Implementation |
|------|---------------|
| API Docs | Swagger / OpenAPI — auto-generated, available at `/swagger-ui.html` |
| Testing | Unit tests for service and repository layers |
| Error Handling | Global `@ControllerAdvice` exception handler with custom exception hierarchy |
| Logging | Structured SLF4J logging throughout the backend |
| Queries | Custom JPQL queries for complex cross-entity search and filtering |
| Frontend Quality | ESLint enforced; all API calls encapsulated in custom React Query hooks |
| Frontend UX | Global Error and Confirmation React Contexts for consistent UI feedback |

### Project Structure

```
agile-express/
├── nextjs-fe/                  # Next.js 14 frontend
│   ├── app/                    # App Router pages & layouts
│   ├── components/             # Reusable UI components
│   ├── hooks/                  # React Query hooks (one per domain)
│   └── contexts/               # Error + Confirmation global contexts
├── springboot-be/              # Spring Boot backend
│   ├── controller/             # REST controllers with @PreAuthorize
│   ├── service/                # Business logic layer
│   ├── repository/             # Spring Data JPA repos + JPQL queries
│   ├── entity/                 # JPA entities
│   └── security/               # JWT filter, OAuth2 config, LDAP config
├── docker-compose.yml          # Full stack orchestration
└── README.md
```

---

## 🏆 Internship Context

This project was the sole deliverable of the **OBSS 2025 Java Summer Internship** — a competitive program where interns work individually to build a full agile project management system from scratch. The evaluation criteria (120 points total) covered:

| Category | Weight |
|----------|--------|
| Required features (LDAP, OAuth2, Dashboard, Board, Tasks, Sprints, Search) | 50% |
| Extra features (Burndown chart, Email notifications, other extras) | 20% |
| Architecture, Security, Maintainability, Technology choices | 27% |
| Application UI & UX | 18% |
| Formal jury presentation | 5% |

All required features were implemented. Both listed extra features — burndown chart and scheduled email notifications — were delivered. The final presentation included a formal defense of every architectural and technology decision to a jury panel.

---

*Built by **Fatih Furkan Bilsel** — [fatihfurkanbilsel@gmail.com](mailto:fatihfurkanbilsel@gmail.com)*

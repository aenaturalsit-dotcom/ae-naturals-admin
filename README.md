# 🌸 AE Naturals Admin Dashboard

A comprehensive, enterprise-grade administrative dashboard built with **Next.js 15**, **TypeScript**, **Shadcn UI**, **TanStack Query**, and **Zod**. This application provides store owners and administrators with full control over their e-commerce operations, including product inventory management, order tracking, customer management, and multi-tenant store administration.

The dashboard is designed with a **scalable, modular, and type-safe architecture**, enabling efficient data fetching, caching, and state synchronization through **TanStack Query**, while delivering a modern, accessible, and responsive UI using **Shadcn UI** components.

**Zod** is integrated for **schema validation and type-safe data handling**, ensuring robust validation of forms, API requests, and responses across the application. This improves reliability by enforcing consistent data structures and reducing runtime errors in both client and server interactions.

Key architectural highlights include:

* **Next.js 15 App Router** for optimized routing, server components, and performance.
* **TypeScript-first development** for strong typing and maintainable code.
* **TanStack Query** for advanced server-state management, caching, and background synchronization.
* **Shadcn UI** for a clean, customizable, and accessible component system.
* **Zod** for runtime schema validation, form validation, and API contract enforcement.
* **Modular feature-based architecture** to support scalability and future expansion.
* **Role-based administrative workflows** for secure store and user management.
* **Responsive dashboard design** optimized for both desktop and tablet usage.

The result is a **production-ready admin platform** capable of managing complex e-commerce operations while maintaining high performance, reliability, and developer experience.


🔗 **[Live Demo](https://flower-fairy-admin.vercel.app)** | 🖥️ **[GitHub Repository](https://github.com/gusainDeekshu/flower-fairy-admin)**

---

## ✨ Features

* **🔐 Secure Authentication:** Admin login system with protected routes and role-based access control.
* **📦 Inventory Management:** Comprehensive interface to add, edit, and delete products with complex attributes and variants.
* **📋 Order Monitoring:** Real-time dashboard to track incoming orders, update fulfillment status (PAID, SHIPPED, DELIVERED), and view customer details.
* **🏗️ Multi-Store Control:** Manage different storefront configurations, industry settings, and branding metadata from a single interface.
* **📊 Data Synchronization:** Seamless integration with the backend API using **TanStack Query** for efficient caching and optimistic updates.
* **🌙 Professional UI:** Modern design featuring a sidebar-based navigation, data tables, and dynamic modals for administrative tasks.

---

## 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **State Management** | TanStack Query + Zustand (Auth State) |
| **Styling** | Tailwind CSS + Shadcn UI |
| **Authentication** | Custom JWT Integration |
| **API Client** | Axios (configured with interceptors) |

---

## 📂 Folder Structure Overview

```text
src/
├── app/            # Next.js pages: Login, Dashboard, Orders, and Products
│   └── api/        # NextAuth and backend proxy routes
├── components/     # Admin-specific components (Sidebar, Product Modals)
├── hooks/          # Custom hooks for managing administrative data
├── lib/            # API client and global utility functions
├── services/       # Domain-specific API services (Orders, Products, Stores)
├── store/          # Global state management using Zustand
└── types/          # Shared TypeScript interfaces and type definitions

```

---

## 🚀 Getting Started

### 1. Prerequisites

* **Node.js** (v20+ recommended)
* **npm** or **pnpm**
* Access to a running [AE Naturals Backend](https://www.google.com/search?q=https://github.com/gusainDeekshu/flower-fairy-backend)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/gusainDeekshu/flower-fairy-admin.git
cd flower-fairy-admin

# Install dependencies
npm install

```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXTAUTH_SECRET="your_nextauth_secret"

```

### 4. Running Locally

```bash
# Start development server
npm run dev

# Build for production
npm run build
npm run start

```

---

## 👤 Author

**Deekshant Gusain**

* **GitHub**: [@gusainDeekshu](https://www.google.com/search?q=https://github.com/gusainDeekshu)
* **Portfolio**: [deekshantportfoliosite.netlify.app](https://deekshantportfoliosite.netlify.app/)

---

## 📄 License

This project is licensed under the **MIT License**.
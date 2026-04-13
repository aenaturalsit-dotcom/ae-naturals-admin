# 🌸 AE Naturals Admin 

The **AE Naturals Admin ** is a scalable, enterprise-level administrative platform designed to manage modern e-commerce operations efficiently. Built with **Next.js 15**, **TypeScript**, **Shadcn UI**, **TanStack Query**, and **Zod**, the dashboard provides a centralized control panel for administrators to manage products, orders, customers, and multi-store configurations.

The system is engineered with a **type-safe, modular, and performance-focused architecture**, enabling reliable data handling, efficient server-state management, and a responsive user experience suitable for both operational teams and store owners.

This dashboard acts as the **core operational interface** for the AE Naturals ecosystem, integrating seamlessly with the backend API and supporting scalable business workflows.

🔗 **Live Demo:** [https://flower-fairy-admin.vercel.app](https://flower-fairy-admin.vercel.app)
🖥️ **GitHub Repository:** [https://github.com/gusainDeekshu/flower-fairy-admin](https://github.com/gusainDeekshu/flower-fairy-admin)

---

# 🎯 Project Objectives

The primary goal of this admin platform is to deliver:

• Centralized control over e-commerce operations
• Efficient product and inventory management
• Real-time order monitoring and fulfillment workflows
• Multi-store administration from a single interface
• Secure role-based access management
• High-performance data synchronization with backend systems

The dashboard is designed to be **extensible**, allowing future modules such as analytics, marketing tools, and automation systems to be integrated easily.

---

# 🏗️ System Architecture Overview

The application follows a **layered architecture** to ensure maintainability and scalability.

### Presentation Layer

Built using:

* Next.js App Router
* Shadcn UI components
* Tailwind CSS

Responsibilities:

* UI rendering
* Form interactions
* Admin workflows
*  navigation

---

### State Management Layer

Two major state types are used:

**Client State**
Managed with:

* Zustand

Used for:

* Authentication state
* UI preferences
* session information

**Server State**
Managed with:

* TanStack Query

Handles:

* API caching
* background synchronization
* automatic refetching
* optimistic UI updates

---

### Data Validation Layer

All forms and API payloads are validated using:

Zod

This ensures:

• Type-safe validation
• API contract enforcement
• Reduced runtime errors
• Predictable data handling

Examples include:

* Product creation validation
* Order update validation
* Store configuration validation

---

### API Integration Layer

Communication with the backend is handled through:

Axios Client (centralized configuration)

Key capabilities:

• Token injection
• Request/response interceptors
• Automatic error handling
• Session-aware API calls

---

# ✨ Core Features

## 🔐 Secure Authentication & Role-Based Access

The dashboard implements a secure authentication system with protected routes and role-aware UI rendering.

Key capabilities:

• JWT-based authentication
• Protected dashboard routes
• Session validation
• Role-based feature access

Example roles:

Admin
Store Manager
Operations Team

This ensures sensitive operations such as product edits or order status changes remain controlled.

---

## 📦 Product & Inventory Management

A full-featured product management system allows administrators to manage catalog data effectively.

Capabilities include:

• Add new products
• Edit product information
• Manage product variants
• Update pricing and stock
• Delete inactive products
• Upload product images

The interface is designed for **high efficiency**, allowing bulk updates and quick editing.

---

## 📋 Order Monitoring & Fulfillment

The order management system enables administrators to track and manage order lifecycles.

Supported statuses:

PAID
PROCESSING
SHIPPED
DELIVERED
CANCELLED

Features include:

• Real-time order updates
• Customer details view
• Order history tracking
• Fulfillment workflow management

This allows the operations team to manage logistics smoothly.

---

## 🏗️ Multi-Store Administration

The dashboard supports a **multi-tenant architecture**, enabling management of multiple storefronts from a single admin interface.

Administrators can manage:

• Store branding
• Industry configurations
• Theme settings
• Business metadata

This architecture allows the system to scale into a **multi-brand platform**.

---

## 📊 Smart Data Synchronization

Using **TanStack Query**, the system ensures data is always up-to-date while minimizing unnecessary API calls.

Features include:

• Intelligent caching
• Background data refresh
• Mutation tracking
• Optimistic UI updates

This provides a fast and responsive experience even under heavy workloads.

---

## 🌙 Professional Admin Interface

The UI is designed for productivity and clarity.

Key design features:

Sidebar navigation system
Data tables for quick management
Modal-based editing workflows
Responsive layout for tablets and desktops
Accessible UI components

Powered by:

Shadcn UI + Tailwind CSS

---

# 🛠️ Technology Stack

| Layer          | Technology     |
| -------------- | -------------- |
| Framework      | Next.js 15     |
| Language       | TypeScript     |
| Server State   | TanStack Query |
| Client State   | Zustand        |
| Styling        | Tailwind CSS   |
| UI System      | Shadcn UI      |
| Validation     | Zod            |
| HTTP Client    | Axios          |
| Authentication | JWT            |

---

# 📂 Detailed Folder Structure

```
src/
```

## app/

Contains the routing and page structure using Next.js App Router.

Includes:

Login page
 layout
Orders management pages
Products management pages

Also contains API proxy routes if required.

---

## components/

Reusable UI components specifically designed for the admin interface.

Examples:

Sidebar navigation
Product creation modal
Edit product dialog
Order detail view
Admin data tables

These components follow a **feature-based structure** for scalability.

---

## hooks/

Custom hooks abstract complex logic such as:

Fetching products
Fetching orders
Handling mutations
Managing admin actions

This keeps components clean and maintainable.

---

## lib/

Core utilities and infrastructure logic.

Includes:

Axios API client
Token handling
Global helpers

---

## services/

Service layer responsible for interacting with the backend API.

Examples:

Product Service
Order Service
Store Service

This layer improves separation of concerns.

---

## store/

Global state managed by Zustand.

Handles:

Authentication state
Admin session info
UI preferences

---

## types/

Centralized TypeScript types used across the application.

Examples:

Product interfaces
Order interfaces
Store configuration types

This ensures strong typing across the system.

---

# 🚀 Getting Started

## 1. Prerequisites

Ensure the following tools are installed:

Node.js v20 or higher
npm or pnpm

You also need a running backend instance:

AE Naturals Backend

---

## 2. Clone the Repository

```bash
git clone https://github.com/gusainDeekshu/flower-fairy-admin.git
cd flower-fairy-admin
```

---

## 3. Install Dependencies

```bash
npm install
```

or

```bash
pnpm install
```

---

## 4. Environment Variables

Create a `.env.local` file in the root directory.

Example:

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXTAUTH_SECRET=your_nextauth_secret
```

These variables configure:

Backend API connection
Authentication security

---

## 5. Run the Development Server

```bash
npm run dev
```

Application will start at:

```
http://localhost:3000
```

---

## 6. Production Build

```bash
npm run build
npm run start
```

This generates an optimized production build.

---

# 🔄 Admin Workflow Lifecycle

### Product Management Flow

Admin → Create Product → Validate via Zod → Send API request → Update cache via TanStack Query

---

### Order Processing Flow

Customer places order → Backend updates order → Admin dashboard auto-syncs → Admin updates fulfillment status

---

### Authentication Flow

Admin login → JWT generated → Stored securely → Protected routes unlocked → Session validation on refresh

---

# 🔐 Security Considerations

The dashboard includes several security mechanisms:

Protected routes
Token-based authentication
Schema validation with Zod
Input sanitization
Role-based UI restrictions

These practices reduce risks such as:

Unauthorized access
Invalid API payloads
Data corruption

---

# 📈 Performance Optimizations

Several performance strategies were implemented:

Server Components for lighter client bundles
TanStack Query caching
Lazy-loaded modules
Optimized data fetching
Minimal re-renders

This ensures smooth performance even when handling large product catalogs.

---

# 🔮 Future Enhancements

The architecture supports future modules such as:

Analytics dashboard
Revenue reporting
Marketing campaign manager
Customer CRM tools
Shipping integrations
Automation workflows

---

# 👨‍💻 Author

Deekshant Gusain

GitHub
[https://github.com/gusainDeekshu](https://github.com/gusainDeekshu)

Portfolio
[https://deekshantportfoliosite.netlify.app](https://deekshantportfoliosite.netlify.app)

---

# 📄 License

This project is licensed under the **MIT License**.

You are free to:

Use
Modify
Distribute
Deploy commercially

***********************************************************************************************
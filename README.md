# Create a README.md file for the Smart Rental Management System project.

readme_content = """
# 🏠 Smart Rental Management System

A modern, flexible, and scalable rental management platform for landlords, tenants, caretakers, and relocation service providers. Built with **Node.js, Express, MongoDB**, and integrates SMS/email notifications, role-based access, and comprehensive property management features.

---

## 🚀 Features

### ✅ Core Modules
- User authentication (token-based, email verification, password reset)
- Role-based access: **Admin, Tenant, Landlord, Caretaker, Driver/Agent**
- Multi-role user support (e.g., landlord + caretaker)

### 🏠 Property Management
- House uploads with image validation/resizing (Sharp)
- Search & filter API for house listings
- View house + request site visit logic
- Maintenance request system for tenants
- Assign caretakers to specific houses

### 💬 Communication
- In-app chat between tenants and caretakers
- Triggered notifications: rent due, chat updates, visit approvals
- Notification preferences: SMS, Email, In-app

### 💸 Rent Management
- Rent payment tracking (receipts, status)
- Defaulter tracking + automated SMS reminders
- Tenant download of rent history/receipts
- Landlord dashboard for payment oversight
- Admin reports per estate/house

### 🚚 Relocation Services
- Relocation request system with optional service add-ons
- Admin/caretaker approval workflow
- Assign driver/agent
- Relocation rating/feedback
- Cost estimation calculator

### 🔐 Account Management
- Account verification (email)
- Soft delete/deactivate logic
- Block/suspend user system
- Admin user profile editor

### 📊 Admin Insights
- System analytics dashboard (user count, properties, requests)
- Audit logs for all critical actions (user suspensions, edits, etc.)
- Mass SMS/email sender
- Seen status for notifications

---

## 🛠️ Tech Stack
| Technology  | Purpose        |
|-------------|----------------|
| **Node.js** | Backend runtime |
| **Express** | API framework   |
| **MongoDB** | Flexible database |
| **Mongoose**| ODM (MongoDB)   |
| **Multer**  | File uploads    |
| **Sharp**   | Image resizing  |
| **JWT**     | Authentication  |
| **bcrypt**  | Password hashing |
| **Twilio / Africa's Talking / SMTP** | SMS / Email notifications |

---

## 📂 Project Structure


<div align="center">
🚨 MWAMKO AI – Emergency Response System

MWAMKO AI is a real-time emergency-response and route-optimization system designed to help humanitarian teams identify and reach people affected by floods faster and more efficiently.
The system leverages AI-powered routing, real-time alerts, and role-based operations to streamline emergency coordination.

This repository contains the frontend application, built with React, Redux Toolkit, and Material UI (MUI).

</div>
✨ Features

🔐 User Authentication

Secure login & sign-up using JWT

Persistent login via localStorage

🧩 Role Management

Dynamic assignment of roles (Admin, County Coordinator, etc.)

Approval workflows for new users

🕒 Pending Users Management

Coordinators can approve users awaiting verification

🛰️ Route Optimization

AI-powered route calculation for emergency response teams

🔔 Real-Time Notifications

Alerts for emergencies, push updates, and route completions

📱 Fully Responsive UI

Modern, clean interface powered by Material UI

🛠️ Technologies Used
Technology	Purpose
React	UI components & SPA architecture
Redux Toolkit	Global state management
Material UI (MUI)	UI styling & responsive design
React Router	Client-side navigation
Toastify	Toast notifications
Vite	Fast development environment
JWT	Secure authentication
🚀 Getting Started

Follow the instructions below to run the project locally.

✔️ Prerequisites

Node.js ≥ 16

npm ≥ 7

📦 Installation & Setup
# Clone the repository
git clone https://github.com/your-username/mwamko-ai-client.git
cd mwamko-ai-client

# Install dependencies
npm install

# Start the development server
npm run dev


Visit: http://localhost:3000

🗂️ Project Structure
src/
├── components/       # Reusable UI components (Header, Sidebar, etc.)
├── pages/            # Page-level components (Dashboard, Login, etc.)
├── services/         # API calls and backend interactions
├── slices/           # Redux slices (auth, user management, etc.)
├── store/            # Redux store configuration
├── styles/           # Global styles
└── utils/            # Shared utilities and helpers

🧱 Key Components Overview

Header.jsx – Navigation bar with user profile, notifications, and role actions

DashboardPage.jsx – Main coordinator dashboard for viewing emergencies & user activity

AssignRoleDialog.jsx – Modal interface for assigning user roles

LoginPage.jsx – Handles user authentication with validation

PendingUsersPage.jsx – Approve, verify, and manage pending user accounts

InviteUserPage.jsx – Allows coordinators to invite new responders or admins

🔄 State Management – Redux Toolkit

authSlice

Login & logout

Registration

Token persistence

Current user data

userManagementSlice

Fetch and approve pending users

Assign and update roles

Manage user lists

🎨 Styling – Material UI (MUI)

Custom AppBar and themed UI elements

Dialogs, Menus, Buttons styled with MUI

Grid & Box layouts for responsiveness

Dark/light compatibility (optional future feature)

🔐 Authentication & Authorization

Authentication is secured with JWT, validated through API routes

Route	Method	Description
/login	POST	Authenticate existing users
/register	POST	Create a new account

Tokens are saved in localStorage and validated on each API call

📸 Screenshots
<div align="center"> <img src="./assets/image1.png" width="400"/> &nbsp;&nbsp; <img src="./assets/image2.png" width="400"/><br><br> <img src="./assets/image3.png" width="400"/> &nbsp;&nbsp; <img src="./assets/image4.png" width="400"/> </div>
🤝 Contributing

Fork the repository

Create a new branch

Make your updates

Submit a pull request

Please follow the existing coding style and commit message guidelines.

📄 License

This project is licensed under the MIT License.
See the LICENSE
 file for details.

📬 Contact

Email: stephenenowin233@gmail.com

GitHub: https://github.com/stephenOwino
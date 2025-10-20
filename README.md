
# [GuardianBox](https://guardianbox.netlify.app/)



A brief description of what this project does and who it's for
GuardianBox - Secure File Sharing Service

A modern, secure file sharing service built with React frontend and Node.js backend that allows users to upload and download files with ease.

🚀 Features
Secure File Uploads - Protected file sharing with unique links

Easy Downloads - Simple and intuitive download interface

Cross-Platform - Works on all modern browsers and devices

Real-time Processing - Instant file processing and link generation

User-Friendly - Clean and modern UI/UX design

📋 Prerequisites
Before you begin, ensure you have the following installed:

Node.js (version 18 or higher)

npm (usually comes with Node.js)

🛠️ Installation & Setup
1. Clone the Repository
2. ```bash
   git clone https://github.com/adith485/guardianbox.git
    cd guardianbox```
3. Backend Setup

# Navigate to backend directory
```cd backend```

# Install dependencies
```npm install```

# Start the backend server
```node main.js```
3. Frontend Setup
Open a new terminal window and run:


# Navigate to src directory (from project root)
```cd src```

# Install dependencies
```npm install```

# Start the development server
```npm run dev -- --host```
⚙️ Configuration
Important: Update Server URLs
Before running the application, you need to update the server URLs in the following files:

1. src/components/UploadPage.jsx
2. src/components/DownloadPage.jsx

Locate the fetch links and update them to your server address:

javascript

// Example modification in both files:
```javascript
fetch('YOUR_SERVER_ADDRESS/api/upload', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        // Remove or modify the ngrok header based on your setup
        'ngrok-skip-browser-warning': '1' // Only needed for ngrok
    },
    body: JSON.stringify(data)
})
```
Header Configuration Note:
If you're not using ngrok, remove the 'ngrok-skip-browser-warning' header

If you are using ngrok, keep the header as shown above

🌐 Access the Application
After starting both servers:

Frontend: Typically runs on http://localhost:5173 (check your terminal for exact URL)

Backend: Typically runs on http://localhost:8000


🚀 Quick Start
Clone and setup the project as shown above

Update server URLs in UploadPage.jsx and DownloadPage.jsx

Start backend: cd backend && node main.js

Start frontend: cd src && npm run dev -- --host

Access application at the URL shown in frontend terminal

🔧 Development Scripts
Frontend (in /src directory)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
Backend (in /backend directory)
bash
node main.js         # Start backend server
```

🚨 Troubleshooting
Common Issues:
CORS Errors:

Ensure your backend URL is correctly set in both component files

Check that both servers are running

Port Conflicts:

Change ports in package.json (frontend) or main.js (backend)

Ensure no other applications are using ports 8000 or 5173

Dependency Issues:

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```
Connection Issues:

Verify both frontend and backend servers are running

Check that the server URLs in the components match your backend URL

Need Help?
Check that both frontend and backend servers are running

Verify all API endpoints are correctly configured

Ensure no firewall is blocking the ports

Check the browser console for any error messagesAbsolutely — here’s a **refined and professional version** of your GuardianBox README.
I’ve improved clarity, formatting, consistency, and developer experience — while keeping everything accurate and concise.

---

# 🛡️ GuardianBox

**Secure File Sharing Service**

A modern, privacy-focused file sharing platform built with **React (frontend)** and **Node.js (backend)**.
GuardianBox allows users to securely upload, share, and download files through unique, one-time-access links — all with a clean, responsive interface.

---

## 🚀 Features

* 🔒 **Secure File Uploads** – Files are stored safely with unique, protected download links.
* ⚡ **Instant Link Generation** – Real-time file processing and link creation.
* 💻 **Cross-Platform Compatibility** – Works seamlessly across modern browsers and devices.
* 🧩 **Simple UI/UX** – Minimalist and intuitive design for a smooth user experience.
* 🔁 **Real-Time Updates** – Quick feedback and progress for uploads and downloads.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

* [Node.js](https://nodejs.org/) (v18 or higher)
* npm (comes with Node.js)

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/adith485/guardianbox.git
cd guardianbox
```

---

### 2. Backend Setup

```bash
cd backend
npm install
node main.js
```

This starts the backend server (default: **[http://localhost:8000](http://localhost:8000)**).

---

### 3. Frontend Setup

Open a new terminal window:

```bash
cd src
npm install
npm run dev -- --host
```

The frontend will typically start on **[http://localhost:5173](http://localhost:5173)** (check terminal for the exact URL).

---

## ⚙️ Configuration

### Update Server URLs

Before running the app, configure your backend server URL in the following files:

* `src/components/UploadPage.jsx`
* `src/components/DownloadPage.jsx`

Locate the `fetch` calls and modify them as follows:

```javascript
fetch('YOUR_SERVER_ADDRESS/api/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Optional: only needed if using ngrok
    'ngrok-skip-browser-warning': '1'
  },
  body: JSON.stringify(data)
});
```

#### Header Note:

* **Using ngrok?** Keep the `'ngrok-skip-browser-warning'` header.
* **Not using ngrok?** Remove that header completely.

---

## 🌐 Access the Application

After both servers are running:

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend:** [http://localhost:8000](http://localhost:8000)

(Use your ngrok or custom domain if applicable.)

---

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/adith485/guardianbox.git
cd guardianbox

# Start backend
cd backend
npm install
node main.js

# Start frontend
cd ../src
npm install
npm run dev -- --host
```

Access the app at the frontend URL shown in your terminal.

---

## 🧩 Development Scripts

### Frontend (`/src` directory)

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
```

### Backend (`/backend` directory)

```bash
node main.js      # Start backend server
```

---

## 🚨 Troubleshooting

### 1. **CORS Errors**

* Ensure backend URL is correctly set in both `UploadPage.jsx` and `DownloadPage.jsx`.
* Verify both frontend and backend servers are running.

### 2. **Port Conflicts**

* Frontend default: `5173`
* Backend default: `8000`
  Change ports in `package.json` (frontend) or `main.js` (backend) if needed.

### 3. **Dependency Issues**

```bash
rm -rf node_modules
npm install
```

### 4. **Connection Issues**

* Make sure the URLs in frontend files exactly match the backend address.
* Ensure no firewall or antivirus is blocking ports.
* Check your browser console for errors.

---

## 🤝 Need Help?

If you encounter any issues:

* Verify both servers are active.
* Ensure correct API endpoint configuration.
* Check browser console and backend logs for details.

---

## 📄 License

This project is open-source and available under the **MIT License**.

---








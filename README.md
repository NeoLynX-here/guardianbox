# 🛡️ GuardianBox
https://guardianbox.netlify.app/

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








GuardianBox - Secure File Sharing Service
https://img.shields.io/badge/GuardianBox-File%2520Sharing-blue
https://img.shields.io/badge/Node.js-18%252B-green
https://img.shields.io/badge/React-18-blue
https://img.shields.io/badge/License-MIT-yellow

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
bash
git clone <your-repository-url>
cd guardianbox
2. Backend Setup
bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the backend server
node main.js
3. Frontend Setup
Open a new terminal window and run:

bash
# Navigate to src directory (from project root)
cd src

# Install dependencies
npm install

# Start the development server
npm run dev -- --host
⚙️ Configuration
Important: Update Server URLs
Before running the application, you need to update the server URLs in the following files:

1. src/components/UploadPage.jsx
2. src/components/DownloadPage.jsx

Locate the fetch links and update them to your server address:

javascript
// Example modification in both files:
fetch('YOUR_SERVER_ADDRESS/api/upload', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        // Remove or modify the ngrok header based on your setup
        'ngrok-skip-browser-warning': '1' // Only needed for ngrok
    },
    body: JSON.stringify(data)
})
Header Configuration Note:
If you're not using ngrok, remove the 'ngrok-skip-browser-warning' header

If you are using ngrok, keep the header as shown above

🌐 Access the Application
After starting both servers:

Frontend: Typically runs on http://localhost:5173 (check your terminal for exact URL)

Backend: Typically runs on http://localhost:3000

Open your browser and navigate to the frontend URL shown in the terminal.

📁 Project Structure
text
guardianbox/
├── src/                 # React frontend
│   ├── components/
│   │   ├── UploadPage.jsx
│   │   └── DownloadPage.jsx
│   ├── ...
│   └── package.json
├── backend/            # Node.js backend
│   ├── main.js
│   └── package.json
└── README.md
🚀 Quick Start
Clone and setup the project as shown above

Update server URLs in UploadPage.jsx and DownloadPage.jsx

Start backend: cd backend && node main.js

Start frontend: cd src && npm run dev -- --host

Access application at the URL shown in frontend terminal

🔧 Development Scripts
Frontend (in /src directory)
bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
Backend (in /backend directory)
bash
node main.js         # Start backend server
# or for development
npx nodemon main.js  # Start with auto-restart (if nodemon installed)
🚨 Troubleshooting
Common Issues:
CORS Errors:

Ensure your backend URL is correctly set in both component files

Check that both servers are running

Port Conflicts:

Change ports in package.json (frontend) or main.js (backend)

Ensure no other applications are using ports 3000 or 5173

Dependency Issues:

bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
Connection Issues:

Verify both frontend and backend servers are running

Check that the server URLs in the components match your backend URL

Need Help?
Check that both frontend and backend servers are running

Verify all API endpoints are correctly configured

Ensure no firewall is blocking the ports

Check the browser console for any error messages

📄 License
This project is licensed under the MIT License.

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

📞 Support
If you encounter any problems or have questions:

Check the troubleshooting section above

Ensure all setup steps were followed correctly

Verify Node.js version compatibility


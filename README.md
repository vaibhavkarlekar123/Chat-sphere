# ◈ ChatSphere — MERN Real-Time Chat App

A full-stack real-time chat application built with **MongoDB, Express, React, and Node.js** with **Socket.IO** for live messaging.

---

## ✨ Features

- 🔐 **Authentication** — Register & login with JWT-secured sessions
- 💬 **Real-time messaging** — Instant messages via Socket.IO
- 🟢 **Online presence** — See who's online live
- ✏️ **Typing indicators** — See when someone is typing
- 🔍 **User search** — Find other users by username
- 🎨 **Dark UI** — Sleek dark-themed interface
- 📱 **Responsive** — Works on mobile & desktop

---

## 🗂️ Project Structure

```
mern-chat/
├── package.json            ← Root (runs both server + client)
│
├── server/                 ← Node.js + Express + Socket.IO backend
│   ├── server.js           ← Entry point
│   ├── .env                ← Environment variables
│   ├── package.json
│   ├── models/
│   │   ├── User.js         ← User schema
│   │   └── Message.js      ← Message schema
│   ├── routes/
│   │   ├── auth.js         ← /api/auth (register, login, me)
│   │   ├── users.js        ← /api/users (list, search, profile)
│   │   └── messages.js     ← /api/messages (get conversation)
│   └── middleware/
│       └── auth.js         ← JWT protect middleware
│
└── client/                 ← React frontend
    ├── .env
    ├── package.json
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── context/
        │   ├── AuthContext.js      ← Auth state & API calls
        │   └── SocketContext.js    ← Socket.IO connection
        ├── pages/
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── ChatPage.js
        │   └── *.module.css
        └── components/
            ├── Sidebar.js          ← User list + search
            ├── ChatWindow.js       ← Messages + input
            ├── MessageBubble.js    ← Individual message
            ├── WelcomeScreen.js    ← Empty state
            └── *.module.css
```

---

## ⚙️ Prerequisites

Make sure you have these installed before proceeding:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v16+ | https://nodejs.org |
| npm | v8+ | (comes with Node) |
| MongoDB | Local or Atlas | https://www.mongodb.com |

---

## 🚀 Setup & Run in VS Code

### Step 1 — Open the project

```bash
# Open VS Code in the project folder
code mern-chat
```
Or: Open VS Code → **File → Open Folder** → select `mern-chat`

---

### Step 2 — Configure environment variables

**Server** (`server/.env`) — already created, verify contents:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-chat
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLIENT_URL=http://localhost:3000
```

> ⚠️ **Using MongoDB Atlas (cloud)?** Replace `MONGO_URI` with your Atlas connection string:
> ```
> MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mern-chat
> ```

**Client** (`client/.env`) — already created:
```env
REACT_APP_SERVER_URL=http://localhost:5000
```

---

### Step 3 — Install dependencies

Open the **VS Code Terminal** (`Ctrl + `` ` ``  or **Terminal → New Terminal**):

```bash
# Option A: Install everything at once from root
npm run install:all

# Option B: Install manually
cd server && npm install
cd ../client && npm install
cd ..
npm install          # installs root concurrently package
```

---

### Step 4 — Start MongoDB

**Local MongoDB:**
```bash
# macOS / Linux
mongod

# Windows (run as Administrator)
net start MongoDB

# Or with explicit data path
mongod --dbpath C:\data\db
```

> ✅ If using **MongoDB Atlas**, skip this step — your cloud DB is always running.

---

### Step 5 — Run the application

**From the root folder**, run both server and client together:

```bash
npm run dev
```

Or run them in **separate terminals**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm start
```

---

### Step 6 — Open the app

| Service | URL |
|---------|-----|
| React App | http://localhost:3000 |
| Express API | http://localhost:5000 |

---

## 🧪 Test the App

1. Open http://localhost:3000
2. Click **Create one** to register a new account (e.g., `alice@test.com`)
3. Open an **Incognito / Private window** and register another account (e.g., `bob@test.com`)
4. In one window, click on the other user in the sidebar
5. Start chatting — messages appear in real-time! 🎉

---

## 🔌 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (protected) |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users` | List all users (protected) |
| GET | `/api/users/search?q=` | Search users (protected) |
| PUT | `/api/users/profile` | Update profile (protected) |

### Messages
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/messages/:userId` | Get conversation (protected) |
| GET | `/api/messages` | Get recent conversations (protected) |

---

## 🔌 Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `user:join` | Client → Server | User comes online |
| `users:online` | Server → All | Updated online list |
| `room:join` | Client → Server | Join a chat room |
| `message:send` | Client → Server | Send a message |
| `message:receive` | Server → Room | Receive a message |
| `typing:start` | Client → Server | Started typing |
| `typing:stop` | Client → Server | Stopped typing |

---

## 🛠️ Troubleshooting

**Port already in use?**
```bash
# Kill process on port 5000 (Mac/Linux)
kill -9 $(lsof -t -i:5000)

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**MongoDB connection refused?**
- Make sure `mongod` is running locally
- Or use MongoDB Atlas and update `MONGO_URI` in `server/.env`

**React app not connecting to server?**
- Verify `REACT_APP_SERVER_URL=http://localhost:5000` in `client/.env`
- Make sure the server is running on port 5000
- Check CORS settings in `server/server.js`

**`npm run dev` not found?**
```bash
# Install root dependencies first
npm install
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, CSS Modules |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO |
| Auth | JWT + bcryptjs |
| Fonts | Syne, Inter (Google Fonts) |

---

## 📦 Build for Production

```bash
# Build React client
cd client
npm run build

# Then serve the build folder with the Express server
# Add this to server.js:
# app.use(express.static(path.join(__dirname, '../client/build')));
```

---

## 📝 License

MIT — feel free to use and modify.

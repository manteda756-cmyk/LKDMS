# የፋይል ማውጫ ስርዓት — File Index Management System

A modern, responsive digital file index for Ethiopian government offices.  
Built with Next.js (frontend) + Node.js/Express (backend) + MySQL (database).

---

## Features

- **Public interface** — Browse, search, and open files by number or title
- **Three languages** — Amharic (default), Afaan Oromo, English
- **Dark / Light mode**
- **Department navigation** — Filter files by department
- **File detail page** — Metadata, description, download/open button
- **Admin panel** — Add/edit/delete files, manage departments and users
- **JWT authentication** for admin routes
- **File upload** — PDF, DOCX, XLSX, ZIP, Images (max 50 MB)

---

## Project Structure

```
DMS/
├── client/          # Next.js 14 frontend
│   └── src/
│       ├── app/             # Next.js App Router pages
│       ├── components/      # React components
│       ├── lib/             # API client, i18n
│       └── store/           # Zustand state
│
└── server/          # Express.js backend
    ├── config/      # DB connection
    ├── database/    # SQL schema + seed data
    ├── middleware/  # Auth, file upload
    └── routes/      # API routes
```

---

## Prerequisites

- Node.js 18+
- MySQL 8+ (or MariaDB 10.6+)

---

## Setup

### 1. Database

```sql
-- In MySQL client or Workbench:
SOURCE server/database/schema.sql;
SOURCE server/database/seed.sql;
```

This creates the `ethiopia_file_index` database with departments, sample files, and an admin user.

**Default admin credentials:**
- Username: `admin`
- Password: `Admin@1234`

---

### 2. Backend (server)

```bash
cd server
npm install

# Edit .env if your MySQL credentials differ from defaults
# DB_USER=root, DB_PASSWORD=, DB_NAME=ethiopia_file_index
notepad .env

npm run dev      # starts on http://localhost:5000
# or
npm start
```

The server creates an `uploads/` folder automatically for file attachments.

---

### 3. Frontend (client)

```bash
cd client
npm install

# Verify .env.local points to your server
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

npm run dev      # starts on http://localhost:3000
```

---

## Usage

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Public dashboard |
| `http://localhost:3000/files` | Browse all files |
| `http://localhost:3000/departments` | Browse departments |
| `http://localhost:3000/admin` | Admin panel (requires login) |
| `http://localhost:3000/admin/login` | Admin login |
| `http://localhost:5000/api/health` | API health check |

---

## API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files` | List files (search, filter, pagination) |
| GET | `/api/files/stats` | Dashboard statistics |
| GET | `/api/files/:id` | File detail |
| GET | `/api/files/:id/download` | Download file |
| GET | `/api/departments` | List departments |

### Admin (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/files` | Create file (multipart) |
| PUT | `/api/files/:id` | Update file |
| DELETE | `/api/files/:id` | Soft-delete file |
| POST | `/api/departments` | Create department |
| PUT | `/api/departments/:id` | Update department |
| DELETE | `/api/departments/:id` | Soft-delete department |
| GET | `/api/users` | List users |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Deactivate user |

---

## Environment Variables

### server/.env
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ethiopia_file_index
JWT_SECRET=ethiopia_file_index_jwt_secret_2024
JWT_EXPIRES_IN=24h
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=52428800
CLIENT_URL=http://localhost:3000
```

### client/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Departments (pre-loaded)

| Amharic | English |
|---------|---------|
| የሰላም እሴት ግንባታ | Peace Values Building |
| የሰው ሃብት | Human Resources |
| የፋይናንስ | Finance |
| የፕላንና በጀት | Plan and Budget |
| የህዝብ ግንኙነት | Public Relations |
| የሴቶችና ህፃናት | Women and Children |
| የወጣቶች | Youth |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, Tailwind CSS |
| State | Zustand + react-query |
| Backend | Node.js, Express |
| Database | MySQL 8 |
| Auth | JWT (jsonwebtoken) |
| File Upload | Multer |
| UI Icons | Lucide React |
| Fonts | Noto Sans Ethiopic, Noto Sans |

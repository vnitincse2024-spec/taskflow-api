# TaskFlow API

**Production-ready Node.js/Express REST API for task management - Full Stack Task 3**

## 🚀 Features

- Complete REST API for task management (CRUD operations)
- Clean MVC architecture with separation of concerns
- Production-grade security with Helmet.js
- Custom security headers middleware
- CORS enabled for cross-origin requests
- Request logging with Morgan
- Environment-based configuration
- ES6 modules support
- Comprehensive error handling

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task by ID |
| DELETE | `/api/tasks/:id` | Delete a task by ID |

## 🛠️ Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Helmet.js** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **dotenv** - Environment variable management

## 📁 Project Structure

```
taskflow-api/
├── src/
│   ├── controllers/
│   │   └── taskController.js
│   ├── routes/
│   │   └── taskRoutes.js
│   └── middleware/
│       └── security.js
├── server.js
├── package.json
├── .env
├── .gitignore
└── README.md
```

## ⚡ Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vnitincse2024-spec/taskflow-api.git
cd taskflow-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
PORT=5000
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

The API will be running at `http://localhost:5000`

## 🧪 Testing the API

### Using cURL

**Get all tasks:**
```bash
curl http://localhost:5000/api/tasks
```

**Create a task:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"text":"Complete Full Stack Task 3"}'
```

**Update a task:**
```bash
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"text":"Updated task", "completed":true}'
```

**Delete a task:**
```bash
curl -X DELETE http://localhost:5000/api/tasks/1
```

## 📝 API Response Examples

**GET /api/tasks**
```json
[
  {
    "id": 1,
    "text": "Complete Full Stack Task 3",
    "completed": false,
    "createdAt": "2025-11-15T12:00:00.000Z"
  }
]
```

**POST /api/tasks**
```json
{
  "id": 1,
  "text": "Complete Full Stack Task 3",
  "completed": false,
  "createdAt": "2025-11-15T12:00:00.000Z"
}
```

## 🔒 Security Features

- Helmet.js for setting security HTTP headers
- Custom security headers middleware
- CORS configuration
- Input validation
- Error handling

## 👨‍💻 Author

**vnitincse2024-spec**

## 📄 License

ISC

---

**Full Stack Task - 3** | Soft Nexis Internship

# SQL Learning Platform

An interactive platform for learning and practicing SQL queries with real-time feedback and challenge-based learning.

## Features

- User authentication and authorization
- Interactive SQL query editor
- Real-time query validation
- Challenge-based learning system
- Progress tracking and scoring
- User profile and statistics

## Tech Stack

- Frontend: React.js with Material-UI
- Backend: Node.js with Express
- Database: MySQL
- Authentication: JWT

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ankursingh018as/SQL-ARENA.git
cd sql-learning-platform
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Create a `.env` file in the root directory with the following variables:
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
JWT_SECRET=your_jwt_secret
```

5. Start the backend server:
```bash
npm run dev
```

6. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000` for the frontend and `http://localhost:3002` for the backend API.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


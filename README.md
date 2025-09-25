# Node.js Redis Caching Project

A comprehensive Node.js application demonstrating Redis caching implementation with Express.js, SQLite database, and external API integration. This project showcases different caching strategies and patterns for improving application performance.

## 🚀 Features

- **Redis Caching**: Implements multiple caching strategies for API responses
- **Express.js API**: RESTful API endpoints with caching middleware
- **SQLite Database**: User profile management with database operations
- **External API Integration**: Fetches Bitcoin exchange rates from CoinGecko API
- **Caching Middleware**: Reusable Redis caching middleware for any endpoint
- **Environment Configuration**: Secure configuration management with dotenv

## 📋 Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v14 or higher)
- [npm](https://www.npmjs.com/get-npm) or [yarn](https://yarnpkg.com/)
- [Redis Server](https://redis.io/download) (v6 or higher)
- [SQLite3](https://www.sqlite.org/download.html)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nodejs-redis-caching
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   REDIS_URI=redis://localhost:6379
   SQLITE_FILE=user_profiles.db
   ```

4. **Start Redis Server**
   ```bash
   # Using Docker (recommended)
   docker run -d -p 6379:6379 redis:alpine
   
   # Or install Redis locally and start the service
   redis-server
   ```

5. **Initialize the database**
   The SQLite database (`user_profiles.db`) will be created automatically when you first run the application.

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
node server.js
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## 📚 API Endpoints

### 1. Health Check
- **GET** `/`
- Returns a simple "Hello, World!" message

### 2. Bitcoin Exchange Rates (with caching middleware)
- **GET** `/btc-exchange-rate2/`
- Fetches Bitcoin exchange rates from CoinGecko API
- Uses reusable Redis caching middleware
- Cache expires in 5 minutes (300 seconds)

### 3. Bitcoin Exchange Rates (manual caching)
- **GET** `/btc-exchange-rate/`
- Fetches Bitcoin exchange rates with manual cache implementation
- Returns both cached and API data with source indication
- Cache expires in 5 minutes

### 4. User Management
- **GET** `/users/:id`
  - Retrieves user profile by ID
  - Returns user data from SQLite database

- **PUT** `/users/:id/bio`
  - Updates user bio
  - Requires JSON body: `{"bio": "New bio text"}`
  - Returns updated user profile

## 🏗️ Project Structure

```
nodejs-redis-caching/
├── server.js          # Main Express server with API routes
├── redis.js           # Redis client configuration and connection
├── db.js              # SQLite database operations
├── package.json       # Project dependencies and scripts
├── user_profiles.db   # SQLite database file (auto-generated)
├── .env               # Environment variables (create this)
└── README.md          # Project documentation
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `REDIS_URI` | Redis connection URL | `redis://localhost:6379` |
| `SQLITE_FILE` | SQLite database file path | `user_profiles.db` |

### Redis Configuration
The application uses Redis for caching with the following settings:
- Default cache expiration: 300 seconds (5 minutes)
- Connection URL: Configurable via `REDIS_URI` environment variable
- Automatic reconnection and error handling

## 🧪 Testing the Caching

1. **Test cache miss** (first request):
   ```bash
   curl http://localhost:5000/btc-exchange-rate/
   ```
   Response will show `"source": "API"`

2. **Test cache hit** (subsequent requests within 5 minutes):
   ```bash
   curl http://localhost:5000/btc-exchange-rate/
   ```
   Response will show `"source": "cache"`

3. **Test user endpoints**:
   ```bash
   # Get user (you'll need to add users to the database first)
   curl http://localhost:5000/users/1
   
   # Update user bio
   curl -X PUT http://localhost:5000/users/1/bio \
        -H "Content-Type: application/json" \
        -d '{"bio": "Updated bio text"}'
   ```

## 🔍 Caching Strategies Demonstrated

### 1. Reusable Middleware Caching
- Located in `/btc-exchange-rate2/` endpoint
- Uses `redisCachingMiddleware()` function
- Automatically caches successful responses (2xx status codes)
- Configurable cache expiration

### 2. Manual Caching Implementation
- Located in `/btc-exchange-rate/` endpoint
- Manual cache key management
- Explicit cache hit/miss handling
- Source indication in response

## 🛠️ Dependencies

- **express**: Web framework for Node.js
- **redis**: Redis client for Node.js
- **sqlite3**: SQLite database driver
- **dotenv**: Environment variable management
- **body-parser**: Request body parsing middleware
- **object-hash**: Object hashing utility
- **nodemon**: Development server with auto-restart

## 🐛 Troubleshooting

### Common Issues

1. **Redis Connection Error**
   - Ensure Redis server is running
   - Check `REDIS_URI` in your `.env` file
   - Verify Redis is accessible on the specified port

2. **Database Connection Error**
   - Ensure SQLite3 is installed
   - Check file permissions for database directory
   - Verify `SQLITE_FILE` path in `.env`

3. **Port Already in Use**
   - Change the `PORT` in your `.env` file
   - Or kill the process using the port: `lsof -ti:5000 | xargs kill`

## 📖 Tutorial Reference

This project is based on the tutorial:
[Redis Caching in Node.js](https://betterstack.com/community/guides/scaling-nodejs/nodejs-caching-redis/)

## ⚖️ License

This project is licensed under the [Apache License, Version 2.0](LICENSE)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions, please open an issue in the repository.

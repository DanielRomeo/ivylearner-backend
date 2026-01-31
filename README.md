# IvyLearner Backend v2.0 - Updated

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Install bcrypt (Important!)
```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

### 3. Update Database Schema
Your `schema.ts` file in `src/database/` should already have the new schema from the document you provided.

### 4. Generate and Run Migrations
```bash
npm run db:generate
npm run db:push
```

### 5. Start the Server
```bash
npm run start:dev
```

### 6. Access Swagger Docs
Open your browser: `http://localhost:5000/api/docs`

## 📁 Updated Files

Based on your existing structure, I've updated these files:

```
src/
├── users/
│   ├── users.controller.ts     ✅ UPDATED (with Swagger)
│   └── users.service.ts         ✅ UPDATED (with bcrypt)
├── auth/
│   ├── auth.service.ts          ✅ UPDATED
│   └── jwt.strategy.ts          ✅ UPDATED
├── interfaces/
│   └── user.interface.ts        ✅ UPDATED
├── main.ts                      ✅ UPDATED (with Swagger)
├── app.controller.ts            ✅ UPDATED
└── database/
    └── schema.ts                ✅ (You already updated this)
```

## 🔑 Key Changes Made

### 1. **Users Service** (`src/users/users.service.ts`)
- ✅ Uses new `users` table from schema
- ✅ Password hashing with bcrypt
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ User validation for login
- ✅ Returns users without passwords

### 2. **Users Controller** (`src/users/users.controller.ts`)
- ✅ Swagger decorators for API docs
- ✅ `/users/create` - Create new user
- ✅ `/users/login` - User login
- ✅ `GET /users` - Get all users (protected)
- ✅ `GET /users/:id` - Get user by ID (protected)
- ✅ `PUT /users/:id` - Update user (protected)
- ✅ `DELETE /users/:id` - Delete user (protected)

### 3. **Auth Service** (`src/auth/auth.service.ts`)
- ✅ Updated to work with new users table
- ✅ JWT includes role
- ✅ Validates user credentials

### 4. **Main** (`src/main.ts`)
- ✅ Swagger configuration
- ✅ API documentation at `/api/docs`
- ✅ Bearer authentication support

## 📡 API Endpoints

### Public Endpoints

#### Create User
```http
POST /api/users/create
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "role": "student"
    }
  }
}
```

### Protected Endpoints (Require JWT)

#### Get All Users
```http
GET /api/users
Authorization: Bearer <your-jwt-token>
```

#### Get User by ID
```http
GET /api/users/1
Authorization: Bearer <your-jwt-token>
```

#### Update User
```http
PUT /api/users/1
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "firstName": "Johnny",
  "role": "instructor"
}
```

#### Delete User
```http
DELETE /api/users/1
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing with cURL

### 1. Create a user
```bash
curl -X POST http://localhost:5000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "student"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Use the token
```bash
# Save the token from login response
TOKEN="your-jwt-token-here"

# Get all users
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

## 🔧 Environment Variables

Create a `.env` file:
```env
PORT=5000
DB_FILE_NAME=ivy.db
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
```

## 🐛 Troubleshooting

### Issue: bcrypt not found
```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

### Issue: Database error
```bash
# Regenerate migrations
npm run db:generate
npm run db:push

# Or use studio to inspect
npm run db:studio
```

### Issue: JWT not working
- Check your `.env` file has `JWT_SECRET`
- Make sure you're sending the token in the header:
  ```
  Authorization: Bearer <token>
  ```

## 📚 What's Next?

Now that users are working, you can implement:

1. ✅ **Organizations Module**
   - Create organizations
   - Add members
   - Manage roles

2. ✅ **Courses Module**
   - Create courses
   - Assign instructors
   - Manage content

3. ✅ **Enrollments Module**
   - Enroll students
   - Track progress

4. ✅ **Lessons Module**
   - Create lessons
   - Assign instructors per lesson

Let me know when you're ready for any of these!

## 🎉 Your Swagger Docs

Once the server is running, visit:
**http://localhost:5000/api/docs**

You'll see:
- All endpoints documented
- Try them out directly
- Request/Response examples
- Authentication testing

## 💡 Tips

1. **Use Swagger** - It's the easiest way to test your API
2. **Check the terminal** - Logs will show you what's happening
3. **bcrypt is important** - Never store plain passwords
4. **JWT roles** - Used for authorization later

Good luck! 🚀
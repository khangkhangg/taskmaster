# TaskMaster API Documentation

Base URL: `http://localhost:5000/api`

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register User
```
POST /auth/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "0123456789",
  "role": "both",
  "preferredLanguage": "vi"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "both",
      "preferredLanguage": "vi"
    },
    "token": "jwt_token_here"
  }
}
```

### Login
```
POST /auth/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### Get Profile
```
GET /auth/profile
```
**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "rating": {
      "average": 4.5,
      "count": 10
    },
    "stats": {
      "tasksPosted": 5,
      "tasksCompleted": 15,
      "totalEarned": 5000000
    }
  }
}
```

### Update Profile
```
PUT /auth/profile
```
**Auth Required:** Yes

**Body:**
```json
{
  "name": "John Updated",
  "bio": "Experienced handyman",
  "skills": ["plumbing", "electrical"],
  "location": {
    "address": "123 Main St",
    "city": "Ho Chi Minh City",
    "country": "Vietnam"
  }
}
```

---

## Task Endpoints

### Create Task
```
POST /tasks
```
**Auth Required:** Yes

**Body:**
```json
{
  "title": "Need plumber for kitchen sink",
  "description": "Kitchen sink is leaking, need urgent repair",
  "category": "handyman",
  "budget": {
    "min": 500000,
    "max": 1000000,
    "currency": "VND"
  },
  "location": {
    "type": "onsite",
    "address": "123 Main St",
    "city": "Ho Chi Minh City",
    "coordinates": {
      "lat": 10.762622,
      "lng": 106.660172
    }
  },
  "deadline": "2024-12-31T00:00:00Z",
  "requiredSkills": ["plumbing"],
  "images": []
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "title": "Need plumber for kitchen sink",
    "status": "open",
    "bidsCount": 0,
    "poster": {
      "_id": "...",
      "name": "John Doe"
    }
  }
}
```

### Get All Tasks
```
GET /tasks?category=handyman&status=open&city=Ho Chi Minh&page=1&limit=20
```
**Auth Required:** Yes

**Query Parameters:**
- `category`: Filter by category
- `status`: Filter by status (open, in_progress, completed, cancelled)
- `city`: Filter by city
- `minBudget`: Minimum budget
- `maxBudget`: Maximum budget
- `locationType`: remote or onsite
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `sort`: Sort field (default: -createdAt)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### Get Single Task
```
GET /tasks/:id
```
**Auth Required:** Yes

### Get My Tasks
```
GET /tasks/my-tasks?status=open
```
**Auth Required:** Yes

### Update Task
```
PUT /tasks/:id
```
**Auth Required:** Yes (must be task poster)

**Body:** Same fields as create (only open tasks can be updated)

### Delete/Cancel Task
```
DELETE /tasks/:id
```
**Auth Required:** Yes (must be task poster)

### Complete Task
```
POST /tasks/:id/complete
```
**Auth Required:** Yes (must be task poster)

**Body:**
```json
{
  "rating": 5,
  "comment": "Great work!",
  "completionProof": ["image_url1", "image_url2"]
}
```

---

## Bid Endpoints

### Create Bid
```
POST /bids
```
**Auth Required:** Yes

**Body:**
```json
{
  "taskId": "task_id_here",
  "amount": 750000,
  "proposedTimeline": "2 days",
  "message": "I have 5 years experience in plumbing"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "task": "...",
    "bidder": {
      "_id": "...",
      "name": "Jane Smith",
      "rating": {
        "average": 4.8,
        "count": 20
      }
    },
    "amount": 750000,
    "status": "pending"
  }
}
```

### Get My Bids
```
GET /bids/my-bids?status=pending
```
**Auth Required:** Yes

**Query Parameters:**
- `status`: Filter by status (pending, accepted, rejected, withdrawn)

### Get Task Bids
```
GET /bids/task/:taskId
```
**Auth Required:** Yes (must be task poster)

**Response:** Array of bids with bidder details

### Update Bid
```
PUT /bids/:id
```
**Auth Required:** Yes (must be bidder, bid must be pending)

**Body:**
```json
{
  "amount": 800000,
  "proposedTimeline": "1.5 days",
  "message": "Updated offer"
}
```

### Accept Bid
```
POST /bids/:id/accept
```
**Auth Required:** Yes (must be task poster)

**Effect:**
- Bid status → accepted
- Task status → in_progress
- Task assigned to bidder
- All other bids → rejected

### Withdraw Bid
```
POST /bids/:id/withdraw
```
**Auth Required:** Yes (must be bidder)

---

## Categories

Available task categories:
- `cleaning`: Dọn dẹp / Cleaning
- `delivery`: Giao hàng / Delivery
- `handyman`: Sửa chữa / Handyman
- `moving`: Chuyển nhà / Moving
- `design`: Thiết kế / Design
- `programming`: Lập trình / Programming
- `writing`: Viết lách / Writing
- `photography`: Nhiếp ảnh / Photography
- `tutoring`: Gia sư / Tutoring
- `other`: Khác / Other

---

## Status Values

### Task Status
- `open`: Task is accepting bids
- `in_progress`: Task assigned, work in progress
- `completed`: Task finished and reviewed
- `cancelled`: Task cancelled by poster

### Bid Status
- `pending`: Waiting for poster decision
- `accepted`: Bid accepted, task assigned
- `rejected`: Bid rejected by poster
- `withdrawn`: Bid withdrawn by bidder

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `400`: Bad Request (validation error)
- `401`: Unauthorized (not logged in or invalid token)
- `403`: Forbidden (not authorized for this action)
- `404`: Not Found
- `500`: Internal Server Error

---

## Rate Limiting

(To be implemented in Phase 2)

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "preferredLanguage": "vi"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Task (with token)
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Task",
    "description": "Test description",
    "category": "handyman",
    "budget": {"min": 100000, "max": 200000},
    "location": {"type": "onsite", "city": "Ho Chi Minh City"},
    "deadline": "2024-12-31"
  }'
```

---

## Testing with Postman

1. Import the API endpoints
2. Create an environment variable for `token`
3. After login, save the token to the environment
4. Use `{{token}}` in Authorization headers

---

## WebSocket Events (Phase 4)

To be implemented with real-time notifications and messaging.

---

## Pagination

All list endpoints support pagination:

**Request:**
```
GET /api/tasks?page=2&limit=10
```

**Response includes:**
```json
{
  "data": {
    "tasks": [...],
    "pagination": {
      "page": 2,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

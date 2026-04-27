# Clearance System API Documentation

## Overview

The Clearance System API provides endpoints for managing student clearance processes in educational institutions. It supports sequential and parallel clearance phases, document management, and real-time notifications.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": [] // Optional for validation errors
  }
}
```

## Authentication Endpoints

### Register Student
```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "matricNumber": "JD001"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "matricNumber": "JD001"
    },
    "token": "jwt_token"
  }
}
```

### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Forgot Password
```
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
```
POST /auth/reset-password/:token
```

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

### Verify Token
```
GET /auth/verify-token
```
*Requires authentication*

## Student Endpoints

### Get Profile
```
GET /students/profile
```
*Requires authentication*

### Update Profile
```
PUT /students/profile
```
*Requires authentication*

**Request Body:**
```json
{
  "name": "John Smith",
  "profilePicture": "https://example.com/avatar.jpg"
}
```

### Initiate Clearance
```
POST /students/clearance/initiate
```
*Requires authentication*

### Get Clearance Status
```
GET /students/clearance/status
```
*Requires authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "clearance": {
      "_id": "clearance_id",
      "status": "in_progress",
      "matricNumber": "JD001",
      "sequentialPhase": {
        "isCompleted": false,
        "currentStage": 1,
        "submissions": [...]
      },
      "parallelPhase": {
        "isActive": true,
        "canSubmit": true,
        "submissions": [...]
      },
      "overallProgress": 45
    },
    "progress": {
      "percent": 45
    }
  }
}
```

### Submit Sequential Document
```
POST /students/clearance/sequential/submit/:departmentId
```
*Requires authentication*
*Content-Type: multipart/form-data*

**Request Body:**
```
file: <document_file>
```

### Submit Parallel Documents (Bulk)
```
POST /students/clearance/parallel/submit
```
*Requires authentication*
*Content-Type: multipart/form-data*

**Request Body:**
```
files: <document_files>[]
departmentIds: <department_ids>[]
```

### Submit Single Parallel Document
```
POST /students/clearance/parallel/submit/single/:departmentId
```
*Requires authentication*
*Content-Type: multipart/form-data*

### Get Eligible Parallel Departments
```
GET /students/clearance/parallel/eligible-departments
```
*Requires authentication*

### Download Certificate
```
GET /students/clearance/certificate
```
*Requires authentication*
*Returns PDF file*

### Get Notifications
```
GET /students/notifications
```
*Requires authentication*

### Mark Notification as Read
```
PUT /students/notifications/:id/read
```
*Requires authentication*

## Staff Endpoints

### Get Statistics
```
GET /staff/statistics
```
*Requires authentication (staff role)*

**Response:**
```json
{
  "success": true,
  "data": {
    "pending": 5,
    "totalProcessed": 25,
    "department": {
      "_id": "dept_id",
      "name": "Computer Science",
      "code": "CS"
    }
  }
}
```

### Get Pending Requests
```
GET /staff/pending
```
*Requires authentication (staff role)*

**Response:**
```json
{
  "success": true,
  "data": {
    "sequentialPending": [...],
    "parallelPending": [...]
  }
}
```

### Get Request Details
```
GET /staff/request/:clearanceId
```
*Requires authentication (staff role)*

### Approve Sequential Request
```
POST /staff/sequential/approve/:clearanceId
```
*Requires authentication (staff role)*

**Request Body:**
```json
{
  "remarks": "All documents verified and approved"
}
```

### Reject Sequential Request
```
POST /staff/sequential/reject/:clearanceId
```
*Requires authentication (staff role)*

### Approve Parallel Request
```
POST /staff/parallel/approve/:clearanceId
```
*Requires authentication (staff role)*

### Reject Parallel Request
```
POST /staff/parallel/reject/:clearanceId
```
*Requires authentication (staff role)*

## Admin Endpoints

### Get Analytics
```
GET /admin/analytics
```
*Requires authentication (admin role)*

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalStudents": 150,
      "activeClearances": 45,
      "approvedRequests": 89,
      "studentsInSequentialPhase": 20,
      "studentsInParallelPhase": 25,
      "completionRate": 75
    },
    "departmentStats": [...],
    "trend": [...]
  }
}
```

### Get Users
```
GET /admin/users
```
*Requires authentication (admin role)*

### Create User
```
POST /admin/users
```
*Requires authentication (admin role)*

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "staff",
  "staffId": "STAFF001",
  "department": "Computer Science",
  "isActive": true
}
```

### Update User
```
PUT /admin/users/:userId
```
*Requires authentication (admin role)*

### Get Departments
```
GET /admin/departments
```
*Requires authentication (admin role)*

### Create Department
```
POST /admin/departments
```
*Requires authentication (admin role)*

**Request Body:**
```json
{
  "name": "Computer Science",
  "code": "CS",
  "description": "Computer Science department",
  "clearanceOrder": 1,
  "phase": {
    "type": "sequential",
    "order": 1
  },
  "isActive": true
}
```

### Update Department
```
PUT /admin/departments/:departmentId
```
*Requires authentication (admin role)*

### Delete Department
```
DELETE /admin/departments/:departmentId
```
*Requires authentication (admin role)*

### Reorder Departments
```
POST /admin/departments/reorder
```
*Requires authentication (admin role)*

**Request Body:**
```json
{
  "departmentIds": ["dept_id_1", "dept_id_2", "dept_id_3"]
}
```

### Move Department Phase
```
POST /admin/departments/:departmentId/move-phase
```
*Requires authentication (admin role)*

**Request Body:**
```json
{
  "phaseType": "parallel",
  "order": 2
}
```

### Get Reports
```
GET /admin/reports
```
*Requires authentication (admin role)*

### Update Settings
```
PUT /admin/settings
```
*Requires authentication (admin role)*

## Document Endpoints

### Download Document
```
GET /documents/:documentId/download
```
*Requires authentication*

## WebSocket Events

### Connection
Connect to WebSocket server for real-time updates:

```javascript
const socket = io('http://localhost:5000');

// Join user room
socket.emit('join', { userId: 'user_id' });
```

### Events

**Student Events:**
- `parallel_ready` - Parallel phase unlocked
- `certificate_ready` - Certificate generated
- `notification:new` - New notification received
- `sequential_approved` - Sequential department approved
- `sequential_rejected` - Sequential department rejected
- `parallel_approved` - Parallel department approved
- `parallel_rejected` - Parallel department rejected

**Staff Events:**
- `new_submission` - New submission for staff department

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Invalid or missing authentication |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ERROR` | Resource already exists |
| `FILE_UPLOAD_ERROR` | File upload failed |
| `SERVER_ERROR` | Internal server error |

## File Upload Limits

- **Maximum file size:** 10MB
- **Allowed file types:** PDF, JPG, PNG, Word documents (.doc, .docx)
- **Upload method:** multipart/form-data

## Rate Limiting

- **Authentication endpoints:** 40 requests per 15 minutes
- **Other endpoints:** No rate limiting (configurable)

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clearance-system
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

## Testing

Run tests with:
```bash
npm test
```

Test files are located in `/server/tests/` directory.

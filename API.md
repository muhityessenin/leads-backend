# API Reference

## 📚 Справочник API Endpoints

### Base URL

```
http://localhost:3000/api
```

### Authentication

Используйте JWT токен в заголовке `Authorization`:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "MARKETER",
    "token": "eyJhbGc..."
  }
}
```

---

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "MARKETER",
    "token": "eyJhbGc..."
  }
}
```

---

## 👤 Users Endpoints

### Get Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "MARKETER",
    "balance": 5000.00,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

---

### Get All Users
```http
GET /users?page=1&limit=10
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "MARKETER",
      "balance": 5000.00,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 📋 Lead Types Endpoints

### Create Lead Type
```http
POST /lead-types
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Premium Leads",
  "description": "High-quality leads",
  "basePrice": 150.00
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "companyId": "uuid",
    "title": "Premium Leads",
    "description": "High-quality leads",
    "basePrice": 150.00,
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

---

### Get My Lead Types
```http
GET /lead-types/my
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "title": "Premium Leads",
      "description": "High-quality leads",
      "basePrice": 150.00,
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

### Update Lead Type
```http
PUT /lead-types/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Premium Leads Updated",
  "description": "Updated description",
  "basePrice": 200.00
}
```

---

### Delete Lead Type
```http
DELETE /lead-types/{id}
Authorization: Bearer <token>
```

---

## 🔗 Leads Endpoints

### Create Lead
```http
POST /leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "leadTypeId": "uuid",
  "city": "Moscow",
  "price": 150.00,
  "phone": "+79998887766",
  "fullName": "John Doe",
  "consentText": "I agree to data processing",
  "clientIp": "192.168.1.1",
  "userAgent": "Mozilla/5.0"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "leadTypeId": "uuid",
    "marketerId": "uuid",
    "city": "Moscow",
    "price": 150.00,
    "status": "NEW",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z",
    "leadPrivate": {
      "id": "uuid",
      "phone": "+79998887766",
      "fullName": "John Doe",
      "consentId": "uuid"
    },
    "consent": {
      "id": "uuid",
      "marketerId": "uuid",
      "consentText": "I agree to data processing",
      "clientIp": "192.168.1.1",
      "userAgent": "Mozilla/5.0",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  }
}
```

---

### Get My Leads
```http
GET /leads/my
Authorization: Bearer <token>
```

---

### Get Leads Catalog (Public)
```http
GET /leads/catalog?page=1&limit=10
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Note:** Returns only published leads WITHOUT private information

---

### Search Leads by City
```http
GET /leads/search?city=Moscow&page=1&limit=10
```

**Query Parameters:**
- `city`: City name (required)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

---

### Get Lead Full Information
```http
GET /leads/{id}/full
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "leadTypeId": "uuid",
    "marketerId": "uuid",
    "city": "Moscow",
    "price": 150.00,
    "status": "PUBLISHED",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z",
    "leadType": { /* ... */ },
    "leadPrivate": {
      "id": "uuid",
      "phone": "+79998887766",
      "fullName": "John Doe",
      "consentId": "uuid"
    }
  }
}
```

**Note:** Full information with private data is only returned to:
1. Lead owner (marketer)
2. Manager who has successfully purchased the lead

---

### Publish Lead
```http
PUT /leads/{id}/publish
Authorization: Bearer <token>
```

---

## 📦 Orders Endpoints

### Create Order
```http
POST /orders/{leadId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 150.00
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "leadId": "uuid",
    "managerId": "uuid",
    "amount": 150.00,
    "status": "PENDING",
    "createdAt": "2024-01-01T10:00:00Z",
    "updatedAt": "2024-01-01T10:00:00Z"
  }
}
```

---

### Get My Orders
```http
GET /orders/my
Authorization: Bearer <token>
```

---

### Get Order Details
```http
GET /orders/{id}
Authorization: Bearer <token>
```

---

## 💳 Payments Endpoints

### Create Payment
```http
POST /payments/create/{orderId}
Authorization: Bearer <token>
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderId": "uuid",
    "externalId": "payment_12345678",
    "amount": 150.00,
    "status": "CREATED",
    "paidAt": null,
    "createdAt": "2024-01-01T10:00:00Z",
    "payment_url": "https://payment.example.com/pay/payment_12345678"
  }
}
```

---

### Get Order Payments
```http
GET /payments/{orderId}
Authorization: Bearer <token>
```

---

### Refund Payment
```http
POST /payments/refund/{paymentId}
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "orderId": "uuid",
    "externalId": "payment_12345678",
    "amount": 150.00,
    "status": "REFUNDED",
    "paidAt": "2024-01-01T10:00:00Z",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

---

### Payment Webhook
```http
POST /payments/webhook
Content-Type: application/json

{
  "external_id": "payment_12345678",
  "status": "success",
  "signature": "webhook_secret_key"
}
```

**Status values:**
- `success` / `paid` → Payment successful
- `failed` / `failure` → Payment failed

**Note:** Signature must match PAYMENT_WEBHOOK_SECRET

---

## ✅ Consent Endpoints

### Get Consents
```http
GET /consent
Authorization: Bearer <token>
```

---

### Get Consent Details
```http
GET /consent/{id}
Authorization: Bearer <token>
```

---

## 🏥 Health Check

### Server Health
```http
GET /health
```

**Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

---

## 🔴 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Missing or invalid authorization header"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| MARKETER | Create leads, create lead types, view own data |
| MANAGER | View catalog, create orders, make payments |
| ADMIN | Full access to all endpoints |

---

## 🔄 Lead Statuses

| Status | Description |
|--------|-------------|
| NEW | Newly created lead |
| PUBLISHED | Published in catalog |
| SOLD | Purchased by a manager |

---

## 📋 Order Statuses

| Status | Description |
|--------|-------------|
| PENDING | Order created, waiting for payment |
| SUCCESS | Payment successful, order completed |
| CANCELLED | Order cancelled |

---

## 💰 Payment Statuses

| Status | Description |
|--------|-------------|
| CREATED | Payment created, awaiting processing |
| PAID | Payment successful |
| FAILED | Payment failed |
| REFUNDED | Payment refunded |

---

## 🚀 Rate Limiting

- **General endpoints**: 10 requests/second
- **Auth endpoints**: 5 requests/minute
- **Burst limit**: 20 requests

---

## 📝 Examples

### Complete Workflow: Manager Buying a Lead

```bash
# 1. Register as manager
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "Manager123!"
  }'

# 2. Login to get token
RESPONSE=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "Manager123!"
  }')
TOKEN=$(echo $RESPONSE | jq -r '.data.token')

# 3. Browse catalog
curl http://localhost:3000/api/leads/catalog?page=1&limit=10

# 4. Create order
ORDER=$(curl -X POST http://localhost:3000/api/orders/LEAD_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.00
  }')
ORDER_ID=$(echo $ORDER | jq -r '.data.id')

# 5. Create payment
PAYMENT=$(curl -X POST http://localhost:3000/api/payments/create/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN")
PAYMENT_ID=$(echo $PAYMENT | jq -r '.data.id')

# 6. Simulate payment webhook
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "'$(echo $PAYMENT | jq -r '.data.externalId')'",
    "status": "success",
    "signature": "webhook_secret_key"
  }'

# 7. Get full lead information (now with phone number)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/leads/LEAD_ID/full
```

---

**Документация последний раз обновлена:** January 2024

# Amigo Backend - Invite Code System API Documentation

## Overview

This documentation covers the invite code registration system. Users can register in two ways:
1. **By Payment** (default for existing users)
2. **By Invite Code** (new users can register using an invite code from existing invite users)

### Key Rules:
- One user can invite only **2 users** maximum
- Only users who registered **by invite code** can invite others
- Users who registered **by payment** cannot invite anyone
- The first user will be manually added to the database with invite privileges

---

## Registration Flow

### Step-by-Step Flow for Invite Code Registration:

1. **Check Phone Number** → Verify if phone exists
2. **Verify Invite Code** → Validate the invite code
3. **Send Phone OTP** → Send OTP to phone (SMS)
4. **Verify Phone OTP** → Verify the phone OTP and get `otpToken`
5. **Send Email OTP** → Send OTP to email (registration only)
6. **Verify Email OTP** → Verify the email OTP and get `emailOtpToken`
7. **Create User Profile** → Create user with invite code (requires both tokens)

---

## API Endpoints

### 1. Check Phone Number

**Endpoint:** `POST /api/user-auth/check-phone`

**Description:** Check if a phone number exists in the database. This should be called first before registration.

**Authentication:** Not required

**Request Body:**
```json
{
  "phone": "923039971549"
}
```

**Success Response (User Exists):**
```json
{
  "status": 200,
  "message": "User exists with this phone number",
  "exists": true,
  "data": {
    "phone": "923039971549",
    "userId": "66910427a5a6bc63019799e9",
    "email": "user@example.com"
  }
}
```

**Success Response (User Doesn't Exist):**
```json
{
  "status": 200,
  "message": "User does not exist with this phone number",
  "exists": false,
  "data": {
    "phone": "923039971549"
  }
}
```

**Error Response:**
```json
{
  "status": 400,
  "message": "Phone number is required",
  "exists": false
}
```

**Error Response (Invalid Format):**
```json
{
  "status": 400,
  "message": "Invalid phone number format. Please include country code (e.g., 923039971549)",
  "exists": false
}
```

---

### 2. Verify Invite Code

**Endpoint:** `POST /api/user-auth/verify-invite-code`

**Description:** Verify if an invite code is valid and can be used for registration.

**Authentication:** Not required

**Request Body:**
```json
{
  "inviteCode": "ABC12345"
}
```

**Success Response:**
```json
{
  "status": 200,
  "message": "Invite code is valid",
  "valid": true,
  "data": {
    "inviteCode": "ABC12345",
    "inviterName": "John Doe",
    "invitesRemaining": 1
  }
}
```

**Error Response (Invalid Code):**
```json
{
  "status": 404,
  "message": "Invalid invite code",
  "valid": false
}
```

**Error Response (Limit Reached):**
```json
{
  "status": 403,
  "message": "This invite code has reached its maximum usage limit (2 users)",
  "valid": false
}
```

**Error Response (Cannot Invite):**
```json
{
  "status": 403,
  "message": "This user cannot invite others. Only users who registered with an invite code can invite others.",
  "valid": false
}
```

**Error Response (Missing Code):**
```json
{
  "status": 400,
  "message": "Invite code is required",
  "valid": false
}
```

---

### 3. Send OTP

**Endpoint:** `POST /api/user-auth/send-otp`

**Description:** Send OTP to the user's phone for verification. Validation is done using phone only (no email).

**Authentication:** Not required

**Request Body:**
```json
{
  "phone": "923039971549",
  "flowType": "register"
}
```

**Note:** `flowType` can be `"register"` or `"login"`. Phone must include country code (e.g., 923039971549). OTP is sent via SMS.

---

### 4. Verify OTP

**Endpoint:** `POST /api/user-auth/verify-otp`

**Description:** Verify the OTP code. Uses phone and OTP only (no email).

**Authentication:** Not required

**Request Body:**
```json
{
  "phone": "923039971549",
  "otp": "123456",
  "flowType": "register"
}
```

---

### 5. Send Email OTP (Registration Only)

**Endpoint:** `POST /api/user-auth/send-email-otp`

**Description:** Send OTP to the user's email for **new registration email verification**.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response:**
```json
{
  "status": 200,
  "message": "Registration OTP sent to user@example.com successfully",
  "data": {
    "email": "user@example.com"
  }
}
```

---

### 6. Verify Email OTP (Registration Only)

**Endpoint:** `POST /api/user-auth/verify-email-otp`

**Description:** Verify the email OTP and return an `emailOtpToken` to be used in `create-userinfo`.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response:**
```json
{
  "status": 200,
  "message": "Email OTP verified successfully",
  "data": {
    "email": "user@example.com",
    "emailOtpToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 7. Create User Profile (Updated)

**Endpoint:** `POST /api/user-auth/create-userinfo`

**Description:** Create user profile. Now supports invite code registration.

**Authentication:** Not required (but OTP token is required)

**Content-Type:** `multipart/form-data`

**Form Data Fields:**
- `images` (file): **required**. Upload 1+ images. The first image is used as `userProfile`.
- `phone` (string): required
- `email` (string): optional
- `firstName` (string): required
- `lastName` (string): required
- `userName` (string): required
- `otpToken` (string): required (from phone `verify-otp`)
- `emailOtpToken` (string): optional (required only if `email` is provided)
- `inviteCode` (string): optional
- `fcmToken` (string): optional

**Example (cURL):**
```bash
curl -X POST "http://localhost:<port>/api/user-auth/create-userinfo" \
  -H "Content-Type: multipart/form-data" \
  -F "images=@/path/to/profile.jpg" \
  -F "phone=923039971549" \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "userName=johndoe" \
  -F "otpToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "fcmToken=firebase_token_here" \
  -F "inviteCode=ABC12345"
```

**Important Notes:**
- `otpToken`: Required - obtained from phone `verify-otp` API
- If `email` is provided, `emailOtpToken` is required - obtained from email `verify-email-otp` API
- `inviteCode`: Optional - include only if registering with invite code
- If `inviteCode` is provided, user will be registered as `registrationType: "invite"` and can invite others
- If `inviteCode` is not provided, user will be registered as `registrationType: "payment"` and cannot invite others

**Success Response:**
```json
{
  "message": "User created successfully",
  "status": 201,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "66910427a5a6bc63019799e9",
    "phone": "923039971549",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userName": "johndoe",
    "registrationType": "invite",
    "inviteCode": "XYZ98765",
    "usedInviteCode": "ABC12345",
    "canInvite": true,
    "invitesUsed": 0,
    "isVerified": true,
    "userProfile": "https://...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (Invalid Invite Code):**
```json
{
  "status": 404,
  "message": "Invalid invite code"
}
```

**Error Response (Invite Limit Reached):**
```json
{
  "status": 403,
  "message": "This invite code has reached its maximum usage limit (2 users)"
}
```

**Error Response (Cannot Invite):**
```json
{
  "status": 403,
  "message": "This user cannot invite others. Only users who registered with an invite code can invite others."
}
```

---

### 6. Get Invite Code (For Authenticated Users)

**Endpoint:** `GET /api/user-auth/get-invite-code`

**Description:** Get the authenticated user's invite code and usage statistics.

**Authentication:** Required (Bearer token in Authorization header)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "status": 200,
  "message": "Invite code retrieved successfully",
  "canInvite": true,
  "data": {
    "inviteCode": "ABC12345",
    "invitesUsed": 1,
    "invitesRemaining": 1
  }
}
```

**Error Response (Cannot Invite):**
```json
{
  "status": 403,
  "message": "You cannot invite users. Only users who registered with an invite code can invite others.",
  "canInvite": false
}
```

**Error Response (Limit Reached):**
```json
{
  "status": 403,
  "message": "You have reached the maximum number of invites (2)",
  "canInvite": false,
  "invitesUsed": 2,
  "invitesRemaining": 0
}
```

**Error Response (User Not Found):**
```json
{
  "status": 404,
  "message": "User not found"
}
```

---

## Complete Registration Flow Example

### Scenario: User registering with invite code

**Step 1: Check Phone Number**
```http
POST /api/user-auth/check-phone
Content-Type: application/json

{
  "phone": "923039971549"
}
```

**Response:**
```json
{
  "status": 200,
  "exists": false,
  "message": "User does not exist with this phone number"
}
```

**Step 2: Verify Invite Code**
```http
POST /api/user-auth/verify-invite-code
Content-Type: application/json

{
  "inviteCode": "ABC12345"
}
```

**Response:**
```json
{
  "status": 200,
  "valid": true,
  "message": "Invite code is valid",
  "data": {
    "inviteCode": "ABC12345",
    "inviterName": "John Doe",
    "invitesRemaining": 1
  }
}
```

**Step 3: Send OTP**
```http
POST /api/user-auth/send-otp
Content-Type: application/json

{
  "phone": "923039971549",
  "flowType": "register"
}
```

**Step 4: Verify OTP**
```http
POST /api/user-auth/verify-otp
Content-Type: application/json

{
  "phone": "923039971549",
  "otp": "123456",
  "flowType": "register"
}
```

**Response:**
```json
{
  "status": 201,
  "message": "Otp verification successful for registration",
  "token": ""
}
```

**Step 5: Send Email OTP**
```http
POST /api/user-auth/send-email-otp
Content-Type: application/json

{
  "email": "newuser@example.com"
}
```

**Step 6: Verify Email OTP**
```http
POST /api/user-auth/verify-email-otp
Content-Type: application/json

{
  "email": "newuser@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "status": 200,
  "message": "Email OTP verified successfully",
  "data": {
    "email": "newuser@example.com",
    "emailOtpToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Step 7: Create User Profile**
```http
POST /api/user-auth/create-userinfo
Content-Type: multipart/form-data

Form fields:
- images: (file) profile image
- phone: 923039971549
- firstName: Jane
- lastName: Smith
- userName: janesmith
- otpToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- inviteCode: ABC12345

Optional email verification fields (only if you want to verify email at signup):
- email: newuser@example.com
- emailOtpToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "User created successfully",
  "status": 201,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "66910427a5a6bc63019799e9",
    "phone": "923039971549",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "userName": "janesmith",
    "registrationType": "invite",
    "inviteCode": "XYZ98765",
    "usedInviteCode": "ABC12345",
    "canInvite": true,
    "invitesUsed": 0,
    "isVerified": true
  }
}
```

---

## User Model Fields (Reference)

When a user is created, the following fields are relevant to the invite system:

| Field | Type | Description |
|-------|------|-------------|
| `registrationType` | String | `"payment"` or `"invite"` |
| `inviteCode` | String | Unique invite code for this user (only if registered by invite) |
| `usedInviteCode` | String | The invite code this user used to register |
| `invitesUsed` | Number | Number of users invited (0-2) |
| `canInvite` | Boolean | Whether user can invite others (true only if registered by invite) |

---

## Error Codes Summary

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad Request (missing/invalid parameters) |
| 401 | Unauthorized (invalid token) |
| 403 | Forbidden (invite limit reached, cannot invite) |
| 404 | Not Found (invalid invite code, user not found) |
| 409 | Conflict (user already exists, duplicate username/email) |
| 500 | Internal Server Error |

---

## Important Notes for Frontend

1. **Invite Code is Optional**: Users can register without an invite code (payment registration). Simply omit the `inviteCode` field in the create-userinfo request.

2. **Invite Code Validation**: Always verify the invite code before allowing the user to proceed with registration. This prevents users from entering invalid codes and getting errors at the final step.

3. **Phone Check First**: Always check if the phone number exists before showing the registration form. If `exists: true`, redirect to login instead.

4. **Token Management**: Store the `otpToken` from verify-otp response and use it in create-userinfo request.

5. **User's Invite Code**: After successful registration with invite code, the user will receive their own `inviteCode` in the response. They can use this to invite others (up to 2 users).

6. **Invite Code Display**: Use the `/get-invite-code` API to show users their invite code and remaining invites count.

7. **Error Handling**: Handle all error cases gracefully:
   - Invalid invite code → Show error, allow user to enter a different code
   - Invite limit reached → Show message that code is no longer valid
   - Cannot invite → Show message explaining why

---

## Testing Checklist

- [ ] Check phone number (existing user)
- [ ] Check phone number (new user)
- [ ] Verify valid invite code
- [ ] Verify invalid invite code
- [ ] Verify invite code that reached limit
- [ ] Register user with invite code
- [ ] Register user without invite code (payment)
- [ ] Get invite code for authenticated invite user
- [ ] Get invite code for payment user (should fail)
- [ ] Verify invite code usage increments correctly

---

## Base URL

```
Development: http://localhost:<port>/api
Production: https://your-domain.com/api
```

---

## Support

For any questions or issues, please contact the backend development team.

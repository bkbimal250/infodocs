# Admin Activity Tracking & Notifications System

## Overview

Comprehensive activity tracking and notification system for the admin panel. Tracks all user activities including logins, OTP requests, password resets, certificate generation, and more.

## Features Implemented

### 1. **Comprehensive Activity Tracking**

All activities are now logged and visible in the admin panel:

- ✅ **Login Activities**
  - Password login (success/failed)
  - OTP login (request, verify, success/failed)
  - Login time tracking
  - IP address and user agent tracking

- ✅ **OTP Activities**
  - OTP requested (login, password reset, email verification)
  - OTP verified successfully
  - OTP verification failed

- ✅ **Password Reset Activities**
  - Password reset requested
  - Password reset completed
  - Password reset failed

- ✅ **Certificate Generation**
  - Certificate created
  - Certificate type and candidate name tracked
  - User who created it tracked

### 2. **Email Notifications to Admin**

- ✅ **Login Alerts**: Admin receives email when any user logs in
  - Includes user name, email, role
  - Login time (UTC)
  - IP address
  - User agent

### 3. **Admin Dashboard Pages**

#### Recent Notifications Page (`/admin/notifications`)
- Shows all system notifications
- Filter by type: All, Unread, Login, OTP, Password Reset, Certificates
- Mark as read / Mark all as read
- Delete notifications
- Real-time updates
- Shows IP address and timestamp

#### Recent Activity Page (`/admin/activities`)
- Shows all user activities
- Two tabs: "All Activities" and "Login History"
- Filter by type: All, Login, OTP, Password Reset, Certificates
- Shows activity description, IP address, user agent
- Delete activities
- Color-coded by activity type

## Backend Changes

### Files Modified

1. **`fastapi-backend/apps/notifications/services/notification_service.py`**
   - Added `create_otp_notification()` - Tracks OTP activities
   - Added `create_password_reset_notification()` - Tracks password reset activities
   - Enhanced `create_login_notification()` - Sends email to admin on login
   - All notifications include metadata (IP, timestamp, etc.)

2. **`fastapi-backend/apps/users/routers.py`**
   - Enhanced `/request_login_otp` - Logs OTP request activity
   - Enhanced `/login_with_otp` - Logs OTP verification (success/failed)
   - Enhanced `/login` - Logs password login and sends admin email
   - Enhanced `/login_with_email` - Logs password login and sends admin email
   - Enhanced `/request_password_reset` - Logs password reset request
   - Enhanced `/reset_password` - Logs password reset completion/failure

3. **`fastapi-backend/apps/certificates/services/certificate_service.py`**
   - Already tracks certificate generation (no changes needed)

## Frontend Changes

### Files Created

1. **`Client/src/pages/Admin/RecentNotification/RecentNotifcation.jsx`**
   - Comprehensive notifications page
   - Filters, pagination, mark as read
   - Shows all notification types with icons

2. **`Client/src/pages/Admin/RecentActivity/RecentActivity.jsx`**
   - Comprehensive activities page
   - Two tabs: Activities and Login History
   - Filters, pagination, delete functionality
   - Color-coded activity types

3. **`Client/src/pages/Admin/RecentNotification/index.js`**
   - Export file

4. **`Client/src/pages/Admin/RecentActivity/index.js`**
   - Export file

### Files Modified

1. **`Client/src/pages/Admin/index.js`**
   - Added exports for RecentNotification and RecentActivity

2. **`Client/src/router/AppRouter.jsx`**
   - Updated routes to use Admin versions of notification/activity pages
   - Routes: `/admin/notifications` and `/admin/activities`

## API Endpoints Used

### Notifications
- `GET /api/notifications` - Get all notifications (admin sees all)
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/{id}/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/{id}` - Delete notification

### Activities
- `GET /api/notifications/activities` - Get all activities (admin sees all)
- `GET /api/notifications/login-history` - Get login history
- `DELETE /api/notifications/activities/{id}` - Delete activity

## Activity Types Tracked

| Activity Type | Description | When Logged |
|--------------|-------------|-------------|
| `password_login_success` | User logged in with password | On successful password login |
| `otp_requested` | OTP requested for login | When user requests login OTP |
| `otp_verification_success` | OTP verified successfully | When OTP login succeeds |
| `otp_verification_failed` | OTP verification failed | When OTP is invalid/expired |
| `password_reset_requested` | Password reset OTP requested | When user requests password reset |
| `password_reset_completed` | Password reset successful | When password is reset |
| `password_reset_failed` | Password reset failed | When OTP is invalid |
| `certificate_created` | Certificate generated | When certificate is created |

## Notification Types

| Notification Type | Description |
|------------------|-------------|
| `login` | User login successful |
| `otp_login` | OTP login related |
| `otp_password_reset` | Password reset OTP related |
| `otp_email_verification` | Email verification OTP |
| `password_reset` | Password reset related |
| `certificate_created` | Certificate generation |

## Email Notifications

### Admin Login Alerts

When any user logs in, all admin users receive an email with:
- User name and email
- User role
- Login time (UTC)
- IP address
- User agent

**Email is sent to all users with role `admin` or `super_admin`**

## Admin Panel Navigation

The admin sidebar already includes:
- **Notifications** - `/admin/notifications`
- **Recent Activity** - `/admin/activities`

## Testing

1. **Test Login Tracking:**
   - Login with password → Check admin notifications
   - Login with OTP → Check admin notifications
   - Check activities page for login entries

2. **Test OTP Tracking:**
   - Request login OTP → Check notifications
   - Verify OTP → Check activities

3. **Test Password Reset:**
   - Request password reset → Check notifications
   - Complete password reset → Check activities

4. **Test Certificate Generation:**
   - Generate certificate → Check notifications and activities

5. **Test Admin Email:**
   - Login as any user → Admin should receive email
   - Check email inbox for login alert

## Configuration

### Email Settings

Make sure your `.env` file has SMTP settings configured:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USE_TLS=True
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SERVER_EMAIL=your-email@gmail.com
SKIP_EMAIL=False
```

### Disable Admin Email Alerts

If you want to disable admin email alerts, you can:
1. Set `SKIP_EMAIL=True` in `.env` (disables all emails)
2. Or modify `create_login_notification()` to set `send_admin_email=False`

## Summary

✅ All user activities are now tracked  
✅ Admin receives email on user logins  
✅ Comprehensive notification system  
✅ Activity tracking for OTP, password reset, login, certificates  
✅ Admin dashboard pages for viewing all activities  
✅ Login time shown in website  
✅ All activities visible in admin panel  

The system is now fully operational and ready to track all user activities!



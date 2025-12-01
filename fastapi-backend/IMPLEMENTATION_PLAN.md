# Implementation Plan: User Tracking & Notifications

## Overview
This document outlines the implementation of comprehensive user tracking, activity logging, and notification system.

## Completed ✅

### 1. Models Created
- ✅ `LoginHistory` - Tracks user login activities
- ✅ `Notification` - System notifications for users
- ✅ `UserActivity` - Tracks all user activities
- ✅ `created_by` field added to `CertificateBase` - Tracks certificate creator
- ✅ `last_login_at` field added to `User` model

### 2. Services Created
- ✅ `notification_service.py` - Handles notification creation and management
- ✅ `activity_service.py` - Handles activity logging

## To Be Implemented

### 3. Update Auth Service
- [ ] Update login endpoints to:
  - Track login history
  - Update `last_login_at` in User model
  - Create login notifications
  - Log login activity

### 4. Update Certificate Service
- [ ] Update `create_generated_certificate` to:
  - Accept `created_by` parameter (user_id)
  - Track certificate creation activity
  - Create certificate creation notification

### 5. Update Forms App
- [ ] Add `created_by` field to:
  - `CandidateForm`
  - `Hiring_Form`
- [ ] Track form submission activities

### 6. Notification Routers
- [ ] Create endpoints for:
  - List user notifications
  - Mark notification as read
  - Mark all as read
  - Get unread count

### 7. Admin Endpoints
- [ ] Login history endpoints (admin only)
- [ ] User activity endpoints (admin only)
- [ ] User dashboard data endpoints

### 8. Frontend Integration
- [ ] Notification component
- [ ] Activity history component
- [ ] Admin dashboard with login history

## Role-Based Access

### Super Admin & Admin
- ✅ All rights
- ✅ View all login history
- ✅ View all user activities
- ✅ View all notifications
- ✅ Manage users

### Manager & HR
- ✅ All rights (same as admin)
- ✅ View login history
- ✅ View user activities
- ✅ Manage certificates

### User
- ✅ Create certificates (tracked)
- ✅ Submit forms (tracked)
- ✅ Submit hiring data (tracked)
- ✅ View own history
- ✅ View own notifications


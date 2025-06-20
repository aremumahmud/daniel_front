# Settings Page Implementation Guide

## 🚀 Quick Start

### 1. Database Setup
First, create the required database tables:

```sql
-- User Preferences Table
CREATE TABLE user_preferences (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  theme VARCHAR(20) DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_preferences (user_id)
);

-- Notification Settings Table
CREATE TABLE notification_settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  appointment_reminders BOOLEAN DEFAULT true,
  system_updates BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_notifications (user_id)
);

-- Security Settings Table
CREATE TABLE security_settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_method VARCHAR(20) DEFAULT 'email',
  backup_codes JSON,
  last_password_change TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_security (user_id)
);

-- Data Exports Table
CREATE TABLE data_exports (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  format VARCHAR(10) NOT NULL,
  include_deleted BOOLEAN DEFAULT false,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  download_url VARCHAR(500),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Account Deletions Table
CREATE TABLE account_deletions (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  scheduled_date TIMESTAMP NOT NULL,
  cancellation_deadline TIMESTAMP NOT NULL,
  reason TEXT,
  feedback TEXT,
  status ENUM('pending', 'cancelled', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2. Backend Routes Implementation

Copy the routes from `docs/BACKEND_ROUTES_EXAMPLE.js` and integrate them into your backend:

```javascript
// In your main app.js or routes/index.js
const settingsRoutes = require('./routes/settings');
app.use('/api', settingsRoutes);
```

### 3. Frontend Integration

The frontend is already set up! The settings page will automatically:
- ✅ Load user preferences and notification settings on mount
- ✅ Save changes to the backend when users click save buttons
- ✅ Show loading states and error handling
- ✅ Display success/error toast notifications

## 📋 Implementation Checklist

### High Priority (Core Features)
- [ ] **Database Tables**: Create the 5 required tables
- [ ] **Profile Get API**: ✅ Already implemented (`GET /api/user/profile`) - See PROFILE_API.md
- [ ] **User Preferences API**: Implement GET/PUT `/api/user/preferences`
- [ ] **Notification Settings API**: Implement GET/PUT `/api/user/notifications`
- [ ] **Profile Update**: ✅ Already implemented (`PUT /api/user/profile`) - See PROFILE_API.md
- [ ] **Password Change**: ✅ Already implemented (`PUT /api/auth/change-password`)

### Medium Priority (Enhanced Features)
- [ ] **Security Settings API**: Implement GET `/api/user/security`
- [ ] **Two-Factor Auth API**: Implement PUT `/api/user/security/2fa`
- [ ] **Data Export API**: ✅ Already implemented (`POST /api/user/data-export`) - Immediate processing
- [ ] **Avatar Upload**: Implement POST/DELETE `/api/user/avatar`

### Low Priority (Advanced Features)
- [ ] **Account Deletion**: Implement POST/DELETE `/api/user/delete-account`
- [ ] **Background Jobs**: Set up data export processing
- [ ] **Email Notifications**: Send emails for exports/deletions
- [ ] **Audit Logging**: Track settings changes

## 🔧 Testing the Implementation

### 1. Test with cURL

```bash
# Get admin token first
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@healthcare.com","password":"admin123","adminCode":"ADMIN2024!@#"}' \
  | jq -r '.token')

# Test profile endpoint (already implemented)
curl -X GET "http://localhost:5000/api/user/profile" \
  -H "Authorization: Bearer $TOKEN"

# Test user preferences (need implementation)
curl -X GET "http://localhost:5000/api/user/preferences" \
  -H "Authorization: Bearer $TOKEN"

curl -X PUT "http://localhost:5000/api/user/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"language":"es","timezone":"EST","dateFormat":"DD/MM/YYYY","theme":"dark"}'

# Test notification settings (need implementation)
curl -X GET "http://localhost:5000/api/user/notifications" \
  -H "Authorization: Bearer $TOKEN"

curl -X PUT "http://localhost:5000/api/user/notifications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emailNotifications":true,"appointmentReminders":false,"systemUpdates":true,"marketingEmails":false}'

# Test data export (already implemented)
curl -X POST "http://localhost:5000/api/user/data-export" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "json",
    "includeDeleted": false,
    "dataTypes": ["profile", "preferences", "notifications", "security_logs"]
  }'
```

### 2. Test in Frontend

1. Navigate to `/dashboard/settings`
2. Try updating personal information
3. Try changing password
4. Try updating notification preferences
5. Try updating app preferences
6. Check browser console for any errors

## 🚨 Error Handling

The frontend already handles these error scenarios:
- **Network errors**: Shows "Failed to update" toast
- **Validation errors**: Shows specific error messages
- **Authentication errors**: Redirects to login
- **Loading states**: Disables buttons and shows "Saving..." text

## 🔒 Security Considerations

### Authentication
- All routes require valid JWT token
- Token is automatically included in requests
- Invalid tokens redirect to login page

### Validation
- Validate all input on backend
- Sanitize user data before database storage
- Use parameterized queries to prevent SQL injection

### Password Changes
- Always verify current password before allowing changes
- Hash new passwords with bcrypt
- Log password change events for security auditing

### Data Export
- Limit export frequency (e.g., once per day)
- Set expiration dates on download URLs
- Include only user's own data in exports

### Account Deletion
- Require password confirmation
- Implement grace period (7 days)
- Allow cancellation before deadline
- Anonymize data instead of hard deletion (GDPR compliance)

## 📊 Monitoring & Analytics

Consider tracking these metrics:
- Settings page usage
- Most changed preferences
- Password change frequency
- Data export requests
- Account deletion requests (and cancellations)

## 🔄 Future Enhancements

### Phase 2 Features
- **Session Management**: View and revoke active sessions
- **Privacy Controls**: Granular data sharing preferences
- **Backup & Restore**: Settings backup/restore functionality
- **Multi-language**: Full i18n support
- **Advanced 2FA**: TOTP app support, hardware keys

### Phase 3 Features
- **Settings Sync**: Sync settings across devices
- **Settings History**: Track and revert setting changes
- **Bulk Operations**: Import/export settings
- **Admin Controls**: Organization-wide setting policies

## 📚 Related Documentation

- **API Routes**: `docs/SETTINGS_API_ROUTES.md`
- **Backend Example**: `docs/BACKEND_ROUTES_EXAMPLE.js`
- **Frontend Service**: `services/settings.service.ts`
- **Settings Component**: `components/settings-page.tsx`

## 🆘 Troubleshooting

### Common Issues

1. **"Failed to load preferences"**
   - Check if database tables exist
   - Verify API routes are registered
   - Check authentication middleware

2. **"Failed to update settings"**
   - Check request payload format
   - Verify database constraints
   - Check server logs for errors

3. **Settings not persisting**
   - Verify database write permissions
   - Check for transaction rollbacks
   - Ensure proper error handling

4. **Loading states stuck**
   - Check for unhandled promise rejections
   - Verify finally blocks in try/catch
   - Check network tab for failed requests

### Debug Steps

1. Check browser console for JavaScript errors
2. Check network tab for API request/response
3. Check server logs for backend errors
4. Verify database table structure and data
5. Test API endpoints directly with cURL/Postman

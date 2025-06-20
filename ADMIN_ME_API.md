# Admin Profile API Documentation

## Overview

The Admin Profile API provides comprehensive information about the currently authenticated admin user, including personal details, system statistics, capabilities, and session information. This endpoint is exclusively available to users with admin privileges.

## Authentication

**Required:**
- **Bearer Token Authentication**: Include `Authorization: Bearer <admin_token>` in headers
- **Admin Role**: Only users with `role: "admin"` can access this endpoint

## Endpoint

### Get Admin Profile Information

```http
GET /api/auth/admin/me
```

#### Description
Retrieves comprehensive profile information for the currently authenticated admin user, including:
- Personal profile details
- System overview statistics
- Admin capabilities and permissions
- System health information
- Current session details

#### Headers
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

#### Request
No request body required. The admin user is identified from the JWT token.

#### Response

##### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Admin profile retrieved successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "admin@healthcare.com",
      "firstName": "John",
      "lastName": "Admin",
      "fullName": "John Admin",
      "role": "admin",
      "emailVerified": true,
      "avatarUrl": "https://example.com/avatar.jpg",
      "isActive": true,
      "lastLogin": "2024-01-20T10:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    },
    "statistics": {
      "overview": {
        "totalUsers": 1250,
        "totalPatients": 980,
        "totalDoctors": 45,
        "totalAdmins": 3
      },
      "recentActivity": {
        "newUsersLast30Days": 85,
        "newPatientsLast30Days": 67
      }
    },
    "capabilities": {
      "canCreateUsers": true,
      "canDeleteUsers": true,
      "canViewAllPatients": true,
      "canManageSystem": true,
      "canAccessAnalytics": true,
      "canManageAdmins": true,
      "canExportData": true,
      "canManageSettings": true
    },
    "systemInfo": {
      "serverUptime": 86400,
      "nodeVersion": "v18.17.0",
      "environment": "production",
      "databaseConnected": true,
      "lastBackup": null
    },
    "sessionInfo": {
      "loginTime": "2024-01-20T10:30:00.000Z",
      "sessionDuration": 3600,
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  }
}
```

##### Error Responses

**401 Unauthorized - No Token**
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

**401 Unauthorized - Invalid Token**
```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

**403 Forbidden - Non-Admin User**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

**404 Not Found - Admin User Not Found**
```json
{
  "success": false,
  "message": "Admin user not found"
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "message": "Error fetching admin profile",
  "error": "Database connection failed"
}
```

## Response Schema

### User Object
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique admin user identifier |
| `email` | string | Admin email address |
| `firstName` | string | Admin first name |
| `lastName` | string | Admin last name |
| `fullName` | string | Combined first and last name |
| `role` | string | User role (always "admin") |
| `emailVerified` | boolean | Email verification status |
| `avatarUrl` | string | Profile picture URL |
| `isActive` | boolean | Account active status |
| `lastLogin` | string | ISO 8601 timestamp of last login |
| `createdAt` | string | ISO 8601 timestamp of account creation |
| `updatedAt` | string | ISO 8601 timestamp of last update |

### Statistics Object
| Field | Type | Description |
|-------|------|-------------|
| `overview.totalUsers` | number | Total number of users in system |
| `overview.totalPatients` | number | Total number of patients |
| `overview.totalDoctors` | number | Total number of doctors |
| `overview.totalAdmins` | number | Total number of admin users |
| `recentActivity.newUsersLast30Days` | number | New users in last 30 days |
| `recentActivity.newPatientsLast30Days` | number | New patients in last 30 days |

### Capabilities Object
| Field | Type | Description |
|-------|------|-------------|
| `canCreateUsers` | boolean | Permission to create new users |
| `canDeleteUsers` | boolean | Permission to delete users |
| `canViewAllPatients` | boolean | Permission to view all patient data |
| `canManageSystem` | boolean | Permission to manage system settings |
| `canAccessAnalytics` | boolean | Permission to access analytics |
| `canManageAdmins` | boolean | Permission to manage other admins |
| `canExportData` | boolean | Permission to export system data |
| `canManageSettings` | boolean | Permission to modify system settings |

### System Info Object
| Field | Type | Description |
|-------|------|-------------|
| `serverUptime` | number | Server uptime in seconds |
| `nodeVersion` | string | Node.js version |
| `environment` | string | Current environment (development/production) |
| `databaseConnected` | boolean | Database connection status |
| `lastBackup` | string/null | Last backup timestamp (if available) |

### Session Info Object
| Field | Type | Description |
|-------|------|-------------|
| `loginTime` | string | ISO 8601 timestamp of current session login |
| `sessionDuration` | number | Current session duration in seconds |
| `ipAddress` | string | Client IP address |
| `userAgent` | string | Client user agent string |

## Usage Examples

### cURL
```bash
curl -X GET http://localhost:8080/api/auth/admin/me \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### JavaScript/Axios
```javascript
const axios = require('axios');

const getAdminProfile = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/auth/admin/me', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Admin Profile:', response.data);
    
    // Access specific data
    const { user, statistics, capabilities } = response.data.data;
    console.log(`Welcome ${user.fullName}`);
    console.log(`Total Patients: ${statistics.overview.totalPatients}`);
    console.log(`Can Create Users: ${capabilities.canCreateUsers}`);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

getAdminProfile();
```

### Python/Requests
```python
import requests

def get_admin_profile(admin_token):
    url = "http://localhost:8080/api/auth/admin/me"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        user = data['data']['user']
        stats = data['data']['statistics']
        
        print(f"Welcome {user['fullName']}")
        print(f"Total Users: {stats['overview']['totalUsers']}")
        print(f"Recent Activity: {stats['recentActivity']['newUsersLast30Days']} new users")
        
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return None

# Usage
admin_token = "your_admin_token_here"
profile = get_admin_profile(admin_token)
```

### Frontend React Component
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('/api/auth/admin/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProfile(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-profile">
      <h1>Welcome, {profile.user.fullName}</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{profile.statistics.overview.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Patients</h3>
          <p>{profile.statistics.overview.totalPatients}</p>
        </div>
        <div className="stat-card">
          <h3>Total Doctors</h3>
          <p>{profile.statistics.overview.totalDoctors}</p>
        </div>
      </div>

      <div className="session-info">
        <h3>Session Information</h3>
        <p>Login Time: {new Date(profile.sessionInfo.loginTime).toLocaleString()}</p>
        <p>Session Duration: {Math.floor(profile.sessionInfo.sessionDuration / 60)} minutes</p>
        <p>IP Address: {profile.sessionInfo.ipAddress}</p>
      </div>

      <div className="capabilities">
        <h3>Admin Capabilities</h3>
        <ul>
          {Object.entries(profile.capabilities).map(([key, value]) => (
            <li key={key}>
              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}: {value ? '✅' : '❌'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminProfile;
```

## Security Considerations

1. **Admin-Only Access**: Endpoint is restricted to admin users only
2. **Token Validation**: JWT tokens are validated for authenticity and expiration
3. **Sensitive Data**: Password and other sensitive fields are excluded from response
4. **Session Tracking**: IP address and user agent are logged for security monitoring
5. **Rate Limiting**: API calls are rate-limited to prevent abuse

## Use Cases

1. **Admin Dashboard**: Display admin profile and system overview
2. **Permission Checking**: Verify admin capabilities before showing UI elements
3. **Session Management**: Track admin session duration and activity
4. **System Monitoring**: Display system health and statistics
5. **Audit Logging**: Track admin access and activities

## Related Endpoints

- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/me` - Regular user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout
- `GET /api/admin/dashboard` - Admin dashboard data

## Error Handling Best Practices

1. **Check Response Status**: Always verify the `success` field
2. **Handle Token Expiration**: Redirect to login on 401 errors
3. **Permission Errors**: Show appropriate access denied messages
4. **Network Errors**: Implement retry logic for network failures
5. **Loading States**: Show loading indicators during API calls

## Testing

### Test Admin Token
```bash
# First, get an admin token
curl -X POST http://localhost:8080/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthcare.com",
    "password": "admin123",
    "adminCode": "ADMIN2024!@#"
  }'

# Then use the token to get admin profile
curl -X GET http://localhost:8080/api/auth/admin/me \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test Non-Admin Access
```bash
# This should return 403 Forbidden
curl -X GET http://localhost:8080/api/auth/admin/me \
  -H "Authorization: Bearer NON_ADMIN_TOKEN"
```

### Test Invalid Token
```bash
# This should return 401 Unauthorized
curl -X GET http://localhost:8080/api/auth/admin/me \
  -H "Authorization: Bearer INVALID_TOKEN"
```

## Performance Notes

- **Caching**: Consider caching statistics data for better performance
- **Database Queries**: Statistics are calculated in real-time; consider optimization for large datasets
- **Response Size**: Response includes comprehensive data; consider pagination for large statistics

## Changelog

- **v1.0.0**: Initial implementation with basic admin profile data
- **v1.1.0**: Added system statistics and capabilities
- **v1.2.0**: Added session information and system health data

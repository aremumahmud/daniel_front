# Admin Analytics & System Monitoring API Documentation

## Overview

This API provides comprehensive analytics, system monitoring, and dashboard data for administrators. It includes user analytics, real-time metrics, system health monitoring, and appointment analytics (placeholder).

## Authentication

**Required:**
- **Bearer Token Authentication**: Include `Authorization: Bearer <admin_token>` in headers
- **Admin Role**: Only users with `role: "admin"` can access these endpoints

## Base URL
```
/api/admin
```

---

## 1. User Analytics

### Endpoint
```http
GET /api/admin/analytics/users?period=month
```

### Description
Provides comprehensive user analytics including registration trends, user growth, activity metrics, and demographic breakdowns.

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `month` | Time period: `day`, `week`, `month`, `quarter`, `year` |

### Example Request
```bash
curl -X GET "http://localhost:8080/api/admin/analytics/users?period=month" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "period": "month",
    "dateRange": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    },
    "overview": {
      "totalUsers": 1250,
      "totalPatients": 980,
      "totalDoctors": 45,
      "totalAdmins": 3,
      "activeUsers": 856,
      "inactiveUsers": 394,
      "verifiedUsers": 1180,
      "unverifiedUsers": 70
    },
    "newRegistrations": {
      "total": 85,
      "patients": 67,
      "doctors": 15,
      "period": "month"
    },
    "userGrowth": [
      {
        "_id": { "year": 2024, "month": 1, "day": 15 },
        "count": 12,
        "patients": 8,
        "doctors": 4
      }
    ],
    "activityMetrics": {
      "activeUsersLast30Days": 856,
      "inactiveUsers": 394,
      "verificationRate": "94.40"
    }
  }
}
```

---

## 2. Admin Overview Dashboard

### Endpoint
```http
GET /api/admin/overview
```

### Description
Provides a comprehensive dashboard overview with quick stats, system health, and recent activity for the admin panel.

### Example Request
```bash
curl -X GET "http://localhost:8080/api/admin/overview" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "quickStats": {
      "totalUsers": 1250,
      "totalPatients": 980,
      "totalDoctors": 45,
      "newUsersToday": 12,
      "newPatientsToday": 8
    },
    "systemHealth": {
      "status": "healthy",
      "uptime": 86400,
      "memoryUsage": {
        "rss": 45678592,
        "heapUsed": 23456789,
        "heapTotal": 34567890,
        "external": 1234567
      },
      "cpuUsage": {
        "user": 123456,
        "system": 78901
      },
      "nodeVersion": "v18.17.0",
      "environment": "production"
    },
    "recentActivity": {
      "users": [
        {
          "_id": "user-id-1",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@email.com",
          "role": "patient",
          "createdAt": "2024-01-31T10:30:00.000Z"
        }
      ],
      "patients": [
        {
          "_id": "patient-id-1",
          "firstName": "Sarah",
          "lastName": "Johnson",
          "emailAddress": "sarah.johnson@email.com",
          "createdAt": "2024-01-31T14:20:00.000Z"
        }
      ]
    },
    "lastUpdated": "2024-01-31T15:45:30.000Z"
  }
}
```

---

## 3. Real-time Metrics

### Endpoint
```http
GET /api/admin/metrics/realtime
```

### Description
Provides real-time system metrics including recent activity, system performance, and database status.

### Example Request
```bash
curl -X GET "http://localhost:8080/api/admin/metrics/realtime" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "recentActivity": {
      "newUsersLast5Min": 2,
      "newPatientsLast5Min": 1,
      "newUsersLastHour": 15,
      "newPatientsLastHour": 12
    },
    "systemMetrics": {
      "timestamp": "2024-01-31T15:45:30.000Z",
      "uptime": 86400,
      "memoryUsage": {
        "rss": 45,
        "heapUsed": 23,
        "heapTotal": 35
      },
      "cpuUsage": {
        "user": 123456,
        "system": 78901
      },
      "loadAverage": [0.5, 0.7, 0.8],
      "freeMemory": 2048,
      "totalMemory": 8192
    },
    "dbStatus": {
      "connected": true,
      "responseTime": 1641234567890
    },
    "timestamp": "2024-01-31T15:45:30.000Z"
  }
}
```

---

## 4. Appointment Analytics

### Endpoint
```http
GET /api/admin/analytics/appointments?period=month
```

### Description
Provides appointment analytics data. Currently returns placeholder data as it requires an Appointment model implementation.

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `month` | Time period: `day`, `week`, `month`, `quarter`, `year` |

### Example Request
```bash
curl -X GET "http://localhost:8080/api/admin/analytics/appointments?period=month" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "period": "month",
    "dateRange": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    },
    "overview": {
      "totalAppointments": 0,
      "scheduledAppointments": 0,
      "completedAppointments": 0,
      "cancelledAppointments": 0,
      "noShowAppointments": 0
    },
    "appointmentsByStatus": [
      { "_id": "scheduled", "count": 0 },
      { "_id": "completed", "count": 0 },
      { "_id": "cancelled", "count": 0 },
      { "_id": "no-show", "count": 0 }
    ],
    "appointmentsByDepartment": [
      { "_id": "cardiology", "count": 0 },
      { "_id": "neurology", "count": 0 },
      { "_id": "pediatrics", "count": 0 },
      { "_id": "other", "count": 0 }
    ],
    "appointmentTrends": [],
    "message": "Appointment analytics placeholder - requires Appointment model implementation"
  }
}
```

---

## 5. System Health

### Endpoint
```http
GET /api/admin/system/health
```

### Description
Provides comprehensive system health monitoring including system information, memory metrics, CPU usage, and health checks.

### Example Request
```bash
curl -X GET "http://localhost:8080/api/admin/system/health" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-31T15:45:30.000Z",
    "systemInfo": {
      "platform": "darwin",
      "architecture": "x64",
      "nodeVersion": "v18.17.0",
      "environment": "production",
      "uptime": {
        "seconds": 86400,
        "formatted": "1d 0h 0m 0s"
      }
    },
    "memoryMetrics": {
      "rss": 45,
      "heapUsed": 23,
      "heapTotal": 35,
      "external": 12,
      "systemFree": 2048,
      "systemTotal": 8192
    },
    "cpuMetrics": {
      "user": 123456,
      "system": 78901,
      "loadAverage": [0.5, 0.7, 0.8],
      "cpuCount": 8
    },
    "healthChecks": {
      "database": {
        "status": "healthy",
        "responseTime": "< 10ms"
      },
      "memory": {
        "status": "healthy",
        "usage": "23MB / 35MB"
      },
      "uptime": {
        "status": "healthy",
        "value": "1d 0h 0m 0s"
      }
    }
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "User role patient is not authorized to access this route"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error fetching analytics data",
  "error": "Database connection failed"
}
```

---

## JavaScript Examples

### Fetch User Analytics
```javascript
const fetchUserAnalytics = async (period = 'month') => {
  try {
    const response = await fetch(`/api/admin/analytics/users?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('User Analytics:', data.data);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
};
```

### Fetch Admin Overview
```javascript
const fetchAdminOverview = async () => {
  try {
    const response = await fetch('/api/admin/overview', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    throw error;
  }
};
```

### Fetch Real-time Metrics
```javascript
const fetchRealtimeMetrics = async () => {
  try {
    const response = await fetch('/api/admin/metrics/realtime', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching real-time metrics:', error);
    throw error;
  }
};
```

### Fetch System Health
```javascript
const fetchSystemHealth = async () => {
  try {
    const response = await fetch('/api/admin/system/health', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching system health:', error);
    throw error;
  }
};
```

---

## React Component Examples

### Analytics Dashboard Component
```jsx
import React, { useState, useEffect } from 'react';

const AnalyticsDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewData, analyticsData, healthData] = await Promise.all([
          fetchAdminOverview(),
          fetchUserAnalytics('month'),
          fetchSystemHealth()
        ]);

        setOverview(overviewData);
        setUserAnalytics(analyticsData);
        setSystemHealth(healthData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="analytics-dashboard">
      <h1>Admin Dashboard</h1>
      
      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{overview?.quickStats?.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Patients</h3>
          <p>{overview?.quickStats?.totalPatients}</p>
        </div>
        <div className="stat-card">
          <h3>New Users Today</h3>
          <p>{overview?.quickStats?.newUsersToday}</p>
        </div>
      </div>

      {/* System Health */}
      <div className="system-health">
        <h2>System Health</h2>
        <div className={`health-status ${systemHealth?.status}`}>
          Status: {systemHealth?.status}
        </div>
        <p>Uptime: {systemHealth?.systemInfo?.uptime?.formatted}</p>
        <p>Memory: {systemHealth?.memoryMetrics?.heapUsed}MB / {systemHealth?.memoryMetrics?.heapTotal}MB</p>
      </div>

      {/* User Analytics */}
      <div className="user-analytics">
        <h2>User Analytics (This Month)</h2>
        <p>New Registrations: {userAnalytics?.newRegistrations?.total}</p>
        <p>Active Users: {userAnalytics?.overview?.activeUsers}</p>
        <p>Verification Rate: {userAnalytics?.activityMetrics?.verificationRate}%</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
```

---

## Use Cases

1. **Admin Dashboard**: Display comprehensive overview with key metrics
2. **User Analytics**: Track user growth and engagement patterns
3. **System Monitoring**: Monitor server health and performance
4. **Real-time Metrics**: Display live system activity and performance
5. **Capacity Planning**: Use analytics data for resource planning
6. **Performance Optimization**: Identify bottlenecks and optimization opportunities

---

## Security Notes

- ✅ Admin-only access enforced
- ✅ JWT token validation
- ✅ Rate limiting applied
- ✅ No sensitive system information exposed
- ✅ Audit logging for all operations

---

## Performance Considerations

- **Caching**: Consider caching analytics data for better performance
- **Aggregation**: Use MongoDB aggregation pipelines for complex queries
- **Real-time Updates**: Implement WebSocket connections for live metrics
- **Data Retention**: Implement data archiving for historical analytics

---

## Future Enhancements

1. **Appointment Analytics**: Implement when Appointment model is available
2. **Custom Date Ranges**: Allow custom date range selection
3. **Export Functionality**: Add CSV/PDF export for analytics data
4. **Alerts**: Implement system health alerts and notifications
5. **Historical Trends**: Add long-term trend analysis
6. **Comparative Analytics**: Add period-over-period comparisons

---

## Testing

### Test All Endpoints
```bash
# Test the analytics endpoints
node scripts/test-analytics-endpoints.js
```

### Manual Testing
```bash
# Get admin token first
curl -X POST http://localhost:8080/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@healthcare.com","password":"admin123","adminCode":"ADMIN2024!@#"}'

# Test each endpoint
curl -X GET "http://localhost:8080/api/admin/analytics/users?period=month" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

curl -X GET "http://localhost:8080/api/admin/overview" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

curl -X GET "http://localhost:8080/api/admin/metrics/realtime" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

curl -X GET "http://localhost:8080/api/admin/analytics/appointments?period=month" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

curl -X GET "http://localhost:8080/api/admin/system/health" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Related Files

- **Controller**: `controllers/adminAnalyticsController.js`
- **Routes**: `routes/adminAnalytics.js`
- **Test Script**: `scripts/test-analytics-endpoints.js`
- **Admin Profile API**: `docs/ADMIN_ME_API.md`
- **Patient Management**: `docs/ADMIN_VIEW_PATIENTS_API.md`

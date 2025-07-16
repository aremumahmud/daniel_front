# Doctor Queue Management Documentation

## Overview
This comprehensive documentation covers the queue management system specifically designed for doctors in the healthcare management platform. The system enables doctors to efficiently manage their patient queues, track consultations, and optimize their workflow through intelligent patient assignment and real-time updates.

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Doctor Queue Features](#doctor-queue-features)
3. [API Endpoints](#api-endpoints)
4. [Real-time Updates](#real-time-updates)
5. [Queue Operations](#queue-operations)
6. [Patient Management](#patient-management)
7. [Capacity Management](#capacity-management)
8. [Notifications & Alerts](#notifications--alerts)
9. [Integration Examples](#integration-examples)
10. [Best Practices](#best-practices)

---

## System Architecture

### Queue Management Flow for Doctors
```
Patient Registration → Queue Entry → Doctor Assignment → Consultation → Completion
        ↓                ↓              ↓                ↓             ↓
   Walk-in/Scheduled → Priority Queue → Auto/Manual → In Progress → Update Status
```

### Doctor Queue Dashboard Components
```
┌─────────────────────────────────────────────────────────────────┐
│                    Doctor Queue Dashboard                       │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   My Patients   │   Queue Status  │      Capacity Settings      │
│                 │                 │                             │
│ • Assigned (3)  │ • Waiting: 12   │ • Max Patients: 5          │
│ • In Progress   │ • In Consult: 8 │ • Current Load: 3/5        │
│ • Completed     │ • Completed: 25 │ • Status: Available        │
│                 │                 │ • Break: Not on break      │
├─────────────────┼─────────────────┼─────────────────────────────┤
│  Patient List   │  Quick Actions  │      Notifications          │
│                 │                 │                             │
│ 1. John Doe     │ • Start Consult │ • New patient assigned     │
│ 2. Jane Smith   │ • Complete      │ • Queue getting long       │
│ 3. Bob Johnson  │ • Take Break    │ • System maintenance       │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

### Doctor Workflow States
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   OFFLINE   │───▶│   ONLINE    │───▶│ AVAILABLE   │───▶│    BUSY     │
│             │    │             │    │             │    │             │
│ • Not ready │    │ • Logged in │    │ • Ready for │    │ • In consult│
│ • Away      │    │ • Preparing │    │   patients  │    │ • At capacity│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ▲                  ▲                  ▲                  │
       │                  │                  │                  │
       └──────────────────┴──────────────────┴──────────────────┘
                              ┌─────────────┐
                              │  ON BREAK   │
                              │             │
                              │ • Lunch     │
                              │ • Meeting   │
                              │ • Emergency │
                              └─────────────┘
```

---

## Doctor Queue Features

### Core Capabilities for Doctors

#### ✅ **Queue Visibility**
- **Real-time queue status** - See all patients in queue
- **Personal patient list** - View assigned patients
- **Queue analytics** - Wait times, patient flow
- **Priority indicators** - Emergency, high, medium, low
- **Patient information** - Basic details and reason for visit

#### ✅ **Patient Assignment**
- **Automatic assignment** - System assigns based on availability
- **Manual assignment** - Accept/decline specific patients
- **Load balancing** - Fair distribution among doctors
- **Specialty matching** - Patients matched to appropriate doctors
- **Capacity management** - Respect doctor limits

#### ✅ **Consultation Management**
- **Start consultation** - Begin patient interaction
- **Update status** - Track consultation progress
- **Complete consultation** - Finish and document
- **Add notes** - Clinical observations
- **Prescription management** - Digital prescribing

#### ✅ **Availability Control**
- **Online/Offline status** - Control availability
- **Break management** - Schedule breaks and lunch
- **Capacity settings** - Set maximum patients
- **Working hours** - Define availability windows
- **Emergency override** - Handle urgent cases

#### ✅ **Real-time Notifications**
- **New patient assignments** - Instant alerts
- **Queue status changes** - Updates on queue length
- **System messages** - Important announcements
- **Patient updates** - Status changes
- **Capacity warnings** - Overload alerts

### Doctor-Specific Queue Operations

#### 1. **View My Queue**
```javascript
// Get doctor's current patients
GET /api/queue/doctors/{doctorId}/current-patients

Response:
{
  "success": true,
  "data": {
    "patients": [
      {
        "queueId": "queue-123",
        "patient": {
          "id": "patient-456",
          "firstName": "John",
          "lastName": "Doe",
          "matricNumber": "STU123456",
          "age": 22
        },
        "status": "assigned",
        "priority": "medium",
        "reason": "Routine checkup",
        "symptoms": ["headache", "fatigue"],
        "queuedAt": "2024-01-15T10:30:00Z",
        "assignedAt": "2024-01-15T10:35:00Z",
        "estimatedDuration": 30,
        "position": 1
      }
    ],
    "count": 3,
    "capacity": {
      "current": 3,
      "maximum": 5,
      "percentage": 60
    }
  }
}
```

#### 2. **Update Patient Status**
```javascript
// Start consultation
PUT /api/queue/patient/{queueId}/status

Request:
{
  "status": "in-consultation",
  "notes": "Patient consultation started",
  "startTime": "2024-01-15T11:00:00Z"
}

Response:
{
  "success": true,
  "message": "Patient status updated successfully",
  "data": {
    "queueId": "queue-123",
    "status": "in-consultation",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

#### 3. **Complete Consultation**
```javascript
// Complete patient consultation
PUT /api/queue/patient/{queueId}/status

Request:
{
  "status": "completed",
  "notes": "Consultation completed. Prescribed medication.",
  "completedAt": "2024-01-15T11:30:00Z",
  "consultationSummary": {
    "diagnosis": "Common cold",
    "treatment": "Rest and fluids",
    "followUp": "Return if symptoms worsen",
    "prescriptions": [
      {
        "medication": "Paracetamol",
        "dosage": "500mg",
        "frequency": "Every 6 hours",
        "duration": "3 days"
      }
    ]
  }
}

Response:
{
  "success": true,
  "message": "Consultation completed successfully",
  "data": {
    "queueId": "queue-123",
    "status": "completed",
    "duration": 30,
    "completedAt": "2024-01-15T11:30:00Z"
  }
}
```

#### 4. **Manage Availability**
```javascript
// Update doctor status
PUT /api/queue/doctors/{doctorId}/status

Request:
{
  "isOnline": true,
  "isAvailable": true,
  "status": "available", // available, busy, on-break, offline
  "breakType": null, // lunch, meeting, emergency
  "breakDuration": null,
  "notes": "Ready for patients"
}

Response:
{
  "success": true,
  "message": "Doctor status updated successfully",
  "data": {
    "doctorId": "doctor-789",
    "isOnline": true,
    "isAvailable": true,
    "status": "available",
    "currentPatients": 2,
    "maxPatients": 5,
    "lastActivity": "2024-01-15T11:35:00Z"
  }
}
```

---

## API Endpoints

### Doctor Queue Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/queue/status` | Get overall queue status | Doctor |
| `GET` | `/api/queue/doctors/{doctorId}/current-patients` | Get doctor's assigned patients | Doctor |
| `PUT` | `/api/queue/patient/{queueId}/status` | Update patient status | Doctor |
| `PUT` | `/api/queue/doctors/{doctorId}/status` | Update doctor availability | Doctor |
| `GET` | `/api/queue/doctors/capacities` | Get all doctor capacities | Doctor |
| `POST` | `/api/queue/assign-patient` | Manually assign patient | Doctor |
| `DELETE` | `/api/queue/patient/{queueId}` | Remove patient from queue | Doctor |

### Doctor Status Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/doctor/status` | Get current doctor status | Doctor |
| `PUT` | `/api/doctor/status` | Update online/offline status | Doctor |
| `POST` | `/api/doctor/break` | Set break status | Doctor |
| `PUT` | `/api/doctor/capacity` | Update capacity settings | Doctor |

### Queue Notifications

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/api/notifications/queue` | Get queue notifications | Doctor |
| `PUT` | `/api/notifications/{id}/read` | Mark notification as read | Doctor |
| `POST` | `/api/notifications/preferences` | Update notification settings | Doctor |

---

## Real-time Updates

### WebSocket Integration for Doctors

#### Connection Setup
```javascript
// Connect to WebSocket for real-time updates
const socket = io('/queue', {
  auth: {
    token: doctorJwtToken
  }
});

// Join doctor-specific room
socket.emit('join_doctor_queue', {
  doctorId: 'doctor-789'
});
```

#### Real-time Events for Doctors

#### 1. **New Patient Assignment**
```javascript
socket.on('patient_assigned', (data) => {
  console.log('New patient assigned:', data);
  /*
  {
    "queueId": "queue-123",
    "patient": {
      "id": "patient-456",
      "name": "John Doe",
      "reason": "Routine checkup"
    },
    "priority": "medium",
    "assignedAt": "2024-01-15T10:35:00Z"
  }
  */
  
  // Update UI to show new patient
  updatePatientList(data);
  showNotification(`New patient assigned: ${data.patient.name}`);
});
```

#### 2. **Queue Status Updates**
```javascript
socket.on('queue_status_update', (data) => {
  console.log('Queue status updated:', data);
  /*
  {
    "totalWaiting": 15,
    "totalInConsultation": 8,
    "averageWaitTime": 25,
    "doctorLoad": {
      "current": 3,
      "maximum": 5
    }
  }
  */
  
  // Update dashboard statistics
  updateQueueStats(data);
});
```

#### 3. **Patient Status Changes**
```javascript
socket.on('patient_status_changed', (data) => {
  console.log('Patient status changed:', data);
  /*
  {
    "queueId": "queue-123",
    "patientId": "patient-456",
    "oldStatus": "waiting",
    "newStatus": "assigned",
    "updatedBy": "system",
    "timestamp": "2024-01-15T10:35:00Z"
  }
  */
  
  // Update patient status in UI
  updatePatientStatus(data.queueId, data.newStatus);
});
```

#### 4. **System Notifications**
```javascript
socket.on('system_notification', (data) => {
  console.log('System notification:', data);
  /*
  {
    "type": "warning",
    "title": "Queue Getting Long",
    "message": "Current wait time is 45 minutes",
    "priority": "medium",
    "timestamp": "2024-01-15T10:40:00Z"
  }
  */
  
  // Show system notification
  showSystemNotification(data);
});
```

#### 5. **Capacity Warnings**
```javascript
socket.on('capacity_warning', (data) => {
  console.log('Capacity warning:', data);
  /*
  {
    "doctorId": "doctor-789",
    "currentLoad": 5,
    "maxCapacity": 5,
    "warningType": "at_capacity",
    "message": "You are at maximum capacity"
  }
  */
  
  // Show capacity warning
  showCapacityWarning(data);
});
```

---

## Queue Operations

### Doctor Queue Workflow

#### 1. **Starting Your Shift**
```javascript
// Step 1: Set doctor online
const setOnline = async () => {
  try {
    const response = await fetch('/api/doctor/status', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isOnline: true,
        isAvailable: true
      })
    });

    const result = await response.json();
    console.log('Doctor is now online:', result);
  } catch (error) {
    console.error('Error setting online status:', error);
  }
};

// Step 2: Check current queue
const checkQueue = async () => {
  try {
    const response = await fetch(`/api/queue/doctors/${doctorId}/current-patients`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    console.log('Current patients:', result.data.patients);
    return result.data.patients;
  } catch (error) {
    console.error('Error checking queue:', error);
  }
};
```

#### 2. **Managing Patient Flow**
```javascript
// Accept next patient
const acceptNextPatient = async () => {
  try {
    // Get queue status first
    const queueResponse = await fetch('/api/queue/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const queueData = await queueResponse.json();

    // Find next waiting patient
    const nextPatient = queueData.data.queue.find(p => p.status === 'waiting');

    if (nextPatient) {
      // Assign patient to doctor
      const assignResponse = await fetch('/api/queue/assign-patient', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          queueId: nextPatient._id,
          doctorId: doctorId
        })
      });

      const result = await assignResponse.json();
      console.log('Patient assigned:', result);
      return result;
    }
  } catch (error) {
    console.error('Error accepting patient:', error);
  }
};

// Start consultation
const startConsultation = async (queueId) => {
  try {
    const response = await fetch(`/api/queue/patient/${queueId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'in-consultation',
        notes: 'Consultation started',
        startTime: new Date().toISOString()
      })
    });

    const result = await response.json();
    console.log('Consultation started:', result);
    return result;
  } catch (error) {
    console.error('Error starting consultation:', error);
  }
};

// Complete consultation
const completeConsultation = async (queueId, consultationData) => {
  try {
    const response = await fetch(`/api/queue/patient/${queueId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'completed',
        notes: consultationData.notes,
        completedAt: new Date().toISOString(),
        consultationSummary: consultationData.summary
      })
    });

    const result = await response.json();
    console.log('Consultation completed:', result);
    return result;
  } catch (error) {
    console.error('Error completing consultation:', error);
  }
};
```

#### 3. **Break Management**
```javascript
// Take a break
const takeBreak = async (breakType, duration) => {
  try {
    const response = await fetch('/api/doctor/break', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isOnBreak: true,
        breakType: breakType, // 'lunch', 'meeting', 'emergency'
        duration: duration // in minutes
      })
    });

    const result = await response.json();
    console.log('Break started:', result);
    return result;
  } catch (error) {
    console.error('Error taking break:', error);
  }
};

// Return from break
const returnFromBreak = async () => {
  try {
    const response = await fetch('/api/doctor/break', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isOnBreak: false
      })
    });

    const result = await response.json();
    console.log('Returned from break:', result);
    return result;
  } catch (error) {
    console.error('Error returning from break:', error);
  }
};
```

---

## Patient Management

### Patient Information Display

#### Patient Queue Card Component
```javascript
const PatientQueueCard = ({ patient, onStartConsultation, onCompleteConsultation }) => {
  const {
    queueId,
    patient: patientInfo,
    status,
    priority,
    reason,
    symptoms,
    queuedAt,
    estimatedDuration,
    waitTime
  } = patient;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'emergency': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting': return '⏳';
      case 'assigned': return '👨‍⚕️';
      case 'in-consultation': return '🩺';
      case 'completed': return '✅';
      default: return '❓';
    }
  };

  return (
    <div className={`patient-card priority-${priority} status-${status}`}>
      <div className="patient-header">
        <div className="patient-info">
          <h3>{patientInfo.firstName} {patientInfo.lastName}</h3>
          <p className="matric-number">{patientInfo.matricNumber}</p>
          <p className="age">Age: {patientInfo.age}</p>
        </div>
        <div className="status-info">
          <span className="status-icon">{getStatusIcon(status)}</span>
          <span className="priority-badge" style={{backgroundColor: getPriorityColor(priority)}}>
            {priority.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="patient-details">
        <div className="reason">
          <strong>Reason:</strong> {reason}
        </div>
        {symptoms && symptoms.length > 0 && (
          <div className="symptoms">
            <strong>Symptoms:</strong> {symptoms.join(', ')}
          </div>
        )}
        <div className="timing">
          <span>Queued: {new Date(queuedAt).toLocaleTimeString()}</span>
          <span>Wait Time: {waitTime} minutes</span>
          <span>Est. Duration: {estimatedDuration} minutes</span>
        </div>
      </div>

      <div className="patient-actions">
        {status === 'assigned' && (
          <button
            className="btn btn-primary"
            onClick={() => onStartConsultation(queueId)}
          >
            Start Consultation
          </button>
        )}
        {status === 'in-consultation' && (
          <button
            className="btn btn-success"
            onClick={() => onCompleteConsultation(queueId)}
          >
            Complete Consultation
          </button>
        )}
      </div>
    </div>
  );
};
```

#### Quick Actions for Doctors
```javascript
const DoctorQuickActions = ({ doctorId, onStatusChange }) => {
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [capacity, setCapacity] = useState(null);

  const quickActions = [
    {
      id: 'accept-next',
      label: 'Accept Next Patient',
      icon: '👤',
      action: acceptNextPatient,
      color: 'primary'
    },
    {
      id: 'take-break',
      label: isOnBreak ? 'Return from Break' : 'Take Break',
      icon: isOnBreak ? '🔄' : '☕',
      action: () => isOnBreak ? returnFromBreak() : takeBreak('break', 15),
      color: isOnBreak ? 'success' : 'warning'
    },
    {
      id: 'go-offline',
      label: 'Go Offline',
      icon: '🔴',
      action: () => setOnline(false),
      color: 'danger'
    },
    {
      id: 'view-queue',
      label: 'View Full Queue',
      icon: '📋',
      action: () => window.open('/queue/full-view', '_blank'),
      color: 'info'
    }
  ];

  return (
    <div className="quick-actions-panel">
      <h3>Quick Actions</h3>
      <div className="actions-grid">
        {quickActions.map(action => (
          <button
            key={action.id}
            className={`btn btn-${action.color} quick-action-btn`}
            onClick={action.action}
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

---

## Capacity Management

### Doctor Capacity Settings

#### Update Capacity Configuration
```javascript
// Update doctor capacity settings
const updateCapacity = async (capacitySettings) => {
  try {
    const response = await fetch('/api/doctor/capacity', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        maxPatients: capacitySettings.maxPatients,
        averageConsultationTime: capacitySettings.avgConsultationTime,
        workingHours: {
          start: capacitySettings.startTime,
          end: capacitySettings.endTime
        },
        specializations: capacitySettings.specializations,
        preferredPatientTypes: capacitySettings.patientTypes
      })
    });

    const result = await response.json();
    console.log('Capacity updated:', result);
    return result;
  } catch (error) {
    console.error('Error updating capacity:', error);
  }
};

// Example capacity settings
const exampleCapacitySettings = {
  maxPatients: 8,
  avgConsultationTime: 20, // minutes
  startTime: "08:00",
  endTime: "17:00",
  specializations: ["general", "cardiology"],
  patientTypes: ["student", "staff"]
};
```

#### Capacity Monitoring Dashboard
```javascript
const CapacityDashboard = ({ doctorId }) => {
  const [capacity, setCapacity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCapacity = async () => {
      try {
        const response = await fetch(`/api/queue/doctors/capacities`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        // Find current doctor's capacity
        const doctorCapacity = result.data.capacities.find(
          cap => cap.doctorId === doctorId
        );
        setCapacity(doctorCapacity);
      } catch (error) {
        console.error('Error fetching capacity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCapacity();

    // Set up real-time updates
    const interval = setInterval(fetchCapacity, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [doctorId]);

  if (loading) return <div>Loading capacity data...</div>;
  if (!capacity) return <div>No capacity data available</div>;

  const utilizationPercentage = (capacity.currentPatients / capacity.maxPatients) * 100;

  return (
    <div className="capacity-dashboard">
      <h3>Capacity Status</h3>

      <div className="capacity-overview">
        <div className="capacity-meter">
          <div className="meter-bar">
            <div
              className="meter-fill"
              style={{
                width: `${utilizationPercentage}%`,
                backgroundColor: utilizationPercentage > 80 ? 'red' :
                                utilizationPercentage > 60 ? 'orange' : 'green'
              }}
            />
          </div>
          <div className="meter-text">
            {capacity.currentPatients} / {capacity.maxPatients} patients
          </div>
        </div>

        <div className="capacity-stats">
          <div className="stat">
            <label>Utilization:</label>
            <span>{utilizationPercentage.toFixed(1)}%</span>
          </div>
          <div className="stat">
            <label>Status:</label>
            <span className={`status-${capacity.availabilityStatus}`}>
              {capacity.availabilityStatus}
            </span>
          </div>
          <div className="stat">
            <label>Avg Consultation:</label>
            <span>{capacity.averageConsultationTime} min</span>
          </div>
          <div className="stat">
            <label>Working Hours:</label>
            <span>{capacity.workingHours.start} - {capacity.workingHours.end}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## Notifications & Alerts

### Notification System for Doctors

#### Notification Types
```javascript
const NotificationTypes = {
  PATIENT_ASSIGNED: 'patient_assigned',
  QUEUE_UPDATE: 'queue_update',
  CAPACITY_WARNING: 'capacity_warning',
  SYSTEM_MESSAGE: 'system_message',
  BREAK_REMINDER: 'break_reminder',
  SHIFT_END: 'shift_end'
};

const NotificationPriorities = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};
```

#### Notification Management
```javascript
const NotificationManager = {
  // Get notifications for doctor
  getNotifications: async (doctorId) => {
    try {
      const response = await fetch('/api/notifications/queue', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  // Update notification preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }
};

// Example notification preferences
const notificationPreferences = {
  patientAssigned: {
    enabled: true,
    sound: true,
    popup: true,
    email: false
  },
  queueUpdates: {
    enabled: true,
    sound: false,
    popup: true,
    email: false
  },
  capacityWarnings: {
    enabled: true,
    sound: true,
    popup: true,
    email: true
  },
  systemMessages: {
    enabled: true,
    sound: true,
    popup: true,
    email: true
  }
};
```

#### Notification Component
```javascript
const NotificationCenter = ({ doctorId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      const result = await NotificationManager.getNotifications(doctorId);
      if (result.success) {
        setNotifications(result.data.notifications);
        setUnreadCount(result.data.unreadCount);
      }
    };

    fetchNotifications();

    // Set up real-time notification updates
    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show notification popup
      showNotificationPopup(notification);

      // Play sound if enabled
      if (notification.sound) {
        playNotificationSound(notification.priority);
      }
    });

    return () => {
      socket.off('new_notification');
    };
  }, [doctorId]);

  const handleMarkAsRead = async (notificationId) => {
    await NotificationManager.markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="notification-center">
      <button
        className="notification-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'} priority-${notification.priority}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## Integration Examples

### Complete Doctor Queue Dashboard

#### Main Dashboard Component
```javascript
const DoctorQueueDashboard = ({ doctorId }) => {
  const [patients, setPatients] = useState([]);
  const [queueStatus, setQueueStatus] = useState(null);
  const [doctorStatus, setDoctorStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize dashboard
    const initializeDashboard = async () => {
      try {
        // Fetch current patients
        const patientsResponse = await fetch(`/api/queue/doctors/${doctorId}/current-patients`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const patientsData = await patientsResponse.json();
        setPatients(patientsData.data.patients);

        // Fetch queue status
        const queueResponse = await fetch('/api/queue/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const queueData = await queueResponse.json();
        setQueueStatus(queueData.data);

        // Fetch doctor status
        const statusResponse = await fetch('/api/doctor/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const statusData = await statusResponse.json();
        setDoctorStatus(statusData.data);

      } catch (error) {
        console.error('Error initializing dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();

    // Set up real-time updates
    socket.on('patient_assigned', (data) => {
      setPatients(prev => [...prev, data]);
    });

    socket.on('patient_status_changed', (data) => {
      setPatients(prev =>
        prev.map(p => p.queueId === data.queueId ? { ...p, status: data.newStatus } : p)
      );
    });

    socket.on('queue_status_update', (data) => {
      setQueueStatus(data);
    });

    return () => {
      socket.off('patient_assigned');
      socket.off('patient_status_changed');
      socket.off('queue_status_update');
    };
  }, [doctorId]);

  const handleStartConsultation = async (queueId) => {
    try {
      await startConsultation(queueId);
      setPatients(prev =>
        prev.map(p => p.queueId === queueId ? { ...p, status: 'in-consultation' } : p)
      );
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  const handleCompleteConsultation = async (queueId) => {
    try {
      await completeConsultation(queueId, {
        notes: 'Consultation completed',
        summary: { diagnosis: '', treatment: '', followUp: '' }
      });
      setPatients(prev => prev.filter(p => p.queueId !== queueId));
    } catch (error) {
      console.error('Error completing consultation:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  return (
    <div className="doctor-queue-dashboard">
      <div className="dashboard-header">
        <h1>Queue Management Dashboard</h1>
        <div className="doctor-status">
          <span className={`status-indicator ${doctorStatus?.isOnline ? 'online' : 'offline'}`}>
            {doctorStatus?.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Queue Statistics */}
        <div className="dashboard-card queue-stats">
          <h3>Queue Statistics</h3>
          <div className="stats-grid">
            <div className="stat">
              <label>Total Waiting:</label>
              <span>{queueStatus?.totalWaiting || 0}</span>
            </div>
            <div className="stat">
              <label>In Consultation:</label>
              <span>{queueStatus?.totalInConsultation || 0}</span>
            </div>
            <div className="stat">
              <label>Avg Wait Time:</label>
              <span>{queueStatus?.averageWaitTime || 0} min</span>
            </div>
          </div>
        </div>

        {/* My Patients */}
        <div className="dashboard-card my-patients">
          <h3>My Patients ({patients.length})</h3>
          <div className="patient-list">
            {patients.length === 0 ? (
              <div className="no-patients">No patients assigned</div>
            ) : (
              patients.map(patient => (
                <PatientQueueCard
                  key={patient.queueId}
                  patient={patient}
                  onStartConsultation={handleStartConsultation}
                  onCompleteConsultation={handleCompleteConsultation}
                />
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <DoctorQuickActions
            doctorId={doctorId}
            onStatusChange={(status) => setDoctorStatus(status)}
          />
        </div>

        {/* Capacity Management */}
        <div className="dashboard-card capacity">
          <CapacityDashboard doctorId={doctorId} />
        </div>

        {/* Notifications */}
        <div className="dashboard-card notifications">
          <NotificationCenter doctorId={doctorId} />
        </div>
      </div>
    </div>
  );
};
```

---

## Best Practices

### Queue Management Best Practices for Doctors

#### 1. **Efficient Patient Flow**
- **Start your shift early**: Set yourself online 10-15 minutes before your scheduled time
- **Check queue regularly**: Monitor waiting patients and estimated wait times
- **Manage expectations**: Communicate realistic wait times to patients
- **Use quick actions**: Utilize shortcuts for common operations
- **Update status promptly**: Keep your availability status current

#### 2. **Capacity Management**
- **Set realistic limits**: Don't overcommit on patient capacity
- **Monitor utilization**: Keep track of your patient load throughout the day
- **Take scheduled breaks**: Use the break management system properly
- **Adjust as needed**: Update capacity settings based on patient complexity
- **Plan for emergencies**: Reserve capacity for urgent cases

#### 3. **Communication**
- **Use consultation notes**: Document important information for continuity
- **Update patient status**: Keep status current for accurate queue management
- **Notify of delays**: Inform system of any delays or issues
- **Coordinate with staff**: Communicate with nurses and admin staff
- **Follow up appropriately**: Schedule follow-ups when necessary

#### 4. **Technology Usage**
- **Enable notifications**: Stay informed of new assignments and updates
- **Use real-time features**: Leverage WebSocket updates for immediate information
- **Keep devices charged**: Ensure your devices are ready for the full shift
- **Report issues**: Notify IT of any technical problems immediately
- **Stay updated**: Keep up with system updates and new features

#### 5. **Patient Care Quality**
- **Review patient information**: Check reason for visit and symptoms before consultation
- **Prioritize appropriately**: Handle emergency cases first
- **Document thoroughly**: Complete consultation notes and prescriptions
- **Ensure privacy**: Maintain patient confidentiality in queue management
- **Follow protocols**: Adhere to medical and administrative procedures

### Performance Optimization Tips

#### 1. **Dashboard Performance**
```javascript
// Use React.memo for patient cards to prevent unnecessary re-renders
const PatientQueueCard = React.memo(({ patient, onStartConsultation, onCompleteConsultation }) => {
  // Component implementation
});

// Implement virtual scrolling for large patient lists
const VirtualizedPatientList = ({ patients }) => {
  return (
    <FixedSizeList
      height={400}
      itemCount={patients.length}
      itemSize={120}
      itemData={patients}
    >
      {PatientQueueCard}
    </FixedSizeList>
  );
};
```

#### 2. **API Optimization**
```javascript
// Implement request debouncing for status updates
const debouncedStatusUpdate = debounce(updateDoctorStatus, 1000);

// Use batch operations for multiple updates
const batchUpdatePatients = async (updates) => {
  try {
    const response = await fetch('/api/queue/batch-update', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ updates })
    });
    return await response.json();
  } catch (error) {
    console.error('Batch update failed:', error);
  }
};
```

#### 3. **Error Handling**
```javascript
// Implement retry logic for failed requests
const retryRequest = async (requestFn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Use error boundaries for graceful error handling
class QueueErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Queue dashboard error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong with the queue dashboard.</h2>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Conclusion

This comprehensive doctor queue management documentation provides:

### ✅ **Key Features Covered**
- **Real-time queue visibility** with patient information and status
- **Intelligent patient assignment** with capacity management
- **Consultation workflow management** from start to completion
- **Break and availability management** for work-life balance
- **Notification system** for important updates and alerts
- **Capacity monitoring** and optimization tools

### ✅ **Benefits for Doctors**
- **Improved efficiency** through streamlined patient management
- **Better patient care** with organized queue and information access
- **Reduced stress** through predictable workflow and capacity control
- **Enhanced communication** with real-time updates and notifications
- **Professional autonomy** with self-managed availability and breaks

### ✅ **Technical Implementation**
- **RESTful API endpoints** for all queue operations
- **WebSocket integration** for real-time updates
- **React components** for modern UI implementation
- **Error handling** and performance optimization
- **Best practices** for maintainable and scalable code

This system empowers doctors to efficiently manage their patient queues while maintaining high-quality care and professional workflow standards.

# P2P Venice Team Registration System

A full-stack web application for managing team registrations for the P2P Venice event.

## Features

- **Team Registration**: Teams can register with primary driver details and emergency contacts
- **GDPR Compliance**: Mandatory GDPR consent before registration
- **Passenger Details**: Editable passenger information including drivers, accommodation, and dietary requirements
- **Admin Dashboard**: 
  - View all applications and their status
  - Approve/reject applications
  - Mark teams as paid
  - Add ferry booking references
  - Send email/SMS notifications to teams
  - Export reports to CSV
- **Waiting List**: Automatic waiting list when 40 team limit is reached
- **Notifications**: Email and SMS capabilities for confirmations and updates
- **Reporting**: Comprehensive reporting with export functionality

## Tech Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Email**: Nodemailer
- **SMS**: Twilio (optional)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Navigate to the project directory:
```bash
cd "d:\CSSS Business\CSSS-Work\P2P Venice\p2p-app"
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

4. Create environment file:
```bash
copy .env.example .env
```

5. Edit `.env` file with your configuration:
```
PORT=5000
JWT_SECRET=your_jwt_secret_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Running the Application

#### Development Mode (Both frontend and backend)
```bash
npm run dev
```

#### Production Mode
1. Build the React app:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Default Admin Credentials

- **Username**: admin
- **Password**: admin123

## Usage

### For Participants

1. Navigate to the registration page
2. Fill in team details (team name, primary driver info, emergency contacts)
3. Accept GDPR consent
4. Submit application
5. If approved, complete passenger details (additional drivers, accommodation, dietary requirements)

### For Admins

1. Login to admin dashboard using credentials
2. View overview statistics
3. Manage team applications:
   - Approve/reject applications
   - Mark as paid
   - Add ferry booking references
4. Send notifications (email/SMS) to teams
5. Export reports to CSV

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create new team
- `PUT /api/teams/:id` - Update team details
- `PUT /api/teams/:id/status` - Update team status
- `DELETE /api/teams/:id` - Delete team

### Passengers
- `GET /api/passengers` - Get all passengers
- `GET /api/passengers/team/:teamId` - Get passengers by team ID
- `POST /api/passengers` - Create passenger details
- `PUT /api/passengers/:id` - Update passenger details
- `DELETE /api/passengers/:id` - Delete passenger details

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/teams-full` - Get all teams with passenger details
- `GET /api/admin/report` - Get full report data
- `PUT /api/admin/teams/bulk-status` - Bulk update team statuses

### Notifications
- `POST /api/notifications/email` - Send email
- `POST /api/notifications/sms` - Send SMS
- `POST /api/notifications/confirmation/application` - Send application confirmation
- `POST /api/notifications/confirmation/approval` - Send approval confirmation
- `GET /api/notifications/history/:teamId` - Get notification history

## Database Schema

### Teams Table
- id, team_name, primary_driver_name, primary_driver_email, primary_driver_phone
- emergency_contact_name, emergency_contact_details
- status (pending, approved, rejected, waiting_list)
- approved_paid, ferry_booking_reference, gdpr_consent
- created_at, updated_at

### Passengers Table
- id, team_id, team_name, primary_driver_name
- driver_2_name, driver_3_name, driver_4_name
- rooms_required, room_type
- driver_1_dietary, driver_2_dietary, driver_3_dietary, driver_4_dietary
- created_at, updated_at

### Users Table (Admin)
- id, username, password, role, created_at

### Notifications Table
- id, team_id, type (email/sms), recipient, status, message, created_at

## Team Limit

The system is configured to accept a maximum of 40 teams. When this limit is reached, new applications are automatically added to a waiting list.

## Email Configuration

For email notifications to work, configure your SMTP settings in the `.env` file. For Gmail, you may need to:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in the EMAIL_PASS field

## SMS Configuration

SMS notifications use Twilio. To enable:
1. Create a Twilio account
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Add credentials to `.env` file

## License

This project is proprietary and confidential.

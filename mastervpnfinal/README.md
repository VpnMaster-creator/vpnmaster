# MasterVPN

A comprehensive VPN client application with a modern, user-friendly interface for secure and efficient internet connectivity.

![MasterVPN](screenshots/dashboard.png)

## Features

- **Real VPN Tunneling**: Actual IP masking functionality using VPN proxy technique
- **Global Server Selection**: Connect to servers across multiple countries
- **Connection Statistics**: Real-time monitoring of download/upload speeds and data usage
- **IP Protection Test**: Verify your IP is properly masked when using the VPN
- **User Authentication**: Secure login system with PostgreSQL database storage
- **Admin Dashboard**: Manage users, servers and view system statistics
- **Connection History**: Track your VPN usage over time

## Technology Stack

- **Frontend**: React with TypeScript
- **UI Framework**: TailwindCSS with Shadcn component library
- **Database**: PostgreSQL with Drizzle ORM
- **Backend**: Express.js with WebSockets for real-time metrics
- **Authentication**: Passport.js with session-based auth
- **VPN Technology**: HTTP proxy with WebSockets for tunneling

## Installation

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL database
- npm or yarn package manager

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mastervpn.git
   cd mastervpn
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database Connection
   DATABASE_URL=postgresql://user:password@localhost:5432/mastervpn
   
   # Session Secret
   SESSION_SECRET=your_secret_key_here
   
   # Admin Account (Optional - for first run)
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   ADMIN_EMAIL=admin@example.com
   ```

4. Initialize the database:
   ```
   npm run db:push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Usage

### User Registration & Login

1. Access the application at `http://localhost:5000`
2. Navigate to the Authentication page
3. Create a new account or log in with your credentials

### Connecting to VPN

1. After logging in, you'll be directed to the dashboard
2. Select a server from the available list
3. Click "Connect" to establish a VPN connection
4. Once connected, your internet traffic will be routed through the selected VPN server
5. You can verify the connection using the "VPN Test" panel

### Testing VPN Protection

1. Ensure you're connected to a VPN server
2. On the dashboard, navigate to the "VPN Test" panel
3. Click "Run Test" to check your IP protection status
4. The test will show your original IP and your masked VPN IP

### Disconnecting

1. To disconnect, click the "Disconnect" button on the dashboard
2. Your connection statistics will be saved to your history

## Setting Up Your Own VPN Servers

MasterVPN supports connecting to custom VPN servers. See the [VPN_SERVER_SETUP.md](VPN_SERVER_SETUP.md) guide for detailed instructions on setting up your own VPN servers to work with this application.

## Development

### Project Structure

```
mastervpn/
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   ├── pages/      # Page components
│   │   └── App.tsx     # Main application component
├── server/             # Backend Express application
│   ├── auth.ts         # Authentication logic
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Database operations
│   └── vpn-proxy.ts    # VPN proxy implementation
├── shared/             # Shared types and schemas
│   └── schema.ts       # Database schema and types
└── README.md           # Project documentation
```

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Run production build
- `npm run db:push`: Push schema changes to database

## Security Considerations

- All passwords are securely hashed using scrypt
- Session data is stored in the database
- HTTPS is recommended for production deployment
- VPN connections are established over secure WebSockets

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenVPN](https://openvpn.net/) and [WireGuard](https://www.wireguard.com/) for VPN technologies
- [ShadcnUI](https://ui.shadcn.com/) for the component library
- [Drizzle ORM](https://orm.drizzle.team/) for database operations
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for frontend tooling
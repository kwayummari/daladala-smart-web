# Daladala Smart Web Application

A modern, user-friendly web application for booking, tracking, and managing public transportation (daladala) in Tanzania. Inspired by ride-hailing apps like Bolt but specialized for public transportation.

![Daladala Smart Screenshot](https://placeholder.pics/svg/1200x630/FF6B00-1E3A8A/FFFFFF/Daladala%20Smart%20Web%20App)

## 🚀 Features

- **Route Discovery**: Search and explore daladala routes across the city
- **Trip Booking**: Book trips in advance with a streamlined booking process
- **Real-time Tracking**: Track daladala locations in real-time
- **Payment Integration**: Multiple payment options including mobile money
- **User Accounts**: Register, login, and manage your profile
- **Booking Management**: View and manage your booking history
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## 💻 Tech Stack

- **Frontend Framework**: React.js with Vite for fast development
- **UI Components**: Bootstrap, React-Bootstrap, Material UI components
- **Routing**: React Router for navigation
- **State Management**: React Context API
- **HTTP Client**: Axios for API communication
- **Maps Integration**: Leaflet for interactive maps
- **Form Handling**: React Hook Form with validation
- **Date Handling**: Mantine Date Picker with Day.js
- **Styling**: SCSS with variables for consistent theming

## 📝 Project Structure

```
daladala-smart-web/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Reusable React components
│   │   ├── common/         # Shared components (buttons, cards, etc.)
│   │   ├── home/           # Home page specific components
│   │   ├── routes/         # Route related components
│   │   ├── booking/        # Booking flow components
│   │   └── user/           # User account components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── services/           # API service functions
│   ├── styles/             # Global styles and variables
│   ├── utils/              # Utility functions
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── .env.example            # Example environment variables
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite configuration
```

## 🛠️ Setup and Installation

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Backend API (Daladala Smart API) running

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/daladala-smart-web.git
   cd daladala-smart-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` to set your API URL:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   The application will be available at [http://localhost:5173](http://localhost:5173)

## 🚀 Building for Production

```bash
npm run build
# or
yarn build
```

This will generate optimized static files in the `dist` directory that can be deployed to any web server.

## 🔄 API Integration

This web application integrates with the Daladala Smart backend API. The backend provides:

- User authentication
- Route and stop information
- Trip scheduling
- Booking management
- Payment processing
- Real-time vehicle tracking

### API Endpoints Structure

```
/api/auth      # Authentication endpoints
/api/users     # User management
/api/routes    # Routes and stops
/api/vehicles  # Vehicle information
/api/trips     # Trip schedules
/api/bookings  # Booking management
/api/payments  # Payment processing
```

## 👥 User Roles

The system supports multiple user roles:

1. **Passenger** - Regular users who can book trips
2. **Driver** - Daladala drivers who have a separate view
3. **Admin** - System administrators who manage routes, vehicles, etc.

## 🌟 Key Features in Detail

### Home Page

- Hero section with quick search
- Popular routes display
- Quick access to common destinations
- How it works explanation
- Mobile app promotion

### Route Exploration

- List of all routes with filtering options
- Search by start/end points
- Detailed route information
- Interactive maps showing route paths
- Stop information and timetables

### Booking System

- Multi-step booking process
- Trip selection by date and time
- Fare calculation
- Multiple payment options
- Booking confirmation and tickets

### User Account

- Personal profile management
- Booking history
- Payment history
- Notification management
- Account settings

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any questions or support, please contact:
- Email: support@daladasmart.co.tz
- Phone: +255 755 123 456

## 🙏 Acknowledgments

- Bootstrap and Material UI for UI components
- React Router for navigation
- Leaflet for maps integration
- All the open-source libraries used in this project
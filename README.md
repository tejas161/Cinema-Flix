# 🎬 Cinema Flix

**Cinema Flix** is a modern, full-stack movie discovery and ticket booking platform built with React and Go. Users can browse movies with advanced search and filtering, view detailed movie information, and book tickets with Google OAuth authentication.

---

## 🌟 Features

### 🎭 **Movie Discovery**
- **Advanced Search**: Search movies by title, director, cast, or genre
- **Smart Filtering**: Filter by genre, category (Now Playing, Coming Soon, Trending)
- **Multiple Views**: Switch between grid and list layouts
- **Real-time Results**: Instant search and filter updates

### 🎬 **Movie Details**
- **IMDB-style Pages**: Comprehensive movie information with ratings, cast, and plot
- **Rich Media**: High-quality posters, backdrops, and trailer integration
- **Cast & Crew**: Detailed actor information with photos and character names
- **Box Office Data**: Budget, earnings, and production information
- **Show Times**: Available screening times with booking integration

### 🔐 **Authentication**
- **Google OAuth 2.0**: Secure login with Google accounts
- **User Profiles**: Personalized user experience with profile management
- **Session Management**: Persistent login state with secure logout
- **Professional Logging**: Comprehensive authentication activity tracking

### 🎫 **Ticket Booking**
- **Show Time Selection**: Choose from available screening times
- **Booking Interface**: Intuitive ticket reservation system
- **User Management**: Track bookings with authenticated users

### 📱 **Responsive Design**
- **Mobile-First**: Optimized for all screen sizes
- **Material Design**: Clean, modern UI with Material-UI components
- **Dark Theme**: Professional cinema-themed interface
- **Accessibility**: ARIA labels and keyboard navigation support

---

## 🛠️ Tech Stack

### **Frontend**
- **[React 19](https://reactjs.org/)** - Modern React with latest features
- **[Material-UI (MUI)](https://mui.com/)** - Comprehensive component library
- **[React Router](https://reactrouter.com/)** - Client-side routing
- **JavaScript ES6+** - Modern JavaScript features

### **Backend**
- **[Go (Golang)](https://golang.org/)** - High-performance backend server
- **[Fiber](https://gofiber.io/)** - Express-inspired web framework
- **[Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)** - Secure authentication
- **Environment Variables** - Secure configuration management

### **Development Tools**
- **Professional Logging** - Comprehensive request/response tracking
- **CORS Support** - Cross-origin resource sharing
- **Hot Reload** - Development server with auto-refresh
- **Linting & Formatting** - Code quality tools

---

## 🚀 Quick Start

### **Prerequisites**
- **Node.js** (v16 or higher)
- **Go** (v1.19 or higher)
- **Google Cloud Console** account for OAuth setup

### **1. Clone the Repository**
```bash
git clone <your-repo-url>
cd Cinema_Flix
```

### **2. Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:8080/auth/google/callback`

### **3. Backend Setup**
```bash
cd server

# Create environment file
cat > .env << EOF
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
redirectURL=http://localhost:8080
PORT=8080
CLIENT_URL=http://localhost:3000
EOF

# Install dependencies and run
go mod tidy
go run main.go
```

### **4. Frontend Setup**
```bash
cd client

# Create environment file
cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_ENV=development
EOF

# Install dependencies and run
npm install
npm start
```

### **5. Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

---

## 🎯 API Endpoints

### **Authentication**
- `GET /auth/google/login` - Initiate Google OAuth login
- `GET /auth/google/callback` - Handle OAuth callback
- `POST /auth/logout` - User logout with logging

### **Health & Monitoring**
- `GET /health` - Server health check
---

## 🔒 Environment Variables

### **Backend (.env)**
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret  
redirectURL=http://localhost:8080
PORT=8080
CLIENT_URL=http://localhost:3000
```

### **Frontend (.env)**
```env
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_ENV=development
```

---

## 📱 Screenshots

### **Homepage**
- Featured movie sections with modern card layouts
- Quick access to movie browsing
- Responsive navigation with authentication

### **Movies Page** 
- Advanced search and filtering interface
- Grid/List view toggle
- Category tabs (Now Playing, Coming Soon, Trending)
- Real-time search results

### **Movie Detail Page**
- IMDB-style comprehensive movie information
- Cast and crew details with photos
- Ticket booking interface
- Trailer integration

### **Authentication**
- Clean Google OAuth login interface
- User profile dropdown with logout
- Secure session management

---

## 🚀 Deployment

### **Production Environment Variables**

**Backend:**
```env
GOOGLE_CLIENT_ID=prod_client_id
GOOGLE_CLIENT_SECRET=prod_client_secret
redirectURL=https://your-api-domain.com
PORT=8080
CLIENT_URL=https://your-frontend-domain.com
```

**Frontend:**
```env
REACT_APP_BACKEND_URL=https://your-api-domain.com
REACT_APP_ENV=production
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Material-UI** for the excellent component library
- **Google OAuth** for secure authentication
- **Unsplash** for high-quality movie poster placeholders
- **Go Fiber** for the fast and flexible backend framework

---

## 📞 Support

For support and questions:
- Create an [Issue](../../issues)
- Check the [Documentation](../../wiki)
- Review the [Requirements](https://docs.google.com/document/d/1MDqkpOW_LfZMtyTxA3ZWaWlCJAVV979Oxy8-5Imzxl0/edit?tab=t.0)

---

**Cinema Flix** - *Discover Movies. Book Tickets. Enjoy Cinema.* 🎬✨

# 9-Box Performance Review System

A modern web application for visualizing and managing employee performance using the 9-box talent grid methodology.

## Features

### Core Functionality
- **Interactive 9-Box Grid**: Drag-and-drop interface for positioning employees
- **Excel Integration**: Upload and export Excel files with employee data
- **Real-time Updates**: Instant visual feedback for all changes
- **Change Tracking**: Complete history of all employee movements
- **Advanced Filtering**: Filter by level, manager, job profile, and more
- **Employee Exclusion**: Temporarily hide employees from view
- **Statistics Dashboard**: Visual analytics and distribution charts
- **Secure Authentication**: JWT-based authentication system

### Technical Stack
- **Backend**: FastAPI (Python 3.10+)
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI)
- **State Management**: Zustand
- **Database**: SQLite
- **Excel Processing**: openpyxl
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites
- Docker and Docker Compose (recommended)
- OR: Python 3.10+, Node.js 18+

### Option 1: Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd 9boxer
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env and change SECRET_KEY in production!
```

3. Build and run:
```bash
docker-compose up --build
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

5. Login with default credentials:
- Username: `bencan`
- Password: `password`

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
. venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -e '.[dev]'

# Run backend
cd src
python -m ninebox.main
```

Backend will run on http://localhost:8000

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on http://localhost:5173

## Usage

### 1. Login
- Use default credentials: `bencan` / `password`
- Or create a new user (see Backend API docs)

### 2. Upload Excel File
- Click "Upload" button in the top bar
- Select a 9-box Excel file (.xlsx or .xls)
- File must contain columns: employee_id, employee_name, performance, potential

### 3. Interact with the Grid
- **Drag employees**: Click and drag employee tiles to new boxes
- **View details**: Click on an employee to see their profile and history
- **Filter**: Use the Filters button to narrow down displayed employees
- **Exclude**: Use the exclusion dialog to temporarily hide employees

### 4. Export Changes
- Make changes by dragging employees
- Click "Apply" button (shows badge with change count)
- Download modified Excel file

## Project Structure

```
9boxer/
├── backend/                 # FastAPI backend
│   ├── src/
│   │   └── ninebox/
│   │       ├── core/       # Core functionality (auth, database)
│   │       ├── models/     # Pydantic models
│   │       ├── routes/     # API endpoints
│   │       ├── services/   # Business logic
│   │       └── main.py     # Application entry point
│   ├── tests/              # Backend tests (119 tests, 92% coverage)
│   └── pyproject.toml      # Backend dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client
│   │   ├── store/          # Zustand state management
│   │   └── types/          # TypeScript types
│   └── package.json        # Frontend dependencies
├── docker/                 # Docker configuration
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── docker-compose.yml      # Docker Compose configuration
├── .env.example           # Environment variables template
├── DEPLOYMENT.md          # Deployment guide
└── USER_GUIDE.md          # User manual
```

## Development

### Backend Testing

```bash
cd backend
. venv/bin/activate
pytest                     # Run all tests
pytest --cov              # Run with coverage
pytest -k "test_name"     # Run specific tests
```

Current coverage: 92% (119 tests)

### Frontend Development

```bash
cd frontend
npm run dev              # Development server
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Lint code
```

### Code Quality

Backend uses:
- ruff for linting and formatting
- mypy for type checking
- bandit for security scanning
- pytest for testing

```bash
cd backend
. venv/bin/activate
ruff format .           # Format code
ruff check .            # Lint code
mypy src/              # Type check
bandit -r src/         # Security scan
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints

**Authentication**
- POST `/auth/login` - Login and get JWT token
- POST `/auth/logout` - Logout
- GET `/auth/me` - Get current user

**Session Management**
- POST `/session/upload` - Upload Excel file
- GET `/session/status` - Get session status
- POST `/session/export` - Export modified Excel file
- DELETE `/session/clear` - Clear session

**Employee Management**
- GET `/employees` - Get all employees (with filters)
- GET `/employees/{id}` - Get employee details
- PATCH `/employees/{id}/move` - Move employee to new box
- GET `/employees/filter-options` - Get available filter options

**Statistics**
- GET `/statistics` - Get distribution statistics

## Configuration

### Environment Variables

See `.env.example` for all available options:

- `SECRET_KEY` - JWT secret key (MUST change in production!)
- `DATABASE_URL` - Database connection string
- `CORS_ORIGINS` - Allowed CORS origins
- `LOG_LEVEL` - Logging level (DEBUG, INFO, WARNING, ERROR)
- `TOKEN_EXPIRE_MINUTES` - JWT token expiration (default: 60)

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- Production deployment
- Environment configuration
- Security best practices
- Troubleshooting

## User Guide

See [USER_GUIDE.md](USER_GUIDE.md) for detailed user instructions with screenshots.

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `pytest` (backend), `npm test` (frontend)
4. Commit: `git commit -m "feat: Add feature"`
5. Push: `git push origin feature/your-feature`
6. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check [USER_GUIDE.md](USER_GUIDE.md) for usage help
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
3. Open an issue on GitHub

## Acknowledgments

Built with:
- FastAPI - High-performance Python web framework
- React - UI library
- Material-UI - React component library
- Zustand - State management
- openpyxl - Excel file processing

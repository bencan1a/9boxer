"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ninebox.api import auth, employees, intelligence, session, statistics
from ninebox.core.config import settings
from ninebox.core.database import init_db

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="9-Box Performance Review Application API",
)

# Configure CORS
# Allow all origins to support both web (localhost) and Electron (file://)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins including file://
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(session.router, prefix="/api")
app.include_router(employees.router, prefix="/api")
app.include_router(statistics.router, prefix="/api")
app.include_router(intelligence.router, prefix="/api")


@app.get("/")
async def root() -> dict:
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check() -> dict:
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/debug/sessions")
async def debug_sessions() -> dict:
    """Debug endpoint to check active sessions (for development only)."""
    from ninebox.services.session_manager import session_manager

    sessions_info = {}
    for user_id, session in session_manager.sessions.items():
        sessions_info[user_id] = {
            "session_id": session.session_id,
            "employee_count": len(session.current_employees),
            "original_employee_count": len(session.original_employees),
            "changes_count": len(session.changes),
            "filename": session.original_filename,
            "created_at": session.created_at.isoformat(),
        }

    return {
        "total_sessions": len(session_manager.sessions),
        "sessions": sessions_info,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)  # nosec B104  # Intentional for server binding

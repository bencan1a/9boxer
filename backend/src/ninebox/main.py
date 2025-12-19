"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ninebox.api import employees, intelligence, session, statistics
from ninebox.core.config import settings
from ninebox.services.session_manager import session_manager

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="9Boxer Application API",
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
    sessions_info = {}
    for session_key, sess in session_manager.sessions.items():
        sessions_info[session_key] = {
            "session_id": sess.session_id,
            "employee_count": len(sess.current_employees),
            "original_employee_count": len(sess.original_employees),
            "changes_count": len(sess.changes),
            "filename": sess.original_filename,
            "created_at": sess.created_at.isoformat(),
        }

    return {
        "total_sessions": len(session_manager.sessions),
        "sessions": sessions_info,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)  # nosec B104  # Intentional for server binding

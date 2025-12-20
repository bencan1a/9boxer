"""Main FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ninebox.api import employees, intelligence, session, statistics
from ninebox.core.config import settings
from ninebox.core.dependencies import get_session_manager

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="9Boxer Application API",
)

# CORS Configuration for Desktop Application
# Allow all origins is acceptable because:
# 1. Backend only runs on localhost (127.0.0.1:8000)
# 2. Frontend is bundled Electron app (file:// or localhost)
# 3. Not exposed to external network
# 4. Desktop app deployment model (single-user, local-only)
# WARNING: If backend becomes network-accessible, restrict origins to:
# ["http://localhost:3000", "http://localhost:5173"]  # noqa: ERA001 (documentation example, not commented code)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Safe for desktop app, see comment above
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
    session_mgr = get_session_manager()
    sessions_info = {}
    for session_key, sess in session_mgr.sessions.items():
        sessions_info[session_key] = {
            "session_id": sess.session_id,
            "employee_count": len(sess.current_employees),
            "original_employee_count": len(sess.original_employees),
            "changes_count": len(sess.changes),
            "filename": sess.original_filename,
            "created_at": sess.created_at.isoformat(),
        }

    return {
        "total_sessions": len(session_mgr.sessions),
        "sessions": sessions_info,
    }


if __name__ == "__main__":
    import os

    import uvicorn

    # Allow port to be configured via environment variable (useful for testing)
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="127.0.0.1", port=port)  # Localhost-only for desktop app security

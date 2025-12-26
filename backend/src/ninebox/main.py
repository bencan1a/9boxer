"""Main FastAPI application."""

import json
import logging
import socket

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ninebox.api import employees, intelligence, session, statistics
from ninebox.core.config import settings
from ninebox.core.dependencies import get_session_manager

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

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
# ["http://localhost:3000", "http://localhost:5173"]
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
            "changes_count": len(sess.events),
            "filename": sess.original_filename,
            "created_at": sess.created_at.isoformat(),
        }

    return {
        "total_sessions": len(session_mgr.sessions),
        "sessions": sessions_info,
    }


def get_free_port() -> int:
    """Find and return a free port number.

    Returns:
        int: An available port number in the ephemeral port range.

    Note:
        This function temporarily binds to port 0, which causes the OS to
        assign a free port. The port is then released and returned.
        There's a small race condition where the port could be taken between
        release and use, but this is acceptable for local desktop applications.
    """
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(("127.0.0.1", 0))
        port: int = sock.getsockname()[1]
        return port
    finally:
        sock.close()


def is_port_in_use(port: int) -> bool:
    """Check if a port is already in use.

    Args:
        port: The port number to check.

    Returns:
        bool: True if the port is in use, False otherwise.

    Note:
        This attempts to connect to the port. If the connection succeeds,
        the port is in use. If it fails, the port is available.
    """
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        result = sock.connect_ex(("127.0.0.1", port))
        return result == 0
    finally:
        sock.close()


if __name__ == "__main__":
    import os

    import uvicorn

    # Allow port to be configured via environment variable (useful for testing)
    # Default to port 38000 to avoid conflicts with common services on 38000
    requested_port = int(os.getenv("PORT", "38000"))

    # Check if requested port is available
    if is_port_in_use(requested_port):
        logger.warning(f"Port {requested_port} is in use, finding alternative...")
        port = get_free_port()
        logger.info(f"Using alternative port: {port}")
    else:
        port = requested_port
        logger.info(f"Using requested port: {port}")

    # Output port info to stdout for Electron to capture
    # This MUST be on its own line and flushed immediately
    print(json.dumps({"port": port, "status": "ready"}), flush=True)

    # Start server (localhost-only for desktop app security)
    uvicorn.run(app, host="127.0.0.1", port=port)

#!/usr/bin/env python3
"""
CodeMate Webhook Server - Replit Entry Point
"""
import os
import sys
import uvicorn

# Add src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from codemate.webhook.server import app

if __name__ == "__main__":
    # Get port from environment variable (Replit provides this)
    port = int(os.environ.get("PORT", 8000))
    
    # Run the FastAPI app
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=port,
        log_level="info"
    )

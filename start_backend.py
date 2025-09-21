#!/usr/bin/env python3
"""
Startup script for the CodeMate backend server
"""
import subprocess
import sys
import os
from pathlib import Path

def main():
    # Change to the project directory
    project_dir = Path(__file__).parent
    os.chdir(project_dir)
    
    print("🚀 Starting CodeMate Backend Server...")
    print("📍 Project directory:", project_dir)
    
    # Check if virtual environment exists
    venv_path = project_dir / "venv"
    if not venv_path.exists():
        print("❌ Virtual environment not found. Please run 'python -m venv venv' first.")
        sys.exit(1)
    
    # Determine the correct Python executable
    if os.name == 'nt':  # Windows
        python_exe = venv_path / "Scripts" / "python.exe"
        pip_exe = venv_path / "Scripts" / "pip.exe"
    else:  # Unix/Linux/MacOS
        python_exe = venv_path / "bin" / "python"
        pip_exe = venv_path / "bin" / "pip"
    
    if not python_exe.exists():
        print("❌ Python executable not found in virtual environment.")
        sys.exit(1)
    
    print("🔧 Installing/updating dependencies...")
    try:
        subprocess.run([str(pip_exe), "install", "-r", "requirements.txt"], check=True)
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        sys.exit(1)
    
    print("🌐 Starting FastAPI server on http://localhost:8000")
    print("📊 API Documentation available at http://localhost:8000/docs")
    print("🔍 Health check available at http://localhost:8000/health")
    print("\n" + "="*50)
    
    try:
        # Start the FastAPI server
        subprocess.run([
            str(python_exe), "-m", "uvicorn", 
            "src.codemate.webhook.server:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

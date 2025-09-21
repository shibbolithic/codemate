from fastapi import FastAPI, Request, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from codemate.providers.github import GitHubProvider
from codemate.diff.parser import parse_patch
from codemate.analyzers.lint_analyzer import LintAnalyzer
from codemate.analyzers.security_analyzer import SecurityAnalyzer
from codemate.reporter.github_reporter import GitHubReporter
from codemate.config import settings
import hmac
import hashlib
import uvicorn
from datetime import datetime
from typing import List, Dict, Any

app = FastAPI(title="Codemate PR Review Webhook")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Railway deployment
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# -------------------------
# Simple GET test route
@app.get("/")
def root():
    return {"message": "Codemate webhook server running"}

<<<<<<< HEAD
# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# API endpoints for frontend
@app.get("/api/pull-requests")
def get_pull_requests():
    """Get list of pull requests for frontend display"""
    # This would typically fetch from a database or GitHub API
    # For now, return mock data that matches frontend expectations
    return [
        {
            "id": "1",
            "title": "Add user authentication system",
            "repository": "frontend-app",
            "author": "johndoe",
            "branch": "feature/auth-system",
            "status": "reviewed",
            "createdAt": "2024-01-15T10:30:00Z",
            "updatedAt": "2024-01-15T14:20:00Z",
            "reviewScore": 85,
            "url": "https://github.com/company/frontend-app/pull/42",
        },
        {
            "id": "2",
            "title": "Optimize database queries in user service",
            "repository": "backend-api",
            "author": "janesmith",
            "branch": "optimize/user-queries",
            "status": "pending",
            "createdAt": "2024-01-16T09:15:00Z",
            "updatedAt": "2024-01-16T09:15:00Z",
            "url": "https://github.com/company/backend-api/pull/128",
        },
        {
            "id": "3",
            "title": "Fix memory leak in websocket connections",
            "repository": "realtime-service",
            "author": "mikewilson",
            "branch": "bugfix/websocket-memory-leak",
            "status": "approved",
            "createdAt": "2024-01-14T16:45:00Z",
            "updatedAt": "2024-01-15T11:30:00Z",
            "reviewScore": 92,
            "url": "https://github.com/company/realtime-service/pull/67",
        }
    ]

@app.get("/api/pull-requests/{pr_id}")
def get_pull_request(pr_id: str):
    """Get specific pull request details"""
    # Mock implementation - would fetch from database/GitHub
    return {
        "id": pr_id,
        "title": f"Pull Request #{pr_id}",
        "repository": "example-repo",
        "author": "developer",
        "branch": "feature-branch",
        "status": "pending",
        "createdAt": datetime.now().isoformat(),
        "updatedAt": datetime.now().isoformat(),
        "url": f"https://github.com/company/repo/pull/{pr_id}",
    }

@app.get("/api/reviews/{pr_id}")
def get_ai_review(pr_id: str):
    """Get AI review for a specific pull request"""
    # Mock implementation - would generate or fetch from database
    return {
        "id": f"review-{pr_id}",
        "pullRequestId": pr_id,
        "overallScore": 85,
        "summary": "This pull request implements solid changes with good code organization. The implementation follows best practices, though there are some areas for improvement in error handling and documentation.",
        "codeStructure": {
            "score": 88,
            "comments": [
                "Well-organized component hierarchy",
                "Good separation of concerns between authentication logic and UI",
                "Consider extracting some utility functions for better reusability",
            ],
        },
        "codingStandards": {
            "score": 82,
            "comments": [
                "Consistent naming conventions followed",
                "Good TypeScript usage with proper type definitions",
                "Some functions could benefit from JSDoc comments",
                "Missing prop validation in a few components",
            ],
        },
        "possibleBugs": [
            {
                "id": "bug-1",
                "type": "error",
                "file": "src/auth/AuthProvider.tsx",
                "line": 45,
                "message": "Potential race condition in token refresh logic",
                "code": "if (token && !isExpired(token)) { refreshToken(); }",
                "severity": "high",
            },
            {
                "id": "bug-2",
                "type": "warning",
                "file": "src/components/LoginForm.tsx",
                "line": 23,
                "message": "Missing input validation for email format",
                "severity": "medium",
            },
        ],
        "suggestions": [
            {
                "id": "suggestion-1",
                "type": "suggestion",
                "file": "src/auth/authUtils.ts",
                "line": 12,
                "message": "Consider using a more secure method for token storage",
                "code": 'localStorage.setItem("token", token); // Consider httpOnly cookies instead',
                "severity": "medium",
            },
        ],
        "comments": [],
        "generatedAt": datetime.now().isoformat(),
    }

@app.post("/api/reviews/{pr_id}/trigger")
def trigger_review(pr_id: str):
    """Trigger a new AI review for a pull request"""
    # Mock implementation - would trigger actual analysis
    return {"success": True, "message": f"Review triggered for PR #{pr_id}"}

# Add OPTIONS handlers for CORS preflight requests
@app.options("/api/pull-requests")
async def options_pull_requests():
    return {"message": "OK"}

@app.options("/api/pull-requests/{pr_id}")
async def options_pull_request(pr_id: str):
    return {"message": "OK"}

@app.options("/api/reviews/{pr_id}")
async def options_review(pr_id: str):
    return {"message": "OK"}

@app.options("/api/reviews/{pr_id}/trigger")
async def options_trigger_review(pr_id: str):
    return {"message": "OK"}

@app.options("/webhook")
async def options_webhook():
    return {"message": "OK"}

@app.options("/webhook/pull-requests")
async def options_webhook_pull_requests():
    return {"message": "OK"}

@app.options("/pull-requests")
async def options_pull_requests_alt():
    return {"message": "OK"}

@app.options("/api/prs")
async def options_prs():
    return {"message": "OK"}

@app.options("/prs")
async def options_prs_alt():
    return {"message": "OK"}

@app.options("/health")
async def options_health():
    return {"message": "OK"}
=======
# Placeholder /api/reviews route to avoid 404s
@app.get("/api/reviews")
def get_reviews():
    return {"reviews": []}
>>>>>>> cbbf2328fda35f043f5fe1df7f09112bd820e9d6
# -------------------------

# GitHub setup
github_provider = GitHubProvider(token=settings.github_token)
github_reporter = GitHubReporter(github_provider)

def verify_github_signature(secret, signature, payload):
    mac = hmac.new(secret.encode(), msg=payload, digestmod=hashlib.sha256)
    expected = f"sha256={mac.hexdigest()}"
    return hmac.compare_digest(expected, signature)

# GitLab secret from environment
GITLAB_SECRET = os.getenv("GITLAB_WEBHOOK_SECRET")
# Bitbucket secret from environment
BITBUCKET_SECRET = os.getenv("BITBUCKET_WEBHOOK_SECRET")

@app.post("/webhook")
async def handle_webhook(
    request: Request,
    x_hub_signature_256: str | None = Header(None),
    x_github_event: str | None = Header(None),
    x_gitlab_token: str | None = Header(None),
    x_event_key: str | None = Header(None)
):
    payload = await request.body()
    data = await request.json()

    platform = None

    # -------------------------
    # GitHub
    if x_hub_signature_256:
        platform = "github"
        if settings.webhook_secret and not verify_github_signature(settings.webhook_secret, x_hub_signature_256, payload):
            raise HTTPException(status_code=400, detail="Invalid GitHub signature")

        if x_github_event != "pull_request":
            return {"message": "GitHub event ignored"}

        pr_action = data.get("action")
        if pr_action not in ["opened", "synchronize", "reopened"]:
            return {"message": f"PR action {pr_action} ignored"}

        repo_full_name = data["repository"]["full_name"]
        pr_number = data["pull_request"]["number"]

        changed_files = github_provider.list_changed_files(repo_full_name, pr_number)
        for f in changed_files:
            f["parsed_lines"] = parse_patch(f.get("patch", ""))

        issues = LintAnalyzer().analyze(".", changed_files)
        issues += SecurityAnalyzer().analyze(".", changed_files)

        github_reporter.post_inline_comments(repo_full_name, pr_number, issues)
        github_reporter.post_summary(repo_full_name, pr_number, issues)

        return {"message": f"GitHub PR #{pr_number} analyzed successfully", "issues_count": len(issues)}

    # -------------------------
    # GitLab
    elif x_gitlab_token:
        platform = "gitlab"
        if GITLAB_SECRET and x_gitlab_token != GITLAB_SECRET:
            raise HTTPException(status_code=403, detail="Invalid GitLab token")

        if data.get("object_kind") != "merge_request":
            return {"message": "GitLab event ignored"}

        mr_action = data.get("object_attributes", {}).get("action")
        if mr_action not in ["open", "update", "reopen"]:
            return {"message": f"MR action {mr_action} ignored"}

        # TODO: Use GitLab provider & reporter similar to GitHub
        return {"message": "GitLab MR received (demo placeholder)"}

    # -------------------------
    # Bitbucket
    elif x_event_key:
        platform = "bitbucket"
        if BITBUCKET_SECRET and request.headers.get("X-Hub-Signature") != BITBUCKET_SECRET:
            raise HTTPException(status_code=403, detail="Invalid Bitbucket token")

        if not x_event_key.startswith("pullrequest:"):
            return {"message": "Bitbucket event ignored"}

        # TODO: Use Bitbucket provider & reporter similar to GitHub
        return {"message": "Bitbucket PR received (demo placeholder)"}

    else:
        raise HTTPException(status_code=400, detail="Unknown webhook source")
    

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

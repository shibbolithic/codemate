from fastapi import FastAPI, Request, HTTPException, Header
from codemate.providers.github import GitHubProvider
from codemate.diff.parser import parse_patch
from codemate.analyzers.lint_analyzer import LintAnalyzer
from codemate.analyzers.security_analyzer import SecurityAnalyzer
from codemate.reporter.github_reporter import GitHubReporter
from codemate.config import settings
import hmac
import hashlib
import uvicorn
import os

app = FastAPI(title="Codemate PR Review Webhook")

# -------------------------
# Simple GET test route
@app.get("/")
def root():
    return {"message": "Codemate webhook server running"}

# Placeholder /api/reviews route to avoid 404s
@app.get("/api/reviews")
def get_reviews():
    return {"reviews": []}
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

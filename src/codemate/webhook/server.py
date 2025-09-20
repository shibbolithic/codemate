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

app = FastAPI(title="Codemate PR Review Webhook")

# -------------------------
# Simple GET test route
@app.get("/")
def root():
    return {"message": "Codemate webhook server running"}
# -------------------------


provider = GitHubProvider(token=settings.github_token)
reporter = GitHubReporter(provider)

# Utility function to verify GitHub webhook signature
def verify_signature(secret, signature, payload):
    mac = hmac.new(secret.encode(), msg=payload, digestmod=hashlib.sha256)
    expected = f"sha256={mac.hexdigest()}"
    return hmac.compare_digest(expected, signature)

@app.post("/webhook")
async def handle_webhook(
    request: Request,
    x_hub_signature_256: str | None = Header(None),
    x_github_event: str | None = Header(None)
):
    payload = await request.body()

    # Verify signature
    if settings.webhook_secret:
        if not x_hub_signature_256 or not verify_signature(settings.webhook_secret, x_hub_signature_256, payload):
            raise HTTPException(status_code=400, detail="Invalid signature")

    data = await request.json()
    
    # Only handle pull_request events
    if x_github_event != "pull_request":
        return {"message": "Event ignored"}

    pr_action = data.get("action")
    if pr_action not in ["opened", "synchronize", "reopened"]:
        return {"message": f"PR action {pr_action} ignored"}

    repo_full_name = data["repository"]["full_name"]
    pr_number = data["pull_request"]["number"]

    # Fetch changed files
    changed_files = provider.list_changed_files(repo_full_name, pr_number)

    # Parse patch for analyzers
    for f in changed_files:
        f["parsed_lines"] = parse_patch(f.get("patch", ""))

    # Run analyzers
    issues = LintAnalyzer().analyze(".", changed_files)
    issues += SecurityAnalyzer().analyze(".", changed_files)

    # Post inline comments and summary
    reporter.post_inline_comments(repo_full_name, pr_number, issues)
    reporter.post_summary(repo_full_name, pr_number, issues)

    return {"message": f"PR #{pr_number} analyzed successfully", "issues_count": len(issues)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

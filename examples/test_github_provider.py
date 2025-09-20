from codemate.providers.github import GitHubProvider
from codemate.config import settings

provider = GitHubProvider(token=settings.github_token)
pr_info = provider.fetch_pr("owner/repo", 1)
files = provider.list_changed_files("owner/repo", 1)

print("Changed files:", [f["filename"] for f in files])

# Post dummy inline comment (optional)
# provider.post_review_comments("owner/repo", 1, [
#     {"path": "test.py", "position": 2, "body": "Demo comment from PR agent"}
# ])

# Post summary (optional)
# provider.post_summary("owner/repo", 1, "This is a demo summary")

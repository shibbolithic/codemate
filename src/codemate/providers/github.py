# src/codemate/providers/github.py
import requests
from .base import ProviderBase

GITHUB_API = "https://api.github.com"

class GitHubProvider(ProviderBase):
    def __init__(self, token: str | None = None):
        super().__init__(token)
        self.session = requests.Session()
        if token:
            self.session.headers.update({
                "Authorization": f"token {token}",
                "Accept": "application/vnd.github.v3+json"
            })

    def fetch_pr(self, repo: str, pr_id: int):
        """Fetch PR metadata + files."""
        r = self.session.get(f"{GITHUB_API}/repos/{repo}/pulls/{pr_id}")
        r.raise_for_status()
        pr_data = r.json()

        # Fetch files in the PR
        files = []
        page = 1
        while True:
            rf = self.session.get(
                f"{GITHUB_API}/repos/{repo}/pulls/{pr_id}/files",
                params={"page": page, "per_page": 100}
            )
            rf.raise_for_status()
            data = rf.json()
            if not data:
                break
            files.extend(data)
            page += 1

        pr_data["files"] = files
        return pr_data

    def list_changed_files(self, repo: str, pr_id: int):
        pr_data = self.fetch_pr(repo, pr_id)
        changed_files = []
        for f in pr_data.get("files", []):
            changed_files.append({
                "filename": f["filename"],
                "patch": f.get("patch", "")
            })
        return changed_files

    def _get_latest_commit_sha(self, repo: str, pr_id: int) -> str:
        r = self.session.get(f"{GITHUB_API}/repos/{repo}/pulls/{pr_id}/commits")
        r.raise_for_status()
        commits = r.json()
        return commits[-1]["sha"] if commits else ""

    def post_review_comments(self, repo: str, pr_id: int, comments: list):
        """Post inline comments to the PR."""
        if not comments:
            return
        commit_sha = self._get_latest_commit_sha(repo, pr_id)
        payload = {
            "commit_id": commit_sha,
            "body": "Automated review from Codemate PR Agent",
            "event": "COMMENT",
            "comments": comments
        }
        r = self.session.post(f"{GITHUB_API}/repos/{repo}/pulls/{pr_id}/reviews", json=payload)
        r.raise_for_status()
        return r.json()

    def post_summary(self, repo: str, pr_id: int, body: str):
        """Post overall summary comment."""
        r = self.session.post(
            f"{GITHUB_API}/repos/{repo}/issues/{pr_id}/comments",
            json={"body": body}
        )
        r.raise_for_status()
        return r.json()

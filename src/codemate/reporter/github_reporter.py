from codemate.providers.github import GitHubProvider
from typing import List, Dict

class GitHubReporter:
    def __init__(self, provider: GitHubProvider):
        self.provider = provider

    def post_inline_comments(self, repo: str, pr_id: int, issues: List[Dict]):
        """
        Convert analyzer issues to GitHub review comments.
        GitHub requires:
            - path: file path
            - position: line number in diff (not actual file line)
            - body: comment text
        """
        comments = []
        for issue in issues:
            # Only report added/changed lines
            if issue["line"] is None:
                continue
            comments.append({
                "path": issue["path"],
                "position": issue["line"],
                "body": f"[{issue['rule']}] {issue['message']}"
            })

        if comments:
            return self.provider.post_review_comments(repo, pr_id, comments)
        return []

    def post_summary(self, repo: str, pr_id: int, issues: List[Dict]):
        """
        Post a summary comment including total issues and high-level feedback.
        """
        if not issues:
            body = "✅ No issues detected. PR looks good!"
        else:
            summary_lines = [
                f"Total issues detected: {len(issues)}",
                "",
                "### Issues breakdown:",
            ]
            for issue in issues:
                summary_lines.append(
                    f"- `{issue['path']}:{issue['line']}` [{issue['rule']}] {issue['message']}"
                )
            body = "\n".join(summary_lines)

        return self.provider.post_summary(repo, pr_id, body)

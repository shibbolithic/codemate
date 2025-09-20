# src/codemate/providers/base.py
from abc import ABC, abstractmethod
from typing import List, Dict, Any

class ProviderBase(ABC):
    def __init__(self, token: str | None = None):
        self.token = token

    @abstractmethod
    def fetch_pr(self, repo: str, pr_id: int) -> Dict[str, Any]:
        """Return PR metadata and diff."""
        pass

    @abstractmethod
    def list_changed_files(self, repo: str, pr_id: int) -> List[Dict]:
        """Return list of changed files with patch/diff."""
        pass

    @abstractmethod
    def post_review_comments(self, repo: str, pr_id: int, comments: List[Dict]):
        """Post inline review comments."""
        pass

    @abstractmethod
    def post_summary(self, repo: str, pr_id: int, body: str):
        """Post overall PR summary."""
        pass

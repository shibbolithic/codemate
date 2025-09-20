from abc import ABC, abstractmethod
from typing import List, Dict

class AnalyzerBase(ABC):
    @abstractmethod
    def analyze(self, repo_path: str, changed_files: List[Dict]) -> List[Dict]:
        """
        Analyze changed files and return a list of issues.
        Each issue dict contains:
            - path: file path
            - line: line number
            - severity: "error", "warning", or "info"
            - rule: rule name
            - message: description
            - suggestion: optional fix suggestion
        """
        raise NotImplementedError

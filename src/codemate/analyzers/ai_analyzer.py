from .base import AnalyzerBase
from typing import List, Dict
from codemate.config import settings

class AIAnalyzer(AnalyzerBase):
    def analyze(self, repo_path: str, changed_files: List[Dict]) -> List[Dict]:
        """
        Use an LLM to generate feedback for each added line.
        Currently stub: returns dummy feedback.
        """
        issues: List[Dict] = []

        for f in changed_files:
            for i, line in enumerate(f.get("patch", "").splitlines(), start=1):
                if line.startswith("+") and not line.startswith("+++"):
                    issues.append({
                        "path": f["filename"],
                        "line": i,
                        "severity": "info",
                        "rule": "ai-feedback",
                        "message": f"AI suggestion: Review this line: {line[1:]}",
                        "suggestion": ""
                    })
        return issues

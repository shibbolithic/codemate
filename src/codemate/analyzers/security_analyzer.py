import subprocess
from .base import AnalyzerBase
from typing import List, Dict

class SecurityAnalyzer(AnalyzerBase):
    def analyze(self, repo_path: str, changed_files: List[Dict]) -> List[Dict]:
        issues: List[Dict] = []

        filenames = [f["filename"] for f in changed_files if f.get("patch")]
        if not filenames:
            return issues

        try:
            result = subprocess.run(
                ["bandit", "-f", "json", "-q", *filenames],
                capture_output=True, text=True, cwd=repo_path
            )
            import json
            data = json.loads(result.stdout)
        except FileNotFoundError:
            print("bandit not installed. Install with 'pip install bandit'")
            return issues
        except Exception as e:
            print("Bandit failed:", e)
            return issues

        for r in data.get("results", []):
            issues.append({
                "path": r.get("filename"),
                "line": r.get("line_number"),
                "severity": "warning",
                "rule": r.get("test_name"),
                "message": r.get("issue_text"),
                "suggestion": ""
            })

        return issues

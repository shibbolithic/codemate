import subprocess
from .base import AnalyzerBase
from typing import List, Dict

class LintAnalyzer(AnalyzerBase):
    def analyze(self, repo_path: str, changed_files: List[Dict]) -> List[Dict]:
        """
        Run flake8 on the changed files and return issues.
        """
        issues: List[Dict] = []

        for f in changed_files:
            filename = f["filename"]
            patch = f.get("patch", "")
            # Skip deleted files
            if patch is None:
                continue

            # Run flake8 only on the changed file
            try:
                result = subprocess.run(
                    ["flake8", filename, "--format=%(path)s::%(row)d::%(code)s::%(text)s"],
                    capture_output=True,
                    text=True,
                    cwd=repo_path
                )
            except FileNotFoundError:
                print("flake8 not installed. Install with 'pip install flake8'")
                return issues

            for line in result.stdout.strip().split("\n"):
                if not line:
                    continue
                path, row, code, msg = line.split("::", 3)
                severity = "error" if code.startswith("E") else "warning"
                issues.append({
                    "path": path,
                    "line": int(row),
                    "severity": severity,
                    "rule": code,
                    "message": msg,
                    "suggestion": ""
                })
        return issues

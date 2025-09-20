import argparse
from codemate.providers.github import GitHubProvider
from codemate.diff.parser import parse_patch
from codemate.analyzers.lint_analyzer import LintAnalyzer
from codemate.analyzers.security_analyzer import SecurityAnalyzer
from codemate.reporter.github_reporter import GitHubReporter
from codemate.config import settings

def main():
    parser = argparse.ArgumentParser(description="Codemate PR Review Agent CLI")
    parser.add_argument("--repo", type=str, help="GitHub repo in format owner/repo")
    parser.add_argument("--pr", type=int, help="PR number to analyze")
    parser.add_argument("--local", type=str, help="Path to local repo for analysis")
    args = parser.parse_args()

    if args.pr and args.repo:
        # Remote GitHub PR
        provider = GitHubProvider(token=settings.github_token)
        reporter = GitHubReporter(provider)
        changed_files = provider.list_changed_files(args.repo, args.pr)

        for f in changed_files:
            f["parsed_lines"] = parse_patch(f.get("patch", ""))

        # Run analyzers
        issues = LintAnalyzer().analyze(".", changed_files)
        issues += SecurityAnalyzer().analyze(".", changed_files)

        # Post comments and summary
        reporter.post_inline_comments(args.repo, args.pr, issues)
        reporter.post_summary(args.repo, args.pr, issues)
        print(f"✅ PR #{args.pr} analysis complete.")

    elif args.local:
        # Local repo analysis
        from pathlib import Path
        repo_path = Path(args.local)
        changed_files = [{"filename": str(f), "patch": None} for f in repo_path.rglob("*.py")]

        # Run analyzers
        issues = LintAnalyzer().analyze(str(repo_path), changed_files)
        issues += SecurityAnalyzer().analyze(str(repo_path), changed_files)

        # Print summary
        print(f"Local analysis complete. Total issues: {len(issues)}")
        for i in issues:
            print(f"- {i['path']}:{i['line']} [{i['rule']}] {i['message']}")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()

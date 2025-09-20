# PR Review Agent (Skeleton)

This is a skeleton repository for the **PR Review Agent** hackathon project.
Contains a minimal, modular Python layout with provider adapter, diff parser,
analyzer scaffolding, reporter, CLI, and example payload.

## What's included
- Minimal package under `src/pr_review_agent/`
- Provider base and GitHub adapter stub
- Diff parser stub using `unidiff`
- Analyzer base and lint analyzer stub
- Reporter stub for GitHub
- CLI entrypoint and example `main.py`
- `pyproject.toml` + `requirements.txt`
- `.env.example`, sample PR payload and basic test

## How to run (local demo)
1. Create a virtualenv and install requirements:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Run basic CLI demo (no real tokens required for stub):
   ```bash
   python -m pr_review_agent.cli run --provider github --repo owner/repo --pr 1
   ```

This skeleton is intended as a starting point — replace the stubs with working implementations
before demo/submission.


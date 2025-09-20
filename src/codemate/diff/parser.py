# src/codemate/diff/parser.py
from unidiff import PatchSet
from typing import List, Dict

def parse_patch(patch_text: str) -> List[Dict]:
    """
    Parse a unified patch and return a list of changes.
    Each entry contains:
        - path: file path
        - line: line number in the new file (None for removed lines)
        - content: line content
        - is_added: True if line was added
        - is_removed: True if line was removed
    """
    patch = PatchSet(patch_text.splitlines(True))
    mapped = []

    for patched_file in patch:
        path = patched_file.path
        for hunk in patched_file:
            for line in hunk:
                mapped.append({
                    "path": path,
                    "line": getattr(line, "target_line_no", None),
                    "content": line.value.rstrip("\n"),
                    "is_added": line.is_added,
                    "is_removed": line.is_removed
                })
    return mapped

from codemate.diff.parser import parse_patch

sample_patch = """
diff --git a/test.py b/test.py
index e69de29..4b825dc 100644
--- a/test.py
+++ b/test.py
@@ -0,0 +1,3 @@
+print("Hello World")
+def foo(): pass
+foo()
"""

changes = parse_patch(sample_patch)
for c in changes:
    print(c)

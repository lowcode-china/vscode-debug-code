import os
import sys


if __name__ == "__main__":
    print(f"===== Debug python module =====")
    debug = os.getenv("DEBUG")
    print(f"DEBUG: {debug}")
    print(f"PYTHONPATH", sys.path)

"""debug cases
PYTHONPATH="lib1:lib2"; DEBUG=true; $cwd=${workspaceFolder}/python-project; python -m a.main
"""
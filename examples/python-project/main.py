import os


if __name__ == "__main__":
    print(f"===== Debug python file =====")
    debug = os.getenv("DEBUG")
    print(f"DEBUG: {debug}")


"""debug cases
DEBUG=true; python ${workspaceFolder}/python-project/main.py
"""
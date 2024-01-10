import os
import sys

print("run python module")
debug = os.getenv("DEBUG")
envs = {'DEBUG': debug}
print(f"envs: {envs}")
print(f"pythonpath", sys.path)

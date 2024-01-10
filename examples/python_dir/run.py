import os

print("run python file")
debug = os.getenv("DEBUG")
envs = {'DEBUG': debug}
print(f"envs: {envs}")

from flask import Flask

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


"""debug cases
$cwd=${workspaceFolder}/python-project; python -m flask --app server run
"""

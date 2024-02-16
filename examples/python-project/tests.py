def test_a():
    print(f"===== Debug pytest a =====")
    assert True


def test_b():
    print(f"===== Debug pytest b =====")
    assert True


"""debug cases
python -m pytest -s ${workspaceFolder}/python-project/tests.py::test_a
python -m pytest -s ${workspaceFolder}/python-project/tests.py
"""
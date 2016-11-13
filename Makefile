run:
	python server.py

clean:
	find . -name '*.pyc' -type f -delete
	find . -name '__pycache__' -type d | xargs rm -rf

check:
	find . -name "*.py" -not -path "./env/*" | xargs flake8

.PHONY: run clean check

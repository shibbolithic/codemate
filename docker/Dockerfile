FROM python:3.10-slim
WORKDIR /app
COPY . /app
RUN pip install -r requirements.txt
CMD ["uvicorn", "pr_review_agent.webhook.server:app", "--host", "0.0.0.0", "--port", "8000"]

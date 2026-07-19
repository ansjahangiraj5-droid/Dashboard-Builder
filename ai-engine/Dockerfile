FROM registry.redhat.io/ubi9/python-311-minimal:latest

USER root

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd -u 1001 -m appuser && chown -R 1001:1001 /app

USER 1001

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--workers", "2"]

FROM python:3.11.6-bullseye

# RUN apt-get update

WORKDIR /code

COPY requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY ./src/ /code

CMD ["python", "main.py"]
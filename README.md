# Simple asyncronous chat writted on Tornado

Example of the simple chat on Tornado and Mongo DB.

## Running on localhost

To run server on localhost you have to install mongodb-server first. Next, run next commands:

```
virtualenv -p python3.5 env
pip install -r requirements.txt
env/bin/activate
python server.py
```

Server will available on [localhost:8888](http://localhost:8888):


## Running chat in-box with docker (also on localhost:8000).

```
docker-compose up
```

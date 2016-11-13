#!/usr/bin/env python3

import os
import json

from motor.motor_tornado import MotorClient
import tornado.web
import tornado.ioloop
import tornado.websocket


MONGO_HOST = os.environ.get("MONGO_HOST", "127.0.0.1")
MONGO_PORT = int(os.environ.get("MONGO_PORT", 27017))
LISTEN_PORT = int(os.environ.get("LISTEN_PORT", 8888))
MESSAGES_SHOW_LIMIT = 10


class MainHandler(tornado.web.RequestHandler):

    async def get(self):
        cursor = self.application.db.messages.find().sort('_id', -1).limit(
            MESSAGES_SHOW_LIMIT
        )
        messages = await cursor.to_list(None)
        messages.reverse()
        self.render('index.html', messages=messages)


class WebSocket(tornado.websocket.WebSocketHandler):

    def open(self):
        self.application.webSocketsPool.append(self)

    def on_message(self, message):
        message_dict = json.loads(message)
        self.application.db.messages.insert(message_dict)
        for key, value in enumerate(self.application.webSocketsPool):
            if value != self:
                value.ws_connection.write_message(message)

    def on_close(self, message=None):
        for key, value in enumerate(self.application.webSocketsPool):
            if value == self:
                del self.application.webSocketsPool[key]


class Application(tornado.web.Application):
    def __init__(self):
        self.webSocketsPool = []
        self.db = MotorClient(MONGO_HOST, MONGO_PORT).chat

        handlers = (
            (r'/', MainHandler),
            (r'/websocket/?', WebSocket),
            (r'/static/(.*)', tornado.web.StaticFileHandler,
             {'path': 'static/'}),
        )
        super().__init__(handlers)


application = Application()


if __name__ == '__main__':
    application.listen(LISTEN_PORT)
    tornado.ioloop.IOLoop.instance().start()

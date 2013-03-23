#!/usr/bin/env python
#!-*- coding: utf-8 -*-

import os
import json

import tornado.web
import tornado.ioloop
import tornado.websocket
from tornado import template

import pymongo


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        db = self.application.db
        messages = db.chat.find()
        self.render('index.html', messages=messages)


class WebSocket(tornado.websocket.WebSocketHandler):
    def open(self):
        self.application.webSocketsPool.append(self)

    def on_message(self, message):
        socket_id = message
        db = self.application.db
        db.chat.save(json.loads(message))
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

        settings = {
            'static_url_prefix': '/static/',
        }
        connection = pymongo.Connection('127.0.0.1', 27017)
        self.db = connection.chat
        handlers = (
            (r'/', MainHandler),
            (r'/websocket/?', WebSocket),
            (r'/static/(.*)', tornado.web.StaticFileHandler,
             {'path': 'static/'}),
        )

        tornado.web.Application.__init__(self, handlers)

application = Application()


if __name__ == '__main__':
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()


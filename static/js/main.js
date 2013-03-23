;!(function () {
    'use strict';

    var application = {};

    application.websocket = {
        socket: null,
        init: function() {
            var socket = new WebSocket(
                'ws://' + document.location.host + '/websocket'
            ), message;
            socket.onmessage = function (event) {
                message = JSON.parse(event.data);
                application.chat.appendMessage(message.user, message.text);
            };
            this.socket = socket;
        }
    };

    application.chat = {
        container: null,
        init: function () {
            this.container = document.getElementById('chat-messages');
            if (this.container.lastElementChild !== null) {
                this.container.lastElementChild.scrollIntoView();
            }
        },
        appendMessage: function (user, text) {
            var addr = document.createElement('address');
            if (addr.innerText !== undefined) {
                addr.innerText = user;
            } else {
                addr.textContent = user;
            }
            var span = document.createElement('span');
            if (span.innerText !== undefined) {
                span.innerText = text;
            } else {
                span.textContent = text;
            }
            var item = document.createElement('div');
            item.className = 'message';
            item.appendChild(addr);
            item.appendChild(span);
            if (this.container === null) {
                console.error('Container for chat\'s messages is null');
                return;
            }
            this.container.appendChild(item);
            item.scrollIntoView();
            return this;
        }
    };

    application.handlers = {
        init: function () {
            var form = document.forms['chat-form'], message, jsonMessage,
                socket;
            form.onsubmit = function () {
                var text = form.text.value.trim(),
                    user = form.user.value.trim();
                form.user.classList.remove('error');
                form.text.classList.remove('error');
                if (!user) {
                    form.user.focus();
                    if (!form.user.classList.contains('error')) {
                        form.user.classList.add('error');
                    }
                    return false;
                }
                if (!text) {
                    form.text.focus();
                    if (!form.text.classList.contains('error')) {
                        form.text.classList.add('error');
                    }
                    return false;
                }
                message = {
                    user: user,
                    text: text
                };
                jsonMessage = JSON.stringify(message);

                if (application.websocket.socket !== null) {
                    socket = application.websocket.socket; 
                    socket.send(jsonMessage);
                }
                form.text.value = '';
                return false;
            };
        }
    };

    window.onload = function () {
        application.websocket.init();
        application.chat.init();
        application.handlers.init();
    };
}());

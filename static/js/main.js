$(function () {

    var Socket = {
        ws: null,
        init: function () {
            ws = new WebSocket('ws://' + document.location.host + '/websocket');
            ws.onopen = function () {
                console.log('Socket opened');
            };

            ws.onclose = function () {
                console.log('Socket close');
            };

            ws.onmessage = function (e) {
                var message = new Message(JSON.parse(e.data));
                App.addOne(message);
            };
            this.ws = ws;
        }
    };

    Socket.init();
    var socket = Socket.ws;

    var Message = Backbone.Model.extend({
        defaults: function () {
            return {
                user: null,
                text: null,
            };
        },
        save: function (options) {
            socket.send(JSON.stringify(this));
        }
    });

    var MessageList = Backbone.Collection.extend({

        model: Message,

    });

    var Messages = new MessageList;

    var MessageView = Backbone.View.extend({

        tagName: 'div',

        className: 'message',

        template: _.template($('#message-template').html()),

        /*
        initialize: function () {
        },
        */

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    var AppView = Backbone.View.extend({

        el: $('#backbone-chat'),
        lastMessage: $('.message').last(),

        events: {
            'submit #chat-form': 'createOnSubmit'
        },

        initialize: function () {
            if (this.lastMessage.length) {
                this.lastMessage[0].scrollIntoView();
            }
            this.textInput = this.$('#id_text');
            this.userInput = this.$('#id_user');

            this.listenTo(Messages, 'add', this.addOne);
            this.listenTo(Messages, 'reset', this.addAll);
            this.listenTo(Messages, 'all', this.render);

            Messages.fetch();
        },

        addOne: function (message) {
            var view = new MessageView({
                model: message
            });
            this.$('#chat-messages').append(view.render().el);
            this.$('.message').last()[0].scrollIntoView();
        },

        addAll: function () {
            Messages.each(this.addOne, this);
        },

        createOnSubmit: function () {
            this.userInput.removeClass('error');
            this.textInput.removeClass('error');

            if (!this.userInput.val().trim()) {
                this.userInput.addClass('error');
                this.userInput.focus();
                return false;
            }
            if (!this.textInput.val().trim()) {
                this.textInput.addClass('error');
                this.textInput.focus();
                return false;
            }

            Messages.create({
                user: this.userInput.val(),
                text: this.textInput.val()
            });

            this.textInput.val('');
            return false;
        },

    });


    Backbone.sync = function(method, model) {
        //alert(method + ': ' + JSON.stringify(model));
        //model.id = 1;
    };



    var App = new AppView;
});

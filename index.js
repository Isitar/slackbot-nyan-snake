const dotenv = require('dotenv');
dotenv.config();
const {App} = require('@slack/bolt');


class Game {
    type_none = 0;
    type_cookie = 1;
    type_cat_head = 2;
    type_cat_body = 3;
    type_tail_up = 4;
    type_tail_right = 5;
    type_tail_left = 6;
    type_tail_down = 7;

    direction_right = 0;
    direction_down = 1;
    direction_left = 2;
    direction_up = 3;

    mode_edit = 0;
    mode_new_delete = 1;
    mode = this.mode_edit;

    lastMessage = null;
    finished = false;

    getCharForType(type) {
        switch (type) {
            case this.type_none:
                return ':white_square:';
            case this.type_cookie:
                return ':cookie:';
            case this.type_cat_head:
                return ':nyan-3:';
            case this.type_cat_body:
                return ':nyan-2:';
            case this.type_tail_up:
                return ':nyan-1:';
            case this.type_tail_right:
                return ':nyan-1:';
            case this.type_tail_left:
                return ':nyan-1:';
            case this.type_tail_down:
                return ':nyan-1:';
        }
    }

    field = [];
    size = 14;

    direction = this.direction_right;

    snake = [];
    cookie = {};

    getFieldIndex(x, y) {
        return y * this.size + x;
    }

    initializeField() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                this.field[this.getFieldIndex(x, y)] = this.type_none;
            }
        }

        const head = {x: this.size / 2, y: this.size / 2};

        this.snake.unshift({x: head.x - 1, y: head.y});
        this.snake.unshift({x: head.x, y: head.y});
        this.direction = this.direction_right;
        this.newCookie();
    }

    printField() {
        let retVal = '';
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                retVal += this.getCharForType(this.field[this.getFieldIndex(x, y)]);
            }
            retVal += "\r\n";
        }
        return retVal;
    }

    newCookie() {
        this.cookie = {x: Math.floor(Math.random() * (this.size - 1)), y: Math.floor(Math.random() * (this.size - 1))};
    }

    tick() {
        const newHead = {x: this.snake[0].x, y: this.snake[0].y};

        switch (this.direction) {
            case this.direction_up:
                newHead.y--;
                break;
            case this.direction_right:
                newHead.x++;
                break;
            case this.direction_left:
                newHead.x--;
                break;
            case this.direction_down:
                newHead.y++;
                break;
        }

        // snake 2.0 logic
        if (newHead.x >= this.size) {
            newHead.x = 0;
        }
        if (newHead.x < 0) {
            newHead.x = this.size - 1;
        }
        if (newHead.y >= this.size) {
            newHead.y = 0;
        }
        if (newHead.y < 0) {
            newHead.y = this.size - 1;
        }
        this.snake.unshift(newHead);

        if (!(newHead.x === this.cookie.x && newHead.y === this.cookie.y)) {
            this.snake.pop();
        } else {
            this.newCookie();
        }

        // check finished
        for (let i = 1; i < this.snake.length; i++) {
            if (newHead.x === this.snake[i].x && newHead.y === this.snake[i].y) {
                this.finished = true;
            }
        }

        //redraw field
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                this.field[this.getFieldIndex(x, y)] = this.type_none;
            }
        }
        // draw snake
        for (let i = 0; i < this.snake.length; i++) {
            const f = this.getFieldIndex(this.snake[i].x, this.snake[i].y);
            if (0 === i) {
                this.field[f] = this.type_cat_head;
            } else if (1 === i) {
                this.field[f] = this.type_cat_body;
            } else {
                this.field[f] = this.type_tail_right;
            }
        }

        // draw cookie
        console.log(this.cookie);
        this.field[this.getFieldIndex(this.cookie.x, this.cookie.y)] = this.type_cookie;

    }
}

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

const games = [];

app.message('game', async ({message, say}) => {
    const game = new Game();
    game.initializeField();
    games[message.channel] = game;
    await say('started game');
});

app.message('game2', async ({message, say}) => {
    const game = new Game();
    game.initializeField();
    game.mode = game.mode_new_delete;
    games[message.channel] = game;
    await say('started game');
});
app.message('quit', async ({message, say}) => {
    const game = games[message.channel];
    if (undefined === game) {
        return;
    }
    game.finished = true;
});
//<editor-fold desc="Direction commands">
app.message('left', async ({message, say}) => {
    const game = games[message.channel];
    if (undefined === game) {
        return;
    }
    game.direction = game.direction_left;
});
app.message('right', async ({message, say}) => {
    const game = games[message.channel];
    if (undefined === game) {
        return;
    }
    game.direction = game.direction_right;
});
app.message('down', async ({message, say}) => {
    const game = games[message.channel];
    if (undefined === game) {
        return;
    }
    game.direction = game.direction_down;
});
app.message('up', async ({message, say}) => {
    const game = games[message.channel];
    if (undefined === game) {
        return;
    }
    game.direction = game.direction_up;
});
//</editor-fold>



(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000)
        .then(_ => {
            // app.client.chat.postMessage({
            //     token: process.env.SLACK_BOT_TOKEN,
            //     channel: 'C011D2E4SQ6',
            //     text: 'Started snake game :)'
            // })
            //     .then(async res => {
            //             setTimeout(async () => {
            //
            //             }, 1000)
            //         }
            //     ).catch(console.error);
        });
})();

// game loop
(async () => {
    while (true) {
        await Sleep(1000);
        for (let channelToken in games) {
            const game = games[channelToken];
            if (game.finished) {
                delete games[channelToken];
                app.client.chat.postMessage({
                    token: process.env.SLACK_BOT_TOKEN,
                    channel: channelToken,
                    text: 'game over',
                });
                continue;
            }
            game.tick();

            if (game.mode_edit === game.mode) {
                if (null === game.lastMessage) {
                    const response = await app.client.chat.postMessage({
                        token: process.env.SLACK_BOT_TOKEN,
                        channel: channelToken,
                        text: game.printField()
                    });
                    game.lastMessage = response.message.ts;
                }
                await app.client.chat.update({
                    token: process.env.SLACK_BOT_TOKEN,
                    channel: channelToken,
                    ts: game.lastMessage,
                    text: game.printField()
                });
            }
            if (game.mode_new_delete === game.mode) {
                const response = await app.client.chat.postMessage({
                    token: process.env.SLACK_BOT_TOKEN,
                    channel: channelToken,
                    text: game.printField()
                });
                if (null !== game.lastMessage) {
                    await app.client.chat.delete({
                        token: process.env.SLACK_BOT_TOKEN,
                        channel: channelToken,
                        ts: game.lastMessage
                    });
                }
                game.lastMessage = response.message.ts;
            }

        }
    }
})();


function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
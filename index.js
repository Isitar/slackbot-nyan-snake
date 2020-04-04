const dotenv = require('dotenv');
dotenv.config();
const {App} = require('@slack/bolt');


class Game {
    type_none = 0;
    type_cookie = 1;
    type_cat = 2;

    lastMessage = null;

    getCharForType(type) {
        switch (type) {
            case this.type_none:
                return ':white_square:';
            case this.type_cookie:
                return ':cookie:';
            case this.type_cat:
                return ':cat:';
        }
    }

    field = [];
    size = 10;

    getFieldIndex(x, y) {
        return y * this.size + x;
    }

    initializeField() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                this.field[this.getFieldIndex(x, y)] = this.type_none;
            }
        }

        this.field[this.getFieldIndex(this.size / 2, this.size / 2)] = this.type_cat;
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
}

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.message('hello', async ({message, say}) => {
    // say() sends a message to the channel where the event was triggered
    await say(`Sali <@${message.user}>!`);
});

const games = [];

app.message('game', async ({message, say}) => {
    const game = new Game();
    game.initializeField();
    games[message.channel] = game;
    await say('started game');
});

(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000)
        .then(_ => {

            app.client.chat.postMessage({
                token: process.env.SLACK_BOT_TOKEN,
                channel: 'C011D2E4SQ6',
                text: 'hello world :)'
            })
                .then(async res => {
                        setTimeout(async () => {

                        }, 1000)
                    }
                ).catch(console.error);
        });


    console.log('⚡️ Bolt app is running!');
})();

// game loop
(async () => {
    while (true) {
        await Sleep(1000);
        for (let channelToken in games) {
            const game = games[channelToken];
            if (null !== game.lastMessage) {
                console.log('last message was', game.lastMessage)
                await app.client.chat.delete({
                    token: process.env.SLACK_BOT_TOKEN,
                    channel: channelToken,
                    ts: game.lastMessage
                });
            }
            const response = await app.client.chat.postMessage({
                token: process.env.SLACK_BOT_TOKEN,
                channel: channelToken,
                text: game.printField()
            });
            game.lastMessage = response.message.ts;
        }
    }
})();


function Sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
const config = require('../config.json');
const prefix = config.prefix;
const joke = require('../resources/random/jokes.json');

module.exports = {
	name: 'joke',
	description: 'Tells a very funny joke',
    usage: '`xd)joke`',
    category: 'meme',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        let length = joke.data.length;
        
		return message.channel.send(joke.data[Math.floor(Math.random() * (length - 1))]);

        
    },
};
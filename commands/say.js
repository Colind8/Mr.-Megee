const config = require('../config.json');
const prefix = config.prefix;
const say = require('../resources/random/say.json');

module.exports = {
	name: 'say',
	description: 'lore command',
    usage: '`xd)say [text]`',
    category: 'lore',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        var arg = message.content.slice(prefix.length + 4).trim();
        arg = arg.slice(0,(arg.length / 3) + 1);
        let length = say.data.length;
        
        if (Math.floor(Math.random() * 20) == 0) {
            return message.channel.send(arg + "... eh nah")
        } else {
            return message.channel.send(say.data[Math.floor(Math.random() * (length - 1))]);
        }

    },
};
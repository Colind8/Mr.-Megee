const config = require('../config.json');
const prefix = config.prefix;

module.exports = {
	name: 'sotw',
	description: 'lore command',
    usage: '`xd)sotw`',
    category: 'lore',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        
		return message.channel.send("https://www.youtube.com/watch?v=SqZNMvIEHhs");

        
    },
};
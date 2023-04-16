const config = require('../config.json');
const prefix = config.prefix;

module.exports = {
	name: 'getreal',
	description: 'getreal',
    usage: '`xd)getreal`',
    category: 'lore',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        
		return message.channel.send("https://cdn.discordapp.com/attachments/912917467167326219/984697297801732116/megeethereal.png");

        
    },
};
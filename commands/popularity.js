const config = require('../config.json');
const prefix = config.prefix;
/*const { Client, Intents, Collection } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });*/

module.exports = {
	name: 'popularity',
	description: 'Shows the amount of servers Mr. Megee is in',
    usage: '`xd)popularity`',
    category: 'utility',
	async execute(message) {
        const data = require('../resources/data.json');
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        
		return message.channel.send("Serving on " + data.servers + " servers.");

        
    },
};
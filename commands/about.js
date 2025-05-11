const config = require('../config.json');
const prefix = config.prefix;
/*const { Client, Intents, Collection } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });*/

module.exports = {
	name: 'about',
	description: 'View information about the bot',
    usage: '`xd)about`',
    category: 'utility',
	async execute(message) {
        const data = require('../resources/data.json');
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        
		about_message = "";
		about_message += `# __About Mr. Megee__\n-# Serving on ${data.servers} servers\n`
		about_message += `Mr. Megee was created by Colind8 with the help of MomentarilyDisabled and the support of Cic1e and various other friends.\n`
		about_message += `## __Links__\nDiscord server: https://discord.gg/c7hq5PMhqV\nGithub: https://github.com/Colind8/Mr.-Megee`
		return message.channel.send(about_message);

        
    },
};
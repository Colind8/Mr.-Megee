const config = require('../config.json');
const prefix = config.prefix;

module.exports = {
	name: 'invite',
	description: "Returns the invite for the bot",
    usage: '`xd)invite`',
    category: 'utility',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        
		return message.channel.send("Bot Invite: https://discord.com/api/oauth2/authorize?client_id=472812336214966283&permissions=313408&scope=bot\n\nServer Invite: https://discord.gg/c7hq5PMhqV");

        
    },
};
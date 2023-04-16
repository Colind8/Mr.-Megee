const config = require('../config.json');
const prefix = config.prefix;

module.exports = {
	name: 'love',
	description: 'Test the LOVE between two people',
    usage: '`xd)love <@someone> <@someone>`',
    category: 'lore',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
		
		const messages = message.channel.guild.channels.cache;
        
		return console.log(messages);

        
    },
};
const config = require('../config.json');
const prefix = config.prefix;

module.exports = {
	name: 'nuke',
	description: 'Nuke somebody!',
    usage: '`xd)nuke [@someone]`',
    category: 'meme',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        

        if (args[0]) {
            const user = getUserFromMention(args[0]);
            if(!user) {
                return message.reply('Who?')
            }

            for (i = 0; i < 20; i++) {
                message.channel.send(`${user} is being nuked!`);
            }
            return message.channel.send(`${user} has been nuked!`);
        }

        for (i = 0; i < 20; i++) {
                message.channel.send(`${message.author} is being nuked!`);
            }
        return message.channel.send(`${message.author} has been nuked!`);

        function getUserFromMention(mention) {
	        if (!mention) return;

    	    if (mention.startsWith('<@') && mention.endsWith('>')) {
		        mention = mention.slice(2, -1);

		        if (mention.startsWith('!')) {
			        mention = mention.slice(1);
		        }

		    return message.mentions.users.get(mention);
	        }
        }
    },
};


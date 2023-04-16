const config = require('../config.json');
const prefix = config.prefix;
const snowballz = require('../resources/random/snowball.json');

module.exports = {
	name: 'snowball',
	description: 'Chuck a snowball at your friend',
    usage: '`xd)snowball <@someone>`',
    category: 'others',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        
		if (args[0]) {
            const user = getUserFromMention(args[0]);
            if(!user) {
                return message.reply('Who?')
            }
            if(message.author.id == '206312851659292675' || Math.floor(Math.random() * 100 + 1) > 90) {
                return message.channel.send(`Plop. YOU MISSED!!!!`);
            }
            let length = snowballz.data.length;

            return message.channel.send(`${message.author} threw a snowball at ${user}!\n`+ snowballz.data[Math.floor(Math.random() * (length - 1))])
        } else {
            return message.channel.send(`Please specify who you're throwing a snowball at.`)
        }

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
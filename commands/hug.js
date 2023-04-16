const config = require('../config.json');
const prefix = config.prefix;
const hugImages = require('../resources/random/hug.json');
const hugSelfImages = require('../resources/random/hugself.json');

module.exports = {
	name: 'hug',
	description: 'Give somebody a hug!',
    usage: '`xd)hug <@someone>`',
    category: 'others',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        
		if (args[0]) {
            const user = getUserFromMention(args[0]);
            if(!user) {
                return message.reply('Who?')
            }
            if(user == message.author) {
                let length = hugSelfImages.data.length;
                
                return message.channel.send(`${message.author} hugged yourself.\n`+ hugSelfImages.data[Math.floor(Math.random() * (length - 1))])
            }
            let length = hugImages.data.length;

            return message.channel.send(`${message.author} gave ${user} a hug!\n`+ hugImages.data[Math.floor(Math.random() * (length - 1))])
        } else {
            return message.channel.send(`Please specify who you're hugging.`)
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


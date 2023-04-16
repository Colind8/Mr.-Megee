const config = require('../config.json');
const { MessageEmbed } = require('discord.js');
const prefix = config.prefix;

module.exports = {
	name: 'user',
	description: `Returns a user's info`,
    usage: '`xd)user [@someone]`',
    category: 'utility',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
		
		if (args[0]) {
            user = getUserFromMention(args[0]);
            if(!user) {
                return message.reply('Who?')
            }
        } else {
            user = message.author;
        }

		// inside a command, event listener, etc.
		const exampleEmbed = new MessageEmbed()
			.setTitle(user.username)
			.setAuthor({ name: user.tag})
			.setDescription(`Created <t:${Math.floor(user.createdAt.getTime() / 1000)}:R>`)
			.setThumbnail(user.displayAvatarURL({ format: 'png', size: 1024}))
			/*.addFields(
				{ name: 'Inline field title', value: 'Some value here', inline: true },
				{ name: 'Inline field title', value: 'Some value here', inline: true }
			)*/
			.setFooter({ text: user.id, size: 1024 });

		return message.channel.send({ embeds: [exampleEmbed] });
        
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
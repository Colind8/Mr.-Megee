const config = require('../config.json');
const { MessageEmbed } = require('discord.js');
const prefix = config.prefix;
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./megee.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);

module.exports = {
	name: 'user',
	description: `Returns a user's info`,
    usage: '`xd)user [@someone]`',
    category: 'utility',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
		
		
		if (args[0]) {
			userid = args[0];
			if (userid.startsWith('<@') && userid.endsWith('>')) {
				userid = userid.slice(2, -1);

				if (userid.startsWith('!')) {
					userid = userid.slice(1);
				}
			}
            if(!userid) {
				console.log(message.client.users.fetch(args[0]));
                return message.reply('Who?')
            }
        } else {
            userid = message.author.id;
        }
		
		/*

		// inside a command, event listener, etc.
		const exampleEmbed = new MessageEmbed()
			.setTitle(user.username)
			.setDescription(`Created <t:${Math.floor(user.createdAt.getTime() / 1000)}:R>`)
			.setThumbnail(user.displayAvatarURL({ format: 'png', size: 1024}))
			/*.addFields(
				{ name: 'Inline field title', value: 'Some value here', inline: true },
				{ name: 'Inline field title', value: 'Some value here', inline: true }
			)
			.setFooter({ text: user.id, size: 1024 });

		return message.channel.send({ embeds: [exampleEmbed] });
        */
		
		db.get(`SELECT * FROM users WHERE userid = ?`,[userid], async (error, results) => {
			if (!results) {
				try {
					user = await message.client.users.fetch(userid);
				} catch {
					return message.reply('Who?');
				}
				if(!user) {
					return message.reply('Who?');
				}
				usercolor = await message.guild.members.fetch(userid);
				
				const userembed = new MessageEmbed()
					.setTitle(user.username)
					.setDescription(`Created <t:${Math.floor(user.createdAt.getTime() / 1000)}:R>`)
					.setThumbnail(user.displayAvatarURL({ format: 'png', size: 1024}))
					.setFooter({ text: user.id, size: 1024 })
					.setColor(usercolor.displayHexColor);

				return message.channel.send({ embeds: [userembed] });
			} else {
				try {
					user = await message.client.users.fetch(userid);
				} catch {
					return message.reply('Who?');
				}
				if(!user) {
					return message.reply('Who?');
				}
				if (results.profilepic == 'default') {
					results.profilepic = user.displayAvatarURL({ format: 'png', size: 1024});
				}
				
				const userembed = new MessageEmbed()
					.setTitle(results.name)
					.setDescription(results.bio)
					.setThumbnail(results.profilepic)
					.setImage(results.images)
					.setFooter({ text: results.userid.toString(), size: 1024 })
					.setColor(results.color);

				return message.channel.send({ embeds: [userembed] });
			}
		});
		
		function getUserFromMention(mention) {
			if (!mention) return;
			
		}
    },
};
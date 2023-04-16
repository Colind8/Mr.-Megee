const fs = require('fs');
const config = require('../config.json');
const prefix = config.prefix;
const color = "#c6c6c6";
const { MessageEmbed } = require('discord.js');
commands = new Map();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

/*
CATEGORIES
help - help command only
lore - not shown in the help command
utility
meme
games
others
*/

module.exports = {
	name: 'help',
	description: 'Shows the help page',
    usage: '`xd)help [category]`',
    category: 'help',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        
		if(!args[0]) {
            var description = "";
            
            for (const file of commandFiles) {
	            let command_data = require(`../commands/${file}`);
	            // set a new item in the Collection
	            // with the key as the command name and the value as the exported module
                if(command_data.category == "help") {
                    description = description + command_data.usage + " -- " + command_data.description + "\n\n";
                }
            }
            description = description + "**__UTILITY__**\n";
            for (const file of commandFiles) {
	            let command_data = require(`../commands/${file}`);
	            // set a new item in the Collection
	            // with the key as the command name and the value as the exported module
                if(command_data.category == "utility") {
                    description = description + command_data.usage + " -- " + command_data.description + "\n";
                }
            }
            description = description + "**__MEME__**\n";
            for (const file of commandFiles) {
	            let command_data = require(`../commands/${file}`);
	            // set a new item in the Collection
	            // with the key as the command name and the value as the exported module
                if(command_data.category == "meme") {
                    description = description + command_data.usage + " -- " + command_data.description + "\n";
                }
            }
            description = description + "**__GAMES__**\n";
            for (const file of commandFiles) {
	            let command_data = require(`../commands/${file}`);
	            // set a new item in the Collection
	            // with the key as the command name and the value as the exported module
                if(command_data.category == "games") {
                    description = description + command_data.usage + " -- " + command_data.description + "\n";
                }
            }
            description = description + "**__OTHERS__**\n";
            for (const file of commandFiles) {
	            let command_data = require(`../commands/${file}`);
	            // set a new item in the Collection
	            // with the key as the command name and the value as the exported module
                if(command_data.category == "others") {
                    description = description + command_data.usage + " -- " + command_data.description + "\n";
                }
            }

            const help = new MessageEmbed()
	            .setColor(color)
	            .setTitle("Help")
	            .setDescription(description)
	            .setThumbnail("https://cdn.discordapp.com/attachments/510953636084449316/552848757557821475/Megee.png")
                .setImage("https://cdn.discordapp.com/attachments/467429580953747466/480619950424457227/xd.gif")
                .setFooter("Mr. Megee")

            return message.channel.send({ embeds: [help] });
        } else if (args[0] == "utility") {
            var description = "";
            for (const file of commandFiles) {
	            let command_data = require(`../commands/${file}`);
	            // set a new item in the Collection
	            // with the key as the command name and the value as the exported module
                if(command_data.category == "utility") {
                    description = description + command_data.usage + " -- " + command_data.description + "\n";
                }
            }
            const help = new MessageEmbed()
	            .setColor(color)
	            .setTitle("Help: Utility")
	            .setDescription(description)
	            .setThumbnail("https://cdn.discordapp.com/attachments/510953636084449316/552848757557821475/Megee.png")
                .setImage("https://cdn.discordapp.com/attachments/467429580953747466/480619950424457227/xd.gif")
                .setFooter("Mr. Megee")

            return message.channel.send({ embeds: [help] });
        }
    }
}
//await client.commands.get(command).execute(message);
//return message.channel.send({ embeds: [help] });
const help = new MessageEmbed()
	.setColor(color)
	.setTitle("Help: to be renovated")
	.setDescription("`xd)help` -- help\n`xd)hug [person]` -- hug someone\n`xd)nuke [person]` -- nuke someone\n`xd)ping` -- pong\n`xd)pong` -- ping\n`xd)popularity` -- server count\n`xd)userinfo` -- info about you\n`xd)idle` -- The Mr. Megee Idle Game\n`xd)invite` -- Bot/Server invite")
	.setThumbnail("https://cdn.discordapp.com/attachments/510953636084449316/552848757557821475/Megee.png")
    .setImage("https://cdn.discordapp.com/attachments/467429580953747466/480619950424457227/xd.gif")
    .setFooter("Mr. Megee")
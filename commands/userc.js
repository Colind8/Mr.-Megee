const config = require('../config.json');
const prefix = config.prefix;
const { MessageEmbed } = require('discord.js');
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./megee.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);

module.exports = {
	name: 'userc',
	description: 'Customize your xd)user profile',
    usage: '`xd)userc <option> [input]`',
    category: 'utility',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        
		if (!args[0]) {
			const userchelp = new MessageEmbed()
				.setTitle(`xd)userc`)
				.setDescription("Use `xd)userc <option> [input]` to customize your xd)user profile. Below are the following options and their required inputs.")
				.addFields(
				{
					"name": "option",
					"value": "- name\n- bio\n- pic\n- image\n- color",
					"inline": true
				},
				{
					"name": "input type",
					"value": "- text\n- text\n- image url\n- image url\n- hex code",
					"inline": true
				},
				{
					"name": "option description",
					"value": "- name: Your name, will be the title of the embed.\n- bio: Your bio, will be the description of the embed.\n- pic: Your profile picture, an image that is displayed on the side of the embed. Write \"default\" to just use your current profile picture.\n- image: A large image that will be displayed under the description.\n- color: The color of the embed."
				})

			return message.channel.send({ embeds: [userchelp] });
		}
		
		db.get(`SELECT * FROM users WHERE userid = ?`,[message.author.id], async (error, results) => {
			if (!args[1]) {
				args[1] = "";
			}
			
			if (args[0] == "name") {
				if (args[1].length > 256) {
					return message.channel.send("Name must be under 256 characters!");
				}
				try {
					db.run(`UPDATE users SET name = ? WHERE userid = ?`, [args[1], message.author.id]);
					return message.channel.send(`Changed name from ${results.name} to ${args[1]}`);
				} catch (error) {
					console.log(error);
					return message.channel.send("An error has occured!");
				}
			}
			
			if (args[0] == "bio") {
				if (args[1].length > 4096) {
					return message.channel.send("Bio must be under 4096 characters!");
				}
				try {
					db.run(`UPDATE users SET bio = ? WHERE userid = ?`, [args[1], message.author.id]);
					return message.channel.send(`Changed bio successfully!`);
				} catch (error) {
					console.log(error);
					return message.channel.send("An error has occured!");
				}
			}
			
			if (args[0] == "pic") {
				if (args[1].length > 128) {
					return message.channel.send("Pic link must be under 128 characters!");
				}
				try {
					db.run(`UPDATE users SET pic = ? WHERE userid = ?`, [args[1], message.author.id]);
					return message.channel.send(`Changed pic from ${results.pic} to ${args[1]}`);
				} catch (error) {
					console.log(error);
					return message.channel.send("An error has occured!");
				}
			}
			
			if (args[0] == "image") {
				if (args[1].length > 128) {
					return message.channel.send("Image link must be under 128 characters!");
				}
				try {
					db.run(`UPDATE users SET image = ? WHERE userid = ?`, [args[1], message.author.id]);
					return message.channel.send(`Changed image from ${results.image} to ${args[1]}`);
				} catch (error) {
					console.log(error);
					return message.channel.send("An error has occured!");
				}
			}
			
			if (args[0] == "color") {
				if (args[1].length != 7) {
					return message.channel.send("Color must be formatted in hexadecimal. Ex. `#123456`");
				}
				try {
					db.run(`UPDATE users SET color = ? WHERE userid = ?`, [args[1], message.author.id]);
					return message.channel.send(`Changed color from ${results.color} to ${args[1]}`);
				} catch (error) {
					console.log(error);
					return message.channel.send("An error has occured!");
				}
			}
		});

        
    },
};
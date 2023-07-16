const config = require('../config.json');
const prefix = config.prefix;
const fs = require('fs');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'quote',
	description: 'Create or recieve a quote.',
    usage: '`xd)quote [create quote]`',
    category: 'meme',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        var arg = message.content.slice(prefix.length + 6);
        var file = fs.readFileSync('./resources/quote.txt').toString();
        var dataobj = JSON.parse(file);
        let length = dataobj.data.length
        
        if (!args[0]) {
            let select = dataobj.data[Math.floor(Math.random() * (length))]
            select.content = select.content.trim()
			const embed = new MessageEmbed()
				.setColor("#c6c6c6")
				.setDescription(`*"` + select.content + `"*`)
				.setFooter("Submitted by " + select.name)
            
            return message.channel.send({embeds: [embed]});
        } else {
			if(arg.includes(`*`) || arg.includes(`@`)) {
                return message.channel.send("Your quote cannot contain `\"`, `*`, or `@`");
            }
            if(arg.includes(`"`)) {
                return message.channel.send("Your quote cannot contain `\"`, `*`, or `@`. If you are trying to quote within your quote, use single quotations 'like this'");
            }
			if(arg.length > 1500) {
                return message.channel.send("Your quote is too long!");
            }
            let poop = { // Create object to add to the json array
                "name": message.author.username,
                "content": arg
            }
            dataobj.data.push(poop); // Push the object to the array
            let a = JSON.stringify(dataobj); // Convert the javascript object to json string
            fs.writeFileSync("./resources/quote.txt", a); // Replace the old data with the new string
            return message.channel.send("Quote Created!\n\n*\"" + arg + "\"*\n-" + message.author.username);
        }
        
    },
};
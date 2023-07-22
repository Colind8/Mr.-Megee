const config = require('../config.json');
const prefix = config.prefix;
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'r/',
	description: 'Get a random post on a subreddit',
    usage: '`xd)r/ <subreddit>`',
    category: 'others',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
		
		
		const response = await fetch("https://api.reddit.com/r/" + args[0] + "?limit=150");
		const data = await response.json();
		try {
			if (data.data.after == null) {
				return message.channel.send("Invalid subreddit.");
			}
		}
		catch {
			return message.channel.send("Invalid subreddit.");
		}
		const rand = Math.floor(Math.random() * data.data.children.length);
		const selection = data.data.children[rand].data;
		var desc;
		var text;
		var title;
		var type;
		
		if (selection.over_18 == true && message.channel.nsfw == false) {
			return message.channel.send("The post retrieved is NSFW. Consider using a NSFW channel.")
			
		}
		
		if (selection.upvote_ratio > 0.60) {
			desc = "<:upvote:983602239618842684> " + (selection.upvote_ratio * 100) + "%";
		} else {
			desc = "<:downvote:983602238494748683>" + (selection.upvote_ratio * 100) + "%";
		}
		
		if (selection.title.length > 250) {
			title = selection.title.slice(0,250) + "...";
		} else {
			title = selection.title;
		}
		
		if (!selection.post_hint) {
			type = "self";
		} else {
			type = selection.post_hint;
		}
		
		if (selection.selftext.length > 2000) {
			text = selection.selftext.slice(0,2000) + "...";
		} else {
			text = selection.selftext;
		}
		
		var author_url = 'https://reddit.com/user/' + selection.author;
		var author_name = selection.author;
		var post_link = 'https://reddit.com' + selection.permalink;
		
		switch (type) {
			case "image":
				var embed1 = new MessageEmbed()
					.setColor("#FF4500")
					.setTitle(title)
					.setAuthor({name: author_name, url: author_url})
					.setURL('https://reddit.com' + selection.permalink)
					.addFields({name: desc, value: selection.url})
					.setImage(selection.url)
					.setFooter({text: selection.subreddit_name_prefixed});
				return message.channel.send({ embeds: [embed1] });
				break;
			case "link":
				var embed2 = new MessageEmbed()
					.setColor("#FF4500")
					.setTitle(title)
					.setAuthor({name: author_name, url: author_url})
					.setURL('https://reddit.com' + selection.permalink)
					.addFields({name: desc, value: selection.url})
					.setThumbnail(selection.thumbnail)
					.setFooter({text: selection.subreddit_name_prefixed});
				return message.channel.send({ embeds: [embed2] });
				break;
			case "self":
				var embed3 = new MessageEmbed()
					.setColor("#FF4500")
					.setTitle(title)
					.setAuthor({name: author_name, url: author_url})
					.setURL('https://reddit.com' + selection.permalink)
					.setDescription(text)
					.addFields({name: desc, value: selection.url})
					.setFooter({text: selection.subreddit_name_prefixed});
				return message.channel.send({ embeds: [embed3] });
				break;
			case "hosted:video":
				var embed4 = new MessageEmbed()
					.setColor("#FF4500")
					.setTitle(selection.title)
					.setAuthor({name: author_name, url: author_url})
					.setURL('https://reddit.com' + selection.permalink)
					.addFields({name: desc, value: selection.url})
					.setThumbnail(selection.thumbnail)
					.setFooter({text: selection.subreddit_name_prefixed});
				return message.channel.send({content: post_link/*, embeds: [embed4] */});
				break;
			case "rich:video":
				var embed4 = new MessageEmbed()
					.setColor("#FF4500")
					.setTitle(selection.title)
					.setAuthor({name: author_name, url: author_url})
					.setURL('https://reddit.com' + selection.permalink)
					.setDescription("Click link to watch video.")
					.addFields({name: desc, value: selection.url})
					.setThumbnail(selection.thumbnail)
					.setFooter({text: selection.subreddit_name_prefixed});
				return message.channel.send({ embeds: [embed4] });
				break;
		}
		
        
		

        
    },
};
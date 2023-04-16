const config = require('../config.json');
const prefix = config.prefix;

module.exports = {
	name: 'react',
	description: 'Count and organize the reactions of multiple messages',
    usage: '`xd)react <amount of messages>`',
    category: 'utility',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        const message_count = parseInt(args[0]);
		var react_array = [];
		var leaderboard = "";
		
		if (Number.isNaN(message_count) || (message_count > 40 || message_count < 1)) {
			return message.channel.send("You must use a number less than 40.");
		} else {
			message.channel.messages.fetch({limit: message_count + 1})
		.then(m => {
			m.each(c => 
				c.reactions.cache.each(r =>
					add_to_array(r._emoji.name, r._emoji.id, r.count)
				)
			);
			sort_data();
		}
		);
		}

		
		function add_to_array (name, id, count) {
			if(id == null) {
				react_array.push({emote:name,count:count})
			} else {
				react_array.push({emote:"<:" + name + ":" + id + ">",count:count})
			}
			
		}
		
		function sort_data() {
			if (react_array.length <= 0) {
				return message.channel.send("No reactions found");
			}
			
			react_array.sort(function(a, b){return a.count - b.count});
			react_array.reverse();
			
			for(i=0; i < react_array.length; i++) {
				leaderboard += react_array[i].count + " - " + react_array[i].emote;
				leaderboard += "\n";
			}
			
			return message.channel.send(leaderboard);
		}
		
		
		
		
		
		
		/*message.channel.messages.fetch({limit: message_count + 1})
		.then(m => m.each(c => 
		c.reactions.cache.each(r =>
		react_array.push({emote:r.emote.name,count:})
		
		))));
		*/

        
    },
};
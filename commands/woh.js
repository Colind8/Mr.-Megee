const config = require('../config.json');
const prefix = config.prefix;
const fs = require('fs');


module.exports = {
	name: 'woh',
	description: 'woh',
    usage: '`xd)woh`',
    category: 'lore',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
		var dataobj = require('../resources/woh.json');
		
		if ( (message.author.id != 207901876434370562) && (message.author.id != 206312851659292675) ) {
			return message.channel.send("Sorry, you can't use this command!");
		}
        
		switch (args[0]) {
			case "start":
				dataobj.data.active = true;
				fs.writeFileSync("./resources/woh.json", JSON.stringify(dataobj));
				return message.channel.send("woh counter started!");
			case "stop":
				dataobj.data.active = false;
				fs.writeFileSync("./resources/woh.json", JSON.stringify(dataobj));
				return message.channel.send("woh counter stopped!");
			case "leaderboard":
				let leaderboard_string = "";
				let leaderboard_array = dataobj.user_data;
				leaderboard_array.sort(function(a, b){return a.score - b.score});
				leaderboard_array.reverse();
				
				for(let i = 0; i < leaderboard_array.length; i++) {
					leaderboard_string += `${i + 1}. **[${leaderboard_array[i].score}]** ${leaderboard_array[i].name}\n`;
				}
				
				return message.channel.send(leaderboard_string);
			case "streak":
				return message.channel.send(`Current woh streak: ${dataobj.data.streak}`);
			case "total":
				return message.channel.send(`Total amount of woh: ${dataobj.data.total}`);
			case "reset":
				dataobj.data.active = false;
				dataobj.data.streak = 0;
				dataobj.data.total = 0;
				dataobj.user_data = [];
				fs.writeFileSync("./resources/woh.json", JSON.stringify(dataobj));
				return message.channel.send(`woh data reset!!!`);
		}
	}
};
const config = require('../config.json');
const prefix = config.prefix;

module.exports = {
	name: 'nuke',
	description: 'Nuke somebody!',
    usage: '`xd)nuke [@someone] [# of pings]`',
    category: 'meme',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(" ");
	    const command = args.shift().toLowerCase();
        var pn = 20;
        
        if (args[1]) { 
			pn = args[1] // pn = "ping number" or "number of pings"
            if(isNaN(args[1])) { // is [# of pings] argument NaN, which also deals with empty string
                pn = 20;
            }
            if(args[1] > 20) { // if [# of pings] greater than 20, set to 20
                pn = 20;
            }
            if(args[1] < 2) {
                pn = 2;
            }
        }
        
        if (args[0]) {
            user = getUserFromMention(args[0]);
            if(!user) {
                return message.reply('Who?')
            }
        } else {
			user = message.author;
		}
		
		return nuke(user);

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
		
		async function nuke(user) {
			for (i = 0; i < pn-1; i++) {
                await timeout(1000);
				message.channel.send(`${user} is being nuked!`);
            }
			
			return message.channel.send(`${user} has been nuked!`);
		}
		
		function timeout(ms) {
			//return setTimeout(actually_send_message, ms);
			return new Promise(resolve => setTimeout(resolve, ms));
		}
		
		
    },
};


const config = require('../config.json');
const prefix = config.prefix;

module.exports = {
	name: 'rps',
	description: 'Battle Mr. Megee in ROCK PAPER SCISSORS!!!',
    usage: '`xd)rps <rock/paper/scissors>`',
    category: 'games',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
		
		switch (args[0]) {
			case "rock":
				return message.channel.send("I choose... :roll_of_paper:**Paper!** You lose!");
				break;
			case "paper":
				return message.channel.send("I choose... :carpentry_saw:**Scissors!** You lose!");
				break;
			case "scissors":
				return message.channel.send("I choose... :metal:**Rock!** You lose!");
				break;
			default:
				return message.channel.send("You need to specify rock, paper, or scissors!");
				break;
		}
        
		

        
    },
};
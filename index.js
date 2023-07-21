const config = require('./config.json');
const { Client, Intents, Collection } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

client.login(config.token); //either "token" or "devtoken"
const prefix = config.prefix; //either "prefix" or "devprefix"

const fs = require('fs');
const idle = require('./resources/idle/idle_2.json');
const unrecognizedCommands = require('./resources/random/unrecognized.json');
const phrases = require('./resources/random/phrases.json');
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./megee.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command_data = require(`./commands/${file}`);
	client.commands.set(command_data.name, command_data);
}


client.once('ready', () => {
    console.log('\n+---==| Mr. Megee |==---');
	console.log('| Ready!');
    console.log('| Serving on ' + client.guilds.cache.size + ' servers');
    let count = client.guilds.cache.size
    fs.writeFileSync("./resources/data.json", `{"servers": `+ count + `}`);
    console.log('+-----------------------\n');
});

client.on('messageCreate', async message => {
	try {
		const {content} = message;
	} catch (error) {
		return;
	}
    if (message.author.bot) return;
	
	if (!message.content.startsWith(prefix)) { // Idle
		db.get(`SELECT * FROM idle WHERE userid = ?`,[message.author.id], (error, results) => {
			if (error) {
				throw error;
			}
			
			if(results) {
				var key = JSON.parse(results.data);
				
				if (key.ver != 2) {
					return;
				}
				
				reaction = idling(key, message);
				
				// SUPER DEBUG
				if (config.idle_debug == 1) {
					console.log(Date() + " - " + " \""+ message.content +"\" ---\n");
					console.log(key);
					console.log("\n\n");
				}
				
				if (reaction.length > 0) {
					for(i=0; i < reaction.length; i++) {
						message.react(reaction[i]);
					}
					
				}
			}
		});
	}
	
    
    if (!message.content.startsWith(prefix)) { // Sentient phrases
		if((Math.floor(Math.random() * 25000) == 1) && message.content.length > 0) { //1 in 25000 chance to say a "phrase"
			phrase = phrases.data[Math.floor(Math.random() * (phrases.data.length))];
			//console.log(phrase);
			if(phrase == "[chicken]") {
				chicken1 = message.content;
				chicken2 = "";
				for (i = 0; i < chicken1.length; i++) {
					b = chicken1.toUpperCase().charAt(i);
					a = chicken1.toLowerCase().charAt(i);
					if (i % 2 == 0) {
						chicken2 += a;
					} else {
						chicken2 += b;
					}
				}
				return message.channel.send(chicken2);
			} else {
				return message.channel.send(phrase);
			}
		} else {
			return;
		}
	};
    

    const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) {
        let length = unrecognizedCommands.data.length;

        return message.channel.send(unrecognizedCommands.data[Math.floor(Math.random() * (length - 1))])
    }

    try {
		await client.commands.get(command).execute(message);
	} catch (error) {
		try {
			console.error(error);
			await message.reply('*vomits*\n```' + error + "```");
		} catch {
			return;
		}
	}

});

function idling (key, message) { // Idle Update
	newxp = key.xppm;
	reactions = [];
	
	if((10 + (key.prestige - 1)) == key.level) { // At prestige
		return reactions;
	}
	
	if (key.settings.paused) { // paused
		if (key.minigames.meditate.active) { // Meditate
			key.minigames.meditate.active = false;
			
			
			if (key.settings.importantnotifications == true) {
				reactions.push('<:meditate_broken:1003747548302942260>');
			}
			try {
				db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
			} catch (error) {
				throw error;
			}
		}
		return reactions;
	}
	
	if (config.idle_debug == 1) {
		console.log(">>> NON PRESTIGE ALERT <<<");
	}
	if (key.perks.includes(12)) { // SPIDERWEB
		if(key.perks.includes(8)) { // gambling
			newxp = (key.xppm + (Math.floor(Math.random() * (25*key.level)) - (5*key.level)));
		}
		
		if (key.perks.includes(4)) { // coin drops
			if ((Math.floor(Math.random() * 100) + 1) == 1) { // 1 in 100 chance
				key.coins = key.coins + (Math.floor(Math.random() * 3) + 1); //1 to 3
				if (key.settings.perknotifications == true) {
					reactions.push('<:Coin:514985713574346758>');
				}
			}
		}
		
		if (key.perks.includes(5)) { // xp boost
			if ((Math.floor(Math.random() * 40) + 1) == 1) { // 1 in 40 chance
				newxp = Math.ceil(newxp * 14); //to increase XP by 14x
				if (key.settings.perknotifications == true) {
					reactions.push('<:xp_boost:875602340340719666>')
				}
			}
		}
		
		if (key.perks.includes(6)) { // web mastery
			if (message.content.includes("https://") == true) {
				newxp = Math.ceil(newxp * 2); //increase xp by 100%
			}
		}
		if (key.perks.includes(6)) { // friends of the wild
			if (message.content.includes("<@") == true) {
				newxp = Math.ceil(newxp * 2); //increase xp by 100%
			}
		}
		
		if (key.perks.includes(13)) { // Master perks
			newxp = Math.ceil(newxp * (1 + (.15 * key.items.food)));
		}
		if (key.perks.includes(14)) {
			newxp = Math.ceil(newxp * (1 + (.15 * key.items.water)));
		}
		if (key.perks.includes(15)) {
			newxp = Math.ceil(newxp * (1 + (.15 * key.items.shelter)));
		}
		if (key.perks.includes(16)) {
			newxp = Math.ceil(newxp * (1 + (.15 * key.items.weaponry)));
		}
		if (key.perks.includes(17)) {
			newxp = Math.ceil(newxp * (1 + (.15 * key.items.stamina)));
		}
		if (key.perks.includes(18)) {
			newxp = Math.ceil(newxp * (1 + (.15 * key.items.intel)));
		}
		
		if (key.perks.includes(0)) { // double xp
			newxp = newxp * 4;
		}
		
		if (key.perks.includes(21)) { // equality
			let itemlist = [key.items.food, key.items.water, key.items.shelter, key.items.weaponry, key.items.stamina, key.items.intel];
			
			if(key.perks.includes(11)) {
				itemlist.push(key.items.scrap);
				//add electronics for spiderweb
			}
			if(key.tree.includes(2)) {
				itemlist.push(key.items.potions);
				itemlist.push(key.items.tools);
			}
			
			let equality = true;
			for (i=0; i < itemlist.length - 1; i++) {
				if (itemlist[i] != itemlist[i +1]) {
					equality = false;
				}
			}
			
			if (equality) {
				newxp = newxp * 6;
			}
			
		}
		
		if (key.perks.includes(20)) { // herald's gesture
			newxp = Math.ceil(newxp * (1 + (key.prestige * 0.1)));
		}
		
		if (key.perks.includes(19)) { // a gift from above
			if ((Math.floor(Math.random() * 300) + 1) == 1) { // 1 in 300 chance
				key.items.food++;
				key.items.water++;
				key.xppm = key.xppm + idle.shop.items[0].value;
				key.xppm = key.xppm + idle.shop.items[1].value;
				if (key.settings.perknotifications == true) {
					reactions.push('<:gift_from_above:1002333610851971123>');
				}
			}
		}
	}
	
	if (!(key.perks.includes(12))) { // Not spiderweb
		if(key.perks.includes(8)) { // gambling
			newxp = (key.xppm + (Math.floor(Math.random() * (15*key.level)) - (5*key.level)));
		}
		
		if (key.perks.includes(4)) { // coin drops
			if ((Math.floor(Math.random() * 100) + 1) == 1) { // 1 in 100 chance
				key.coins++;
				if (key.settings.perknotifications == true) {
					reactions.push('<:Coin:514985713574346758>');
				}
			}
		}
		
		if (key.perks.includes(5)) { // xp boost
			if ((Math.floor(Math.random() * 40) + 1) == 1) { // 1 in 40 chance
				newxp = Math.ceil(newxp * 7.5); //to increase XP by 7.5x
				if (key.settings.perknotifications == true) {
					reactions.push('<:xp_boost:875602340340719666>');
				}
			}
		}
		
		if (key.perks.includes(6)) { // web mastery
			if (message.content.includes("https://") == true) {
				newxp = Math.ceil(newxp * 1.5); //increase xp by 50%
			}
		}
		if (key.perks.includes(6)) { // friends of the wild
			if (message.content.includes("<@") == true) {
				newxp = Math.ceil(newxp * 1.5); //increase xp by 50%
			}
		}
		
		if (key.perks.includes(13)) { // Master perks
			newxp = Math.ceil(newxp * (1 + (.05 * key.items.food)));
		}
		if (key.perks.includes(14)) {
			newxp = Math.ceil(newxp * (1 + (.05 * key.items.water)));
		}
		if (key.perks.includes(15)) {
			newxp = Math.ceil(newxp * (1 + (.05 * key.items.shelter)));
		}
		if (key.perks.includes(16)) {
			newxp = Math.ceil(newxp * (1 + (.05 * key.items.weaponry)));
		}
		if (key.perks.includes(17)) {
			newxp = Math.ceil(newxp * (1 + (.05 * key.items.stamina)));
		}
		if (key.perks.includes(18)) {
			newxp = Math.ceil(newxp * (1 + (.05 * key.items.intel)));
		}
		
		if (key.perks.includes(0)) { // double xp
			newxp = newxp * 2;
		}
		
		if (key.perks.includes(21)) { // equality
			let itemlist = [key.items.food, key.items.water, key.items.shelter, key.items.weaponry, key.items.stamina, key.items.intel];
			
			if(key.perks.includes(11)) {
				itemlist.push(key.items.scrap);
				//add electronics for spiderweb
			}
			if(key.tree.includes(2)) {
				itemlist.push(key.items.potions);
				itemlist.push(key.items.tools);
			}
			
			let equality = true;
			for (i=0; i < itemlist.length - 1; i++) {
				if (itemlist[i] != itemlist[i +1]) {
					equality = false;
				}
			}
			
			if (equality) {
				newxp = newxp * 4;
			}
			
		}
		
		if (key.perks.includes(20)) { // herald's gesture
			newxp = Math.ceil(newxp * (1 + (key.prestige * 0.05)));
		}
		
		if (key.perks.includes(19)) { // a gift from above
			if ((Math.floor(Math.random() * 300) + 1) == 1) { // 1 in 300 chance
				if ((Math.floor(Math.random() * 2) + 1) == 1) {
					key.items.food++;
					key.xppm = key.xppm + idle.shop.items[0].value;
					if (key.settings.perknotifications == true) {
						reactions.push('<:master_forager:1002333616669462688>');
					}
				} else {
					key.items.water++;
					key.xppm = key.xppm + idle.shop.items[1].value;
					if (key.settings.perknotifications == true) {
						reactions.push('<:master_drinker:1002333614433894422>');
					}
				}
			}
		}
	}
	
	if (key.minigames.meditate.active) { // Meditate
		key.minigames.meditate.active = false;
		
		currenttime = new Date();
		
		if (key.tree.includes(15)) {
			meditatexp = Math.floor((currenttime.getTime() - key.minigames.meditate.date) / 900000) * key.xppm;
		} else {
			meditatexp = Math.floor((currenttime.getTime() - key.minigames.meditate.date) / 1800000) * key.xppm;
		}
		
		if (key.tree.includes(16)) {
			meditatexp = Math.floor(meditatexp * 0.45);
		} else if (key.tree.includes(15)){
			meditatexp = Math.floor(meditatexp * 0.25);
		} else {
			meditatexp = 0;
		}
		
		key.xp = key.xp + meditatexp;
		
		if (key.settings.importantnotifications == true) {
			reactions.push('<:meditate_broken:1003747548302942260>');
		}
	}
	
	/*for (i = 0; i < idle.pawn.secrets.length; i++) { // SECRETS
		if (message.content.includes(idle.pawn.secrets[i])) {
			for (i2 = 0; i2 < 
		}
	}*/
	
	//add xp from perks
	key.xp = key.xp + newxp;
	
	levelsupped = 0;
	
	while ((key.xp >= 100 + (Math.pow(key.level,4))) && (key.level != 10 + (key.prestige - 1))) { //Level up
		key.xp = key.xp - (100 + (Math.pow(key.level,4)));
		key.level = key.level + 1;
		levelsupped++;
		key.perkpoints = key.perkpoints + 1;
	}
	
	if (levelsupped > 0) { // Reactions
		if (key.level != 10 + (key.prestige - 1)) {		
			if (key.settings.importantnotifications == true) {
								
				if (levelsupped > 9) {
					reactions.push('<:level_up:875936134708994108>');
					reactions.push('9️⃣');
					reactions.push('➕');
				} else {
					switch (levelsupped) {
						case 1:
							reactions.push('<:level_up:875936134708994108>');
							break;
						case 2:
							reactions.push('<:level_up:875936134708994108>');
							reactions.push('2️⃣');
							break;
						case 3:
							reactions.push('<:level_up:875936134708994108>');
							reactions.push('3️⃣');
							break;
						case 4:
							reactions.push('<:level_up:875936134708994108>');
							reactions.push('4️⃣');
							break;
						case 5:
							reactions.push('<:level_up:875936134708994108>');
							reactions.push('5️⃣');
							break;
						case 6:
							reactions.push('<:level_up:875936134708994108>');
							reactions.push('6️⃣');
							break;
						case 7:
							reactions.push('<:level_up:875936134708994108>');
							reactions.push('7️⃣');
							break;
						case 8:
							reactions.push('<:level_up:875936134708994108>');
							reactions.push('8️⃣');
							break;
						case 9:
							reactions.push('<:level_up:875936134708994108>');
							reactions.push('9️⃣');
							break;
					}
				}
			}
		} else {
			key.xp = 0;
			if (key.settings.importantnotifications == true) {
				reactions.push('<:max_level:875936881488048128>');
			}
		}
	}
	
	//db.set(message.author.id,key);
	//console.log(key);
	try {
		db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
	} catch (error) {
		throw error;
	}
	
	return reactions;	
}
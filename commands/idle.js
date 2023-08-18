const config = require('../config.json');
const prefix = config.prefix;
const idle = require('../resources/idle/idle_2.json');
const idleUserData = require('../resources/idle/idleuserdata_2.json');
const color = "#c6c6c6";
const { MessageEmbed } = require('discord.js');
const owner = config.owner;
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./megee.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);

module.exports = {
	name: 'idle',
	description: 'The Mr. Megee Idle Game!',
    usage: '`xd)idle`',
    category: 'games',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
        
		if (!args[0]) {
            return message.channel.send({ embeds: [idleInfo] });
        }
		
		db.get(`SELECT * FROM idle WHERE userid = ?`,[message.author.id], (error, results) => {
			if (error) {
				throw error;
			}
			
			/*=====================
				xd)idle play
			=====================*/
			if (results == undefined) {
				if (args[0] == "play") {
                    message.channel.send("Creating Profile...");
                    try {
                        let v = idleUserData;
                        v.randperk = randperk(v);
						db.run(`INSERT INTO idle (userid, data) VALUES (?, ?)`, [message.author.id, JSON.stringify(v)]);

                        return message.channel.send("*You immediately get to work on Research and Development.*\n\nProfile created! Use `xd)idle help` to learn all what you can do!");
                    } catch (error) {
                        console.log(error);
                        return message.channel.send("An error has occured!");
                    }
                } else {
                    return message.channel.send("You do not have an Idle Profile. Do `xd)idle` for more info.");
                }
			}
			
			var key = JSON.parse(results.data);
			
			
			// SUPER DEBUG
			if (config.idle_debug == 1) {
				console.log(Date() + " - " + " \""+ message.content +"\" ---\n");
				console.log(key);
				console.log("\n\n")
			}
				
			/*=====================
				xd)idle update
			=====================*/
			if (key.ver != idle.version) {
				return message.channel.send(update(key, message.author.id));
			}
			
			/*==========================
				VARIABLE DECLARATION
			============================*/
			levelneed    = 10 + (key.prestige - 1); //level needed to activate prestige
			xpneed     = 100 + (Math.pow(key.level, 4)); //xp needed to level up
			//upgrade cost
			shoparray = [key.items.food, key.items.water, key.items.shelter, key.items.weaponry, key.items.stamina, key.items.intel, key.items.scrap, key.items.electronics, key.items.potions, key.items.tools];
			
			
			/*==========================
				xd)idle help
			============================*/
			if (args[0] == "help" || args[0] == "h") {
				return message.channel.send({ embeds: [helpbuilder(key, args[0])] });
			}
			
			/*==========================
				xd)idle stats
			============================*/
			if (args[0] == "stats" || args[0] == "s") {
				perkline = "";
				for (i = 0; i < key.perks.length; i++) {
					perkline += idle.perklist[key.perks[i]].emote;
				}
				if (perkline === "") {
					perkline = "None";
				}
				
				//Recalculate XPPM
				let recalc_xppm = 1;
				for (i=0; i < shoparray.length; i++) {
					recalc_xppm += (idle.shop.items[i].value) * shoparray[i];
				}
				if (key.xppm != recalc_xppm) {
					key.xppm = recalc_xppm;
					try {
						db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
					} catch (error) {
						console.log(error);
						return message.channel.send("An error has occured!");
					}
				}
				
				return message.channel.send({ embeds: [statsbuilder(key, message.author.username)] });
			}
			
			/*==========================
				xd)idle convert
			============================*/
			if (args[0] == "convert" || args[0] == "c") {
				if (!args[1]) {
					return message.channel.send("You need to enter the amount of coins you want to make from your xp: `xd)idle convert [amount]`");
				}
				coincost = 100; //how much each coin costs in xp
				
				if (key.perks.includes(12)) { //perks that reduce the cost
					freebiemult = .30;
					if (key.perks.includes(1)) {
						coincost = coincost - 15;
					}
					if (key.perks.includes(3)) {
						coincost = coincost - 15;
					}
				} else {
					freebiemult = .10;
					if (key.perks.includes(1)) {
						coincost = coincost - 10;
					}
					if (key.perks.includes(3)) {
						coincost = coincost - 10;
					}
				}
				
				if (key.xp < coincost) {
					return message.channel.send("You need at least " + coincost + " XP to convert!");
				}
				
				if (args[1] == "all" || args[1] == "a") {
					convertamount = Math.floor(key.xp / coincost); //The amount of coins you will get
				} else if (Number.isInteger(Number(args[1]))){
					if (Number(args[1]) < 0) {
						return message.channel.send("bruh.");
					}
					convertamount = Number(args[1]); //The amount of coins you will get
					
				} else {
					return message.channel.send("Please enter a number or \"all\"");
				}
				
				xpconvert = coincost * convertamount; //The amount of XP you will lose
				
				if (key.xp < xpconvert) {
					return message.channel.send("You can not afford that many coins!");
				}
				
				if (key.perks.includes(9)) { //If you have freebie, add extra coins
					convertamount += (Math.round(convertamount * freebiemult)) + (Math.floor(Math.random() * 10) - 5);
				}
				
				key.coins = key.coins + convertamount; //Add coins
				key.xp = key.xp - xpconvert; //Remove XP
				
				try {
					db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
				} catch (error) {
					console.log(error);
					return message.channel.send("An error has occured!");
				}
				
				return message.channel.send("Successfully converted " + xpconvert.toLocaleString() + "xp to " + convertamount.toLocaleString() + " Coin(s) <:Coin:514985713574346758>");
			}
			
			/*==========================
				xd)idle shop
			============================*/
			if (args[0] == "shop" || args[0] == "b") {
				if (!args[1] || (Number.isNaN(Number(args[1])))) {
					return message.channel.send({ embeds: [shopbuilder(key)] });
				}
				
				let sarr = shopnumbers(key);
				let shopallow = false;
				
				for (i = 0; (i < sarr.length && shopallow == false); i++) {
					
					if (Number(args[1]) - 1 == i) {
						shopallow = true;
					}
				}
				
				if (!shopallow) {
					return message.channel.send("Invalid item ID");
				}
				itemcost = idle.shop.items[sarr[args[1] - 1]].cost + (Math.pow(shoparray[sarr[args[1] - 1]], 2));
				
				if (key.perks.includes(10)) { // discount
					if (key.perks.includes(12)) { //spiderweb
						itemcost = Math.ceil(itemcost * 0.25);
					} else {
						itemcost = Math.ceil(itemcost * 0.65);
					}
				}
	
				if (key.coins >= itemcost) {
					key.coins = key.coins - itemcost;
					key.xppm = key.xppm + idle.shop.items[sarr[args[1] - 1]].value;
				} else {
					return message.channel.send("You cannot afford that!");
				}
				
				switch (sarr[args[1] - 1]) {
					case 0:
						key.items.food++;
						break;
					case 1:
						key.items.water++;
						break;
					case 2:
						key.items.shelter++;
						break;
					case 3:
						key.items.weaponry++;
						break;
					case 4:
						key.items.stamina++;
						break;
					case 5:
						key.items.intel++;
						break;
					case 6:
						key.items.scrap++;
						break;
					case 7:
						key.items.electronics++;
						break;
					case 8:
						key.items.potions++;
						break;
					case 9:
						key.items.tools++;
						break;
				}
				
				try {
					db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
				} catch (error) {
					console.log(error);
					return message.channel.send("An error has occured!");
				}
				
				let str = "You bought " + idle.shop.items[sarr[args[1] - 1]].name + " for <:Coin:514985713574346758> " + itemcost;
				
				return message.channel.send({ embeds: [shopbuilder(key)], content: str });
			}
		
			/*==========================
				xd)idle perk
			============================*/
			if (args[0] == "perk" || args[0] == "p") {
				// If you have every perk
				if (key.perks.length == idle.perklist.length) {
					if (key.perkpoints == 0) {
						return message.channel.send("You have every perk! If you have any extra perk points, you can convert them to coins with `xd)perk`. One perk point is 15 coins.");
					}
					let perkpoints = key.perkpoints;
					let oldcoins = key.coins;
					if (key.perks.includes(12) && key.perks.includes(12)) {
						key.coins = key.coins + (key.perkpoints * 30);
					} else {
						key.coins = key.coins + (key.perkpoints * 15);
					}
					key.perkpoints = 0;
					db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
					return message.channel.send("Converted " + perkpoints + " perk points to <:Coin:514985713574346758> " + (key.coins - oldcoins) + " Coins.");
				}
				
				// Show Perk embed
				if (!args[1]) {
					return message.channel.send({ embeds: [perkbuilder(key, false)] });
				}
				
				if (key.perkpoints < 1) {
					return message.channel.send("You need at least one perk point to get this perk.");
				}
				
				perk_denial = false;
				
				if (args[1] == "buy" || args[1] == "b") {
					key.perkpoints--;
					key.perks.push(key.randperk);
					key.randperk = randperk(key);
					perk_denial = true;
				}
				
				if (args[1] == "reroll" || args[1] == "r") {
					key.perkpoints--;
					key.perks.push(randperk(key));
					message.channel.send({embeds: [perkbuilder(key, true)]});
					key.randperk = randperk(key);
					perk_denial = true;
				}
				
				if (!perk_denial) {
					return message.channel.send("You must specify 'buy' or 'reroll'");
				}
				
				if (key.perks[key.perks.length - 1] == 2) { // Apply payment
					key.coins = key.coins + (((key.level + 1) * Math.ceil(key.prestige / 5)) * 15);
				}
				
				try {
					db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
				} catch (error) {
					console.log(error);
					return message.channel.send("An error has occured!");
				}
				
				return message.channel.send("You now have the **" + idle.perklist[key.perks[key.perks.length - 1]].name + "** perk!");
			}
			
			/*==========================
				xd)idle perks
			============================*/
			if (args[0] == "perks") {
				if (key.perks.length == 0) {
					return message.channel.send("You do not own any perks.");
				}
				perklist = `Your perks:`;
				for (i = 0; i < key.perks.length; i++) {
					perklist += `\n> ${idle.perklist[key.perks[i]].emote} ${idle.perklist[key.perks[i]].name}`;
				}
				return message.channel.send(perklist);
				
			}
			
			
			/*==========================
				xd)idle prestige
			============================*/
			if (args[0] == "prestige") {
				if (levelneed != key.level) {
					return message.channel.send("You need to be at max level to activate prestige! [ " + (levelneed - key.level) + " more levels! ]");
				}
				let prestige = key.prestige + 1;
				let tokens   = key.tokens + 1;
				let settings = key.settings;
				let stock    = key.minigames.stock;
				let pawn     = key.minigames.pawn;
				let tree     = key.tree;
				let bank     = key.minigames.bank;
				let invest   = key.minigames.investment;
				
				if (key.tree.includes(1)) { // Perkaholic
					perkaholic = key.perks[Math.floor(Math.random() * (key.perks.length - 1))];
				}
				
				if (config.idle_debug == 1) {
					console.log("\n\n//// PRESTIGE PART 1: key ////\n");
					console.log(key);
				}
				
				if (config.idle_debug == 1) {
					console.log("\n\n//// PRESTIGE PART 1: idleUserData ////\n");
					console.log(idleUserData);
				}
				
				// RESET
				key = idleUserData;
				key.xp = 0;
				key.xppm = 1;
				key.level = 0;
				key.coins = 0;
				key.randperk = randperk(key);
				key.perkpoints = 0;
				key.perks = [];
				key.tree = [];
				
				if (key != idleUserData){
					console.log("\n\n//// PRESTIGE FAIL ////\n");
					console.log(key);
					return message.channel.send("Please try again");
				}
				
				if (config.idle_debug == 1) {
					console.log("\n\n//// PRESTIGE PART 2: key ////\n");
					console.log(key);
				}
				
				if (config.idle_debug == 1) {
					console.log("\n\n//// PRESTIGE PART 2: idleUserData ////\n");
					console.log(idleUserData);
				}
				
				
				key.prestige        = prestige;
				key.tokens          = tokens;
				key.settings        = settings;
				key.tree            = tree;
				key.minigames.bank  = bank;
				key.minigames.investment = invest;
				if (config.idle_debug == 1) {
					console.log("\n\n//// PRESTIGE PART 3 ////\n");
					console.log(key);
				}
				
				
				if (key.tree.includes(0)) { // Rations
					key.items.food = 5;
					key.xppm = key.xppm + 5;
				}
				if (key.tree.includes(14)) { // Water Bottle
					key.items.water = 10;
					key.xppm = key.xppm + 10;
				}
				
				if (key.minigames.investment > 0) { // Investment
					key.coins += (Math.floor(((Math.random() * 1.25) + 0.75) * key.minigames.investment));
					key.minigames.investment = 0;
				}
				
				if (config.idle_debug == 1) {
					console.log("\n\n//// PRESTIGE PART 4 ////\n");
					console.log(key);
				}
				
				if (key.tree.includes(1) && perkaholic != null) { // Perkaholic
					key.perks.push(perkaholic);
					
					if (perkaholic == 2) {
						key.coins = key.coins + (((key.level + 1) * Math.ceil(key.prestige / 5)) * 15);
					}
				}
				
				if (config.idle_debug == 1) {
					console.log("\n\n//// PRESTIGE PART 5 ////\n");
					console.log(key);
				}
				
				try {
					db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
				} catch (error) {
					console.log(error);
					return message.channel.send("An error has occured!");
				}
				
				return message.channel.send(idle.prestige[key.prestige - 1].lore + "\n\nEverything has been reset as per the rules of prestige. Good luck on reaching prestige again!");
			}
		
			/*==========================
				xd)idle settings
			============================*/
			if (args[0] == "settings") {
				if (!args[1]) {
					return message.channel.send({ embeds: [settingsbuilder(key, message.author.username)] });
				}
				if (!args[2]) {
					return message.channel.send("Please specify whether you want to `enable` or `disable` this setting.");
				}
				
				return message.channel.send(settings(key, message.author.id, args[1], args[2]))
			}
		
			/*==========================
				xd)idle tree
			============================*/
			if (args[0] == "tree" || args[0] == "t") {
				if (!args[1]) { //upgrade list
					return message.channel.send({ embeds: [treebuilder(key)] });
				}
				
				if ((args[1]) && (!args[2])) { //specific upgrade
					return message.channel.send({ embeds: [upgradebuilder(key, args[1])] });
				}
				
				if ((args[1]) && (args[2])) { //upgrade purchase
					upgrade = Number(args[1]);
					if (Number.isNaN(upgrade)) {
						return message.channel.send("ID must be a valid number.");
					}
					
					if (!(key.tree.includes(idle.upgradelist[upgrade].prereq)) && (upgrade != 0)) {
						return message.channel.send("Upgrade unavalible.");
					}
					
					if (key.tree.includes(upgrade)) {
						return message.channel.send("You already have this upgrade.");
					}
					
					if (key.tokens < (key.tree.length + 1)) {
						return message.channel.send("You need at least " + (key.tree.length + 1) + " tokens to purchase this upgrade.");
					}
					
					key.tokens = key.tokens - (key.tree.length + 1);
					key.tree.push(upgrade);
					
					try {
						db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
					} catch (error) {
						console.log(error);
						return message.channel.send("An error has occured!");
					}
					
					return message.channel.send("You now have " + idle.upgradelist[upgrade].name + "!");
				}
			}
		
			/*==========================
				xd)idle bank
			============================*/
			if (args[0] == "bank" && key.tree.includes(3)) {
				if (!args[1]) {
					return message.channel.send({ embeds: [bankbuilder(key)] });
				}
				
				if (key.minigames.investment > 0) {
					return message.channel.send("You have invested! You cannot use bank features until next prestige.");
				}
				
				if (args[1] == "invest") {
					if (key.minigames.bank < 10) {
						return message.channel.send("You need at least 10 coins in your bank to invest!");
					}
					
					key.minigames.investment = key.minigames.bank;
					key.minigames.bank = 0;
					
					try {
						db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
					} catch (error) {
						console.log(error);
						return message.channel.send("An error has occured!");
					}
					
					return message.channel.send({ embeds: [bankbuilder(key)] });
				}
				
				// max
				bankmax = 200;
				if (key.tree.includes(6)) {
					bankmax = 800;
				}
				if (key.tree.includes(7)) {
					bankmax = 2000;
				}
				
				if (args[2] == "all") {
					if (args[1] == "deposit") {
						if (key.coins <= 0) {
							return message.channel.send("You have no coins to deposit!");
						}
						
						if ((key.minigames.bank + key.coins) > bankmax) {
							depositm = key.minigames.bank + key.coins;
							key.minigames.bank = bankmax;
							key.coins = depositm - bankmax;
						} else {
							key.minigames.bank = key.minigames.bank + key.coins;
							key.coins = 0;
						}
						
						try {
							db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
						} catch (error) {
							console.log(error);
							return message.channel.send("An error has occured!");
						}
						
						return message.channel.send({ content: `You deposited all your coins`, embeds: [bankbuilder(key)] });
					}
					
					if (args[1] == "withdraw") {
						if (key.minigames.bank <= 0) {
							return message.channel.send("You have no coins to withdraw!");
						}
						
						key.coins = key.minigames.bank + key.coins;
						key.minigames.bank = 0;
						
						try {
							db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
						} catch (error) {
							console.log(error);
							return message.channel.send("An error has occured!");
						}
						
						return message.channel.send({ content: `You withdrew all your coins`, embeds: [bankbuilder(key)] });
					}
				}
				
				inamt = Math.floor(Number(args[2]));
				
				if (Number.isNaN(inamt) || inamt < 1) {
					return message.channel.send({ embeds: [bankbuilder(key)] });
				}
				
				if (args[1] == "deposit") {
					if (inamt > key.coins) {
						return message.channel.send("You do not have that many coins.");
					}
					if ((key.minigames.bank + inamt) > bankmax) {
						return message.channel.send("Your bank is too small to accept that amount!");
					}
					
					key.minigames.bank = key.minigames.bank + inamt;
					key.coins = key.coins - inamt;
					
					try {
						db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
					} catch (error) {
						console.log(error);
						return message.channel.send("An error has occured!");
					}
					
					return message.channel.send({ content: `You deposited <:Coin:514985713574346758> ${inamt} coins`, embeds: [bankbuilder(key)] });
				}
				
				if (args[1] == "withdraw") {
					if (inamt > key.minigames.bank) {
						return message.channel.send("You do not have that many coins in your bank.");
					}
					
					key.coins = key.coins + inamt;
					key.minigames.bank = key.minigames.bank - inamt;
					
					try {
						db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
					} catch (error) {
						console.log(error);
						return message.channel.send("An error has occured!");
					}
					
					return message.channel.send({ content: `You withdrew <:Coin:514985713574346758> ${inamt} coins`, embeds: [bankbuilder(key)] });
				}
			}
			
			/*==========================
				xd)idle journal
			============================*/
			if (args[0] == "journal" && key.tree.includes(4)) {
				return message.channel.send({ embeds: [journalbuilder(key, args[1])] });
			}
			
			/*==========================
				xd)idle meditate
			============================*/
			if (args[0] == "meditate" && key.tree.includes(5)) {
				if(!args[1]) {
					return message.channel.send({ embeds: [meditatebuilder(key)] });
				}
				
				if (args[1] == "start") {
					if (key.minigames.meditate.active) {
						return message.channel.send("You are already meditating")
					}
					
					key.minigames.meditate.active = true;
					key.minigames.meditate.date = Date.now();
					
					try {
						db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
					} catch (error) {
						console.log(error);
						return message.channel.send("An error has occured!");
					}
					
					return message.channel.send("You have begun meditating. Try not to let the outside world break your concentration before you can properly finish!")
				}
				
				if (args[1] == "stop") {
					if (!key.minigames.meditate.active) {
						return message.channel.send("You aren't meditating right now")
					}
					
					key.minigames.meditate.active = false;
					
					meditatexp = calculate_meditatexp(key);
					
					key.xp = key.xp + meditatexp;
					
					levelsupped = 0;
	
					while ((key.xp >= 100 + (Math.pow(key.level,4))) && (key.level != 10 + (key.prestige - 1))) { //Level up
						key.xp = key.xp - (100 + (Math.pow(key.level,4)));
						key.level = key.level + 1;
						levelsupped++;
						key.perkpoints = key.perkpoints + 1;
					}
					
					reactions = []
					
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
							if (key.settings.importantnotifications == true) {
								reactions.push('<:max_level:875936881488048128>');
							}
						}
					}
					
					if (reactions.length > 0) {
						for(i=0; i < reactions.length; i++) {
							message.react(reactions[i]);
						}
						
					}
					
					try {
						db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
					} catch (error) {
						console.log(error);
						return message.channel.send("An error has occured!");
					}
					
					return message.channel.send("You have stopped meditating and you have earned " + meditatexp.toLocaleString() + " xp!");
				}
			}
			
			/*==========================
				xd)idle casino
			============================*/
			if (args[0] == "casino" && key.tree.includes(4)) {
				if (!args[1]) {
					return message.channel.send({ embeds: [idleCasino] });
				}
				
				switch (args[1]) {
					case "slots":
						if (key.coins < 1) {
							return message.channel.send("You need at least one coin to use slots!");
						}
						
						if (key.tree.includes(13)) {
							casino_rerolls = 25;
						} else {
							casino_rerolls = 5;
						}
						
						key.coins--;
						slots_options = [":cherries:", ":banana:", "<:Megee:514985713301979165>", ":middle_finger:", "<:Coin:514985713574346758>", "<:badgecoin100:547569176340987925>","<:badgecoin500:547927332648779806>"];
						slots_winners = ['<:Coin:514985713574346758>','<:badgecoin100:547569176340987925>',':middle_finger:'];
						slots_desc = "> ";
						for(i=0; i < 2; i++) {
							slots_desc += slots_options[Math.floor(Math.random() * (slots_options.length - 1))];
							slots_desc += " | ";
						}
						slots_desc += slots_options[Math.floor(Math.random() * (slots_options.length - 1))];
						slots_desc += "\n> ";
						
						for (i=0; i < casino_rerolls; i++) {
							if (slots_winners[0] == slots_winners[1] && slots_winners[0] == slots_winners[2]) {
								break;
							} else {
								slots_winners = [];
								for(i2 = 0; i2<3; i2++) {
									slots_winners.push(slots_options[Math.floor(Math.random() * (slots_options.length - 1))]);
								}
							}
						}
						
						for(i=0; i < 2; i++) {
							slots_desc += slots_winners[i];
							slots_desc += " | ";
						}
						slots_desc += slots_winners[slots_winners.length - 1];
						slots_desc += " <<\n> ";
						for(i=0; i < 2; i++) {
							slots_desc += slots_options[Math.floor(Math.random() * (slots_options.length - 1))];
							slots_desc += " | ";
						}
						slots_desc += slots_options[Math.floor(Math.random() * (slots_options.length - 1))];
						slots_desc += "\n";
						slots_reward = do_slots(slots_winners);
						slots_desc += slots_reward[0];
						key.coins = key.coins + slots_reward[1];
						try {
							db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
						} catch (error) {
							console.log(error);
							return message.channel.send("An error has occured!");
						}
						
						return message.channel.send(slots_desc);
						break;
				}
				
			}
		
			/*==========================
				xd)idle hypothetical
			============================*/
			if (args[0] == "hypothetical") {
				return message.channel.send(hypotheticalbuilder(key, args[1], args[2]));
			}
			
			/*==========================
				xd)idle delete
			============================*/
			if (args[0] == "delete") {
				message.channel.send("Deleting profile...");
				try {
					db.run(`DELETE FROM idle WHERE userid = ?`, [message.author.id]);
				} catch (error) {
					console.log(error);
					return message.channel.send("An error has occured!");
				}
				return message.channel.send("Profile deleted!");
			}
			
			/*==========================
				xd)idle cheat
			============================*/
			if (args[0] == "cheat") {
				if (message.author.id != 207901876434370562) {
					return message.channel.send("Nice try.");
				}
				
				if (!args[1]) {
					return message.channel.send("Cheat Commands: give_xp, set_tokens, set_prestige, set_coins, set_xp");
				}
				
				if (args[1] == "give_xp") {
					key.xp = key.xp + Number(args[2]);
					
					levelsupped = 0;
	
					while ((key.xp >= 100 + (Math.pow(key.level,4))) && (key.level != 10 + (key.prestige - 1))) { //Level up
						key.xp = key.xp - (100 + (Math.pow(key.level,4)));
						key.level = key.level + 1;
						levelsupped++;
						key.perkpoints = key.perkpoints + 1;
					}
					
					reactions = []
					
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
							if (key.settings.importantnotifications == true) {
								reactions.push('<:max_level:875936881488048128>');
							}
						}
					}
					
					if (reactions.length > 0) {
						for(i=0; i < reactions.length; i++) {
							message.react(reactions[i]);
						}
						
					}
				}
				
				if (args[1] == "set_tokens") {
					key.tokens = key.tokens + Number(args[2]);
				}
				
				if (args[1] == "set_prestige") {
					key.prestige = Number(args[2]);
				}
				
				if (args[1] == "set_coins") {
					key.coins = Number(args[2]);
				}
				
				if (args[1] == "set_xp") {
					key.xp = Number(args[2]);
				}
				try {
					db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), message.author.id]);
				} catch (error) {
					console.log(error);
					return message.channel.send("An error has occured!");
				}
			}
		});

        
    },
};

/*=====================
	FUNCTIONS
=====================*/
function update(key, author) { //Updates UserData
	if (key.ver == undefined) {
		let v = idleUserData;
		
		v.ver        = 2;
		v.xp         = key.xp;
		v.xppm       = key.xppm;
		v.level      = key.level;
		v.coins      = key.coins;
		v.prestige   = key.prestige;
		v.tokens     = key.prestige - 1;
		v.perkpoints = key.perkpoints;
		
		v.items.food     = key.upgrades.food;
		v.items.water    = key.upgrades.water;
		v.items.shelter  = key.upgrades.shelter;
		v.items.weaponry = key.upgrades.weaponry;
		v.items.stamina  = key.upgrades.stamina;
		v.items.intel    = key.upgrades.intel;
		
		for (i = 0; i < key.perks.length; i++) {
			if (key.perks[i].owned == true) {
				v.perks.push(i);
			}
		}
		v.randperk = randperk(v);
		try {
			db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(v), author]);
		} catch (error) {
			console.log(error);
			return "An error has occured!"
		}
		
		return "Your Idle profile has been updated!";
	}
	
	switch (key.ver) {
		case 2:
			key.ver = 3;
			let v_settings = {
				perknotifications: key.settings.perknotifications,
				importantnotifications: key.settings.importantnotifications,
				minimode: key.settings.minimode,
				paused: key.settings.paused
			}
			
			key.settings = v_settings;
			try {
				db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), author]);
			} catch (error) {
				console.log(error);
				return "An error has occured!"
			}
			
			return "Your Idle profile has been updated!";
	}
}

function randperk(key) { //Generates the randperk
	let max = idle.perklist.length - key.perks.length;
	let rand = Math.floor(Math.random() * max) + 1;
	let counter = 0;
	
	for (i = 0; i < idle.perklist.length; i++) {
		if (!(key.perks.includes(i))) {
			counter++;
			if (counter == rand) {
				return i;
			}
		}
	}
}

function shopnumbers(key) { //Determines which items get which numbers
	let arr = [0,1,2,3,4,5] //the default shop items
	
	if (key.perks.includes(11)) {
		arr.push(6);
		if (key.perks.includes(12)) {
			arr.push(7);
		}
	}
	
	if (key.tree.includes(2)) {
		arr.push(8);
		arr.push(9);
	}
	
	return arr;
}

function itemnumbers(key) { //converts item amounts to an array of numbers
	return [key.items.food, key.items.water, key.items.shelter, key.items.weaponry, key.items.stamina, key.items.intel, key.items.scrap, key.items.electronics, key.items.potions, key.items.tools];
}

function settings(key, author, setting, toggle) { //toggles a setting
	settingtoggle = false;
	if (toggle == "enable") {
		settingtoggle = true;
	}
	
	switch (setting) {
		case "perk_notifications":
			key.settings.perknotifications = settingtoggle;
			break;
		case "pawn_notifications":
			key.settings.pawnnotifications = settingtoggle;
			break;
		case "important_notifications":
			key.settings.importantnotifications = settingtoggle;
			break;
		case "minimode":
			key.settings.minimode = settingtoggle;
			break;
		case "auto_prestige":
			key.settings.autoprestige = settingtoggle;
			break;
		case "pause":
			key.settings.paused = settingtoggle;
			break;
		default:
			return "Invalid setting name.";
	}
	
	try {
		db.run(`UPDATE idle SET data = ? WHERE userid = ?`, [JSON.stringify(key), author]);
	} catch (error) {
		console.log(error);
		return "An error has occured!"
	}
	
	return "You have set [" + setting + "] to " + settingtoggle;
} 

function avalible_upgrades_array(key) { // returns an array of avalible upgrades
	let uarr = []
	
	if (key.tree.length == 0) {
		uarr.push(0);
	}
	
	for (i=0; i < idle.upgradelist.length; i++) {
		if (!(key.tree.includes(idle.upgradelist[i].id)) && key.tree.includes(idle.upgradelist[i].prereq)) {
			uarr.push(idle.upgradelist[i].id);
		}
	}
	
	return uarr;
}

function do_slots(slot_winners) {
	slots_reward = ["Sorry, you didn't win anything this time!", 0];
	if (slot_winners[0] == slot_winners[1] && slot_winners[0] == slot_winners[2]) {
		switch (slot_winners[0]) {
			case ":cherries:": // Cherry +6
				slots_reward = ["Nice! You got three :cherries: in a row!\nYou won 6 <:Coin:514985713574346758> coins!", 6];
				break;
			case ":banana:": // Banana +6
				slots_reward = ["Nice! You got three :banana: in a row!\nYou won 6 <:Coin:514985713574346758> coins!", 6];
				break;
			case "<:Megee:514985713301979165>": // Megee +12
				slots_reward = ["Wow! You got three <:Megee:514985713301979165> in a row!\nYou won 12 <:Coin:514985713574346758> coins!", 12];
				break;
			case "<:Coin:514985713574346758>": // Coins +300
				slots_reward = ["JACKPOT! You got three <:Coin:514985713574346758> in a row!\nYou won 300 <:Coin:514985713574346758> coins!", 300];
				break;
			case ":middle_finger:": // Middle finger -100
				slots_reward = ["Congrats! You got three :middle_finger: in a row!\nYou won -100 <:Coin:514985713574346758> coins!", -100];
				break;
			case "<:badgecoin100:547569176340987925>": // Badge100 +24
				slots_reward = ["Sweet! You got three <:badgecoin100:547569176340987925> in a row!\nYou won 24 <:Coin:514985713574346758> coins!", 24];
				break;
			case "<:badgecoin500:547927332648779806>": // Badge500 +48
				slots_reward = ["Cool! You got three <:badgecoin500:547927332648779806> in a row!\nYou won 48 <:Coin:514985713574346758> coins!", 48];
				break;
		}
	}
	return slots_reward;
}

function calculate_meditatexp(key) {
	currenttime = new Date();
	if (key.tree.includes(15)) {
		c_meditatexp = Math.floor((currenttime.getTime() - key.minigames.meditate.date) / 900000) * key.xppm;
	} else {
		c_meditatexp = Math.floor((currenttime.getTime() - key.minigames.meditate.date) / 1800000) * key.xppm;
	}
	
	if (key.tree.includes(16)) {
		c_meditatexp = Math.ceil(c_meditatexp * 1.05);
	}
	
	return c_meditatexp;
}

/*=====================
	EMBEDS
=====================*/
const idleInfo = new MessageEmbed()
    .setColor(color)
    .setTitle(idle.info.title)
    .setAuthor({name: idle.info.author})
    .setDescription(idle.info.body)
    .setThumbnail(idle.info.thumbnail)
	.addFields({
		name: idle.info.fields[0].name,
		value: idle.info.fields[0].description
	},{
		name: idle.info.fields[1].name,
		value: idle.info.fields[1].description
	});

const idleCasino = new MessageEmbed()
    .setColor(color)
    .setTitle(idle.casino.title)
    .setDescription(idle.casino.body)
    .setThumbnail(idle.casino.thumbnail)

function perkbuilder(key, reroll) {
	let perkdesc = idle.perklist[key.randperk].description + "\n\n:star: " + idle.perklist[key.randperk].spiderweb;
	
	if (!reroll) {
		if (key.settings.minimode) {
			const idlePerk = new MessageEmbed()
			.setColor(color)
			.setTitle(idle.perk.title)
			.setThumbnail(idle.perklist[key.randperk].image)
			.addFields({
				name: idle.perklist[key.randperk].name, 
				value: perkdesc
			})
			.setFooter({text: "Perk Points: " + key.perkpoints})
		
			return idlePerk;
		} else {
			const idlePerk = new MessageEmbed()
				.setColor(color)
				.setTitle(idle.perk.title)
				.setThumbnail(idle.perk.thumbnail)
				.setDescription(idle.perk.body)
				.addFields({
					name: idle.perklist[key.randperk].name,
					value: perkdesc
				})
				.setImage(idle.perklist[key.randperk].image)
				.setFooter({text: "Perk Points: " + key.perkpoints})
		
			return idlePerk;
		}
	} else {
		let perkdescr = idle.perklist[key.perks[key.perks.length - 1]].description + "\n\n:star: " + idle.perklist[key.perks[key.perks.length - 1]].spiderweb;
		const idlePerk = new MessageEmbed()
			.setColor(color)
			.setTitle(idle.reroll.title)
			.setDescription(idle.reroll.body)
			.setImage(idle.perklist[key.perks[key.perks.length - 1]].image)
			.setThumbnail(idle.reroll.thumbnail)
			.addFields({
				name: idle.perklist[key.perks[key.perks.length - 1]].name,
				value: perkdescr
			})
			.setFooter({text: "Perk Points: " + key.perkpoints})
		
		return idlePerk;
	}
	
	
	
	
}

function shopbuilder(key) {
	shopitemfield = "";
	shopdescfield = "";
	shopcostfield = "";
	
	let sarr = shopnumbers(key);
	let iarr = itemnumbers(key);
	
	for (i=0; i < sarr.length; i++) {
		shopitemfield += (i + 1) + ") " + idle.shop.items[sarr[i]].name + " [" + iarr[sarr[i]] + "]\n";
		shopdescfield += "+" + idle.shop.items[sarr[i]].value + " XP per message\n";
		let itemcost2 = (idle.shop.items[sarr[i]].cost + (Math.pow(iarr[sarr[i]], 2)));
		if (key.perks.includes(10)) { // discount
			if (key.perks.includes(12)) { //spiderweb
				itemcost2 = Math.ceil(itemcost2 * 0.25);
			} else {
				itemcost2 = Math.ceil(itemcost2 * 0.65);
			}
		}
		shopcostfield += "<:Coin:514985713574346758> " + itemcost2 + "\n";
	}
	
	if (key.settings.minimode) {
		const idleShop = new MessageEmbed()
			.setColor(color)
			.setTitle(idle.shop.title)
			.setFooter({text: "Coins: " + key.coins})
			.addFields({
				name: "Items",
				value: shopitemfield,
				inline: true
			},{
				name: "Description",
				value: shopdescfield,
				inline: true
				
			},{
				name: "Cost",
				value: shopcostfield,
				inline: true
				
			})
			
		return idleShop;
	} else {
		const idleShop = new MessageEmbed()
			.setColor(color)
			.setTitle(idle.shop.title)
			.setDescription(idle.shop.body)
			.setThumbnail(idle.shop.thumbnail)
			.setFooter({text: "Coins: " + key.coins})
			.addFields({
				name: "Items",
				value: shopitemfield,
				inline: true
			},{
				name: "Description",
				value: shopdescfield,
				inline: true
				
			},{
				name: "Cost",
				value: shopcostfield,
				inline: true
				
			})
			
		return idleShop;
	}
}

function helpbuilder(key) {
	if (key.tree.length > 0) {
		helpfield = "";
		if (key.tree.includes(3)){
			helpfield += "\n" + idle.help.fields[1].commands[0];
		}
		if (key.tree.includes(9)){
			helpfield += "\n" + idle.help.fields[1].commands[1];
		}
		if (key.tree.includes(5)){
			helpfield += "\n" + idle.help.fields[1].commands[2];
		}
		if (key.tree.includes(11)){
			helpfield += "\n" + idle.help.fields[1].commands[3];
		}
		if (key.tree.includes(12)){
			helpfield += "\n" + idle.help.fields[1].commands[4];
		}
		if (key.tree.includes(4)){
			helpfield += "\n" + idle.help.fields[1].commands[5];
		}
		if (helpfield.length != 0) {
			const idleHelp = new MessageEmbed()
				.setColor(color)
				.setTitle(idle.help.title)
				.setDescription(idle.help.body)
				.setThumbnail(idle.help.thumbnail)
				.addFields({
					name: idle.help.fields[0].name,
					value: idle.help.fields[0].description
				},{
					name: idle.help.fields[1].name,
					value: helpfield
				})
			return idleHelp;
		}
	}
	const idleHelp = new MessageEmbed()
		.setColor(color)
		.setTitle(idle.help.title)
		.setDescription(idle.help.body)
		.setThumbnail(idle.help.thumbnail)
		.addFields({name: idle.help.fields[0].name, value: idle.help.fields[0].description})
	return idleHelp;
}
	
function statsbuilder(key, author) {
	let perkfield = "Perks"
	if (key.perks.includes(12)) {
		perkfield += " ⭐";
	}
	status = [];
	for (i = 0; i < key.perks.length; i++) {
		status.push(idle.perklist[key.perks[i]].status);
	}
	for (i = 0; i < idle.prestige[key.prestige - 1].status.length; i++) {
		status.push(idle.prestige[key.prestige - 1].status[i])
	}
	if (key.settings.minimode) {
		descfield = "";
	} else {
		descfield = "*" + status[Math.floor(Math.random() * status.length)] + "*\n"
	}
	if (key.tokens > key.tree.length) {
		descfield += "\n**>> You have unspent Prestige Tree Tokens**"
	}
	if (key.minigames.meditate.active) {
		descfield += "\n**>> You are meditating**";
	}
	if (key.settings.paused) {
		descfield += "\n**>> You are currently paused**";
	}
	if ((10 + (key.prestige - 1)) == key.level) {
		descfield += "\n**>> You can prestige**";
	}
	
	if (key.settings.minimode) {
		const idleStats = new MessageEmbed()
			.setColor(color)
			.setTitle("Prestige " + key.prestige + ": " + idle.prestige[key.prestige - 1].name)
			.setAuthor({name: author + "'s stats"})
			.setDescription(descfield)
			.addFields({
				name: "XP",
				value: key.xp.toLocaleString() + " / " + xpneed.toLocaleString() + " (" + Math.round((key.xp / xpneed) * 100) + "%)",
				inline: true
			},{
				name: "Level",
				value: key.level + "/" + levelneed,
				inline: true
			},{
				name: "Coins",
				value: "<:Coin:514985713574346758> " + key.coins.toLocaleString(),
				inline: true
			},{
				name: "XP per message",
				value: key.xppm.toString(),
				inline: true
			},{
				name: "Perk Points",
				value: key.perkpoints.toString(),
				inline: true
			},{
				name: perkfield,
				value: perkline,
				inline: false
			})
			
		return idleStats;
	} else {
		const idleStats = new MessageEmbed()
			.setColor(color)
			.setTitle("Prestige " + key.prestige + ": " + idle.prestige[key.prestige - 1].name)
			.setAuthor({name: author + "'s stats"})
			.setThumbnail(idle.prestige[key.prestige - 1].thumbnail)
			.setDescription(descfield)
			.addFields({
				name: "XP",
				value: key.xp.toLocaleString() + " / " + xpneed.toLocaleString() + " (" + Math.round((key.xp / xpneed) * 100) + "%)",
				inline: true
			},{
				name: "Level",
				value: key.level + "/" + levelneed,
				inline: true
			},{
				name: "Coins",
				value: "<:Coin:514985713574346758> " + key.coins.toLocaleString(),
				inline: true
			},{
				name: "XP per message",
				value: key.xppm.toString(),
				inline: true
			},{
				name: "Perk Points",
				value: key.perkpoints.toString(),
				inline: true
			},{
				name: perkfield,
				value: perkline,
				inline: false
			})
		return idleStats;
	}
}

function settingsbuilder (key, author) {
	const idleSettings = new MessageEmbed()
		.setColor(color)
		.setTitle(idle.settings.title)
		.setAuthor({name: author + "'s settings"})
		.setThumbnail(idle.settings.thumbnail)
		.setDescription(idle.settings.body)
		.addFields({
			name: "[`" + idle.settings.setting[0].name + "`] - " + key.settings.importantnotifications,
			value: idle.settings.setting[0].desc
		},{
			name: "[`" + idle.settings.setting[1].name + "`] - " + key.settings.perknotifications,
			value: idle.settings.setting[1].desc
		},{
			name: "[`" + idle.settings.setting[3].name + "`] - " + key.settings.minimode,
			value: idle.settings.setting[3].desc
		},{
			name: "[`" + idle.settings.setting[5].name + "`] - " + key.settings.paused,
			value: idle.settings.setting[5].desc
		})
	
	return idleSettings;
}

function treebuilder (key) {
	avaliblelist = "[ No upgrades avalible ]";
	upgradelist = "";
	
	if (key.tree.length == 0) {
		avaliblelist = "**" + idle.upgradelist[0].name + "** [" + idle.upgradelist[0].id + "]\n"
	} else {
		avaliblelist = "";
	}
	
	
	
	for (i=0; i < key.tree.length; i++) {
		upgradelist += "**" + idle.upgradelist[key.tree[i]].name + "** [" + idle.upgradelist[key.tree[i]].id + "]\n"
	}
	
	for (i2=0; i2 < idle.upgradelist.length; i2++) {
		if (key.tree.includes(idle.upgradelist[i2].prereq) && !(key.tree.includes(idle.upgradelist[i2].id))) {
			avaliblelist += "**" + idle.upgradelist[i2].name + "** [" + idle.upgradelist[i2].id + "]\n"
		}
	}
	
	if (upgradelist.length == 0) {
		upgradelist = "[ You have no upgrades ]";
	}
	
	if (key.settings.minimode) {
		const idleTree = new MessageEmbed()
			.setColor(color)
			.setTitle(idle.tree.title)
			.addFields({
				name: "__Avalible Prestige Upgrades__",
				value: avaliblelist
			},{
				name: "__Purchased Prestige Upgrades__",
				value: upgradelist
			})
			.setFooter({text: "Prestige Tree Tokens: " + key.tokens.toString()})
		return idleTree;
	} else {
		const idleTree = new MessageEmbed()
			.setColor(color)
			.setTitle(idle.tree.title)
			.setThumbnail(idle.tree.thumbnail)
			.setDescription(idle.tree.body)
			.addFields({
				name: "__Avalible Prestige Upgrades__",
				value: avaliblelist
			},{
				name: "__Purchased Prestige Upgrades__",
				value: upgradelist
			})
			.setFooter({text: "Prestige Tree Tokens: " + key.tokens.toString()})
		return idleTree;
	}
	
	
}

function upgradebuilder (key, upgrade) {
	upgrade = Number(upgrade)
	
	if (Number.isNaN(upgrade)) {
		const idleUpgrade = new MessageEmbed()
			.setColor(color)
			.setTitle("Invalid ID")
			.setThumbnail(idle.tree.thumbnail)
			.setDescription("You must enter the ID of an upgrade on your upgrade list.")
		
		return idleUpgrade;
	}
	try {
		if (!(key.tree.includes(idle.upgradelist[upgrade].prereq)) && (upgrade != 0)) {
			const idleUpgrade = new MessageEmbed()
				.setColor(color)
				.setTitle("Unavalible ID")
				.setThumbnail(idle.tree.thumbnail)
				.setDescription("You must enter the ID of an upgrade on your upgrade list.")
			
			return idleUpgrade;
		}
	} catch {
		const idleUpgrade = new MessageEmbed()
			.setColor(color)
			.setTitle("Unavalible ID")
			.setThumbnail(idle.tree.thumbnail)
			.setDescription("You must enter the ID of an upgrade on your upgrade list.")
		
		return idleUpgrade;
	}
	
	const idleUpgrade = new MessageEmbed()
		.setColor(color)
		.setTitle(idle.upgradelist[upgrade].name)
		.setThumbnail(idle.tree.thumbnail)
		.setDescription("*" + idle.upgradelist[upgrade].description + "*\n\nDo `xd)idle tree " + upgrade.toString() + " buy` to get the upgrade\n\n**[ Costs " + (key.tree.length + 1) + " Prestige Tree Tokens ]**")
		.setFooter({text: "Prestige Tree Tokens: " + key.tokens.toString()})
	
	return idleUpgrade;
}

function bankbuilder (key) {
	if (key.minigames.investment > 0) {
		const idleBank = new MessageEmbed()
			.setColor(color)
			.setTitle(idle.bank.title)
			.setThumbnail(idle.bank.thumbnail)
			.setDescription("You've invested <:Coin:514985713574346758> " + key.minigames.investment + " coins. See if your investment was worth it next time you prestige!")
		return idleBank;
	}
	if (key.settings.minimode) {
		if (key.tree.includes(8)) {
			const idleBank = new MessageEmbed()
				.setColor(color)
				.setTitle(idle.bank.title)
				.setFooter({text: "Bank Balance: " + key.minigames.bank.toString()})
			return idleBank;
		} else {
			const idleBank = new MessageEmbed()
				.setColor(color)
				.setTitle(idle.bank.title)
				.setFooter({text: "Bank Balance: " + key.minigames.bank.toString()})
			return idleBank;
		}
	} else {
		if (key.tree.includes(8)) {
			const idleBank = new MessageEmbed()
				.setColor(color)
				.setTitle(idle.bank.title)
				.setThumbnail(idle.bank.thumbnail)
				.setDescription(idle.bank.body + idle.bank.invest)
				.setFooter({text: "Bank Balance: " + key.minigames.bank.toString()})
			return idleBank;
		} else {
			const idleBank = new MessageEmbed()
				.setColor(color)
				.setTitle(idle.bank.title)
				.setThumbnail(idle.bank.thumbnail)
				.setDescription(idle.bank.body)
				.setFooter({text: "Bank Balance: " + key.minigames.bank.toString()})
			return idleBank;
		}
	}
}

function journalbuilder (key, journalpage) {
	if (!journalpage) {
		const idleJournal = new MessageEmbed()
			.setColor(color)
			.setTitle(idle.journal.title)
			.setThumbnail(idle.journal.thumbnail)
			.setDescription(idle.journal.body)
		return idleJournal;
	} else {
		journalpage = Number(journalpage);
		journalpage = Math.floor(journalpage);
		
		if (Number.isNaN(journalpage)) {
			const idleJournal = new MessageEmbed()
				.setColor(color)
				.setTitle(idle.journal.title)
				.setThumbnail(idle.journal.thumbnail)
				.setDescription("Please use the prestige number.")
			return idleJournal;
		}
		if (journalpage > key.prestige || journalpage < 1) {
			const idleJournal = new MessageEmbed()
				.setColor(color)
				.setTitle(idle.journal.title)
				.setThumbnail(idle.journal.thumbnail)
				.setDescription("You can only view a prestige you've already completed!")
			return idleJournal;
		}
		
		journaldesc = idle.prestige[journalpage - 1].lore + "\n\n";
		
		for (i=0; i < idle.prestige[journalpage - 1].status.length; i++) {
			journaldesc += `*` + idle.prestige[journalpage - 1].status[i] + `*\n`;
		}
		
		const idleJournal = new MessageEmbed()
			.setColor(color)
			.setAuthor({name: idle.journal.title})
			.setTitle(`Prestige ${journalpage}: ` + idle.prestige[journalpage - 1].name)
			.setThumbnail(idle.prestige[journalpage - 1].thumbnail)
			.setDescription(journaldesc)
		return idleJournal;
	}	
}

function meditatebuilder (key) {
	if (key.tree.includes(16)) {
		meditatedesc = idle.meditate.allseeing;
	} else if (key.tree.includes(15)) {
		meditatedesc = idle.meditate.mind;
	} else {
		meditatedesc = idle.meditate.body;
	}
	
	if (key.minigames.meditate.active) {
		currenttime = new Date();
		medidate = Math.round((currenttime.getTime() - key.minigames.meditate.date) / 60000);
		b_meditatexp = calculate_meditatexp(key);
		
		const idleMeditate = new MessageEmbed()
			.setColor(color)
			.setTitle(idle.meditate.title)
			.setThumbnail(idle.meditate.thumbnail)
			.setDescription(meditatedesc)
			.addFields({name: "You are currently meditating", value: `You have been meditating for ${medidate} minutes.\nIf you stop meditating now, you can earn ${b_meditatexp} XP.`})
		return idleMeditate;
	} else {
		const idleMeditate = new MessageEmbed()
			.setColor(color)
			.setTitle(idle.meditate.title)
			.setThumbnail(idle.meditate.thumbnail)
			.setDescription(meditatedesc)
			.addFields({name: "You are not meditating", value: "`xd)idle meditate start` to start meditating"})
		return idleMeditate;
	}
}

function hypotheticalbuilder (key, hypoarg, hypoarg2) {
	newxp = key.xppm;
	
	// hypoarg  : both, web, friends -- whether the message has a link, ping, or both
	// hypoarg2 : max, min, avg      -- what you'd like to measure for in terms of XP gain
	
	switch (hypoarg2) { 
		case "max":
			hypostring = "Let's say, hypothetically, you send a message with the highest possible chances... \n";
			break;
		case "min":
			hypostring = "Let's say, hypothetically, you send a message with the lowest possible chances... \n";
			break;
		case "avg":
			hypostring = "Let's say, hypothetically, you send a message with the most average possible chances... \n";
			break;
		default:
			hypostring = "Let's say, hypothetically, you send a message... \n";
			break;
	}
	
	hypostring += "Initially you'll start with **" + newxp + "** xp.\n\n";
	
	if (key.perks.includes(12)) { // SPIDERWEB
		hypostring += "You have the **Spiderweb** perk, so the effects of perks are heightened.\n\n"
		if(key.perks.includes(8)) { // gambling
			switch (hypoarg2) { 
				case "max":
					newxp = (key.xppm + (newxp + (25*key.level)));
					hypostring += "You have gambling which grants you xp between " + (newxp - (5*key.level)) + " and " + (newxp + (25*key.level));
					break;
				case "min":
					newxp = (key.xppm + (newxp - (5*key.level)));
					hypostring += "You have gambling which grants you xp between " + (newxp - (5*key.level)) + " and " + (newxp + (25*key.level));
					break;
				case "avg":
					newxp = (key.xppm + (newxp + (11*key.level)));
					hypostring += "You have gambling which grants you xp between " + (newxp - (5*key.level)) + " and " + (newxp + (25*key.level)) + ", averaging out to " + (newxp + (6*key.level));
					break;
				default:
					newxp = (key.xppm + (Math.floor(Math.random() * (25*key.level)) - (5*key.level)));
					hypostring += "You have gambling which grants you xp between " + (newxp - (5*key.level)) + " and " + (newxp + (25*key.level));
					break;
			}
			
			hypostring += ". In this case, you get **" + newxp + "** xp.\n\n";
			
		}
		
		if (key.perks.includes(4)) { // coin drops
			hypostring += "You have coin drops."
			if ((Math.floor(Math.random() * 100) + 1) == 1) { // 1 in 100 chance
				hypostring += " This time you earn the coins; gaining **" + (Math.floor(Math.random() * 3) + 1) + "** coins total.\n"
			} else {
				hypostring += " You do not gain any coins this time.\n";
			}
		}
		
		if (key.perks.includes(5)) { // xp boost
			hypostring += "You have xp boost.";
			if ((Math.floor(Math.random() * 40) + 1) == 1) { // 1 in 40 chance
				newxp = Math.ceil(newxp * 14);
				hypostring += " You get the boost and multiply your xp 14, ending up at **" + newxp + "** xp.\n";
			} else {
				hypostring += " You do not get the boost this time.\n";
			}
		}
		
		if (key.perks.includes(6)) { // web mastery
			hypostring += "You have Web Mastery.";
			if (hypoarg == ("both" || "web")) {
				newxp = Math.ceil(newxp * 2); //increase xp by 100%
				hypostring += " Your message includes a link, so you double your xp, ending up at **" + newxp + "** xp.\n";
			} else {
				hypostring += " Your message did not contain a link, so you don't double your xp.\n";
			}
		}
		if (key.perks.includes(6)) { // friends of the wild
			hypostring += "You have Friends of the Wild.";
			if (hypoarg == ("both" || "friends")) {
				newxp = Math.ceil(newxp * 2); //increase xp by 100%
				hypostring += " Your message included a ping, so you double your xp, ending up at **" + newxp + "** xp.\n\n";
			} else {
				hypostring += " Your message did not include a ping, so you don't double your xp.\n\n";
			}
		}
		
		if (key.perks.includes(13)) { // Master perks
			newxp = Math.ceil(newxp * (1 + (.15 * key.items.food)));
			hypostring += "You have Master Forager which gives you " + (1 + (.15 * key.items.food)).toFixed(2) + "x xp. Which gives you **" + newxp + "** xp.\n";
		}
		if (key.perks.includes(14)) {
			newxp = Math.ceil(newxp * (1 + (.15 * key.items.water)));
			hypostring += "You have Master Drinker which gives you " + (1 + (.15 * key.items.water)).toFixed(2) + "x xp. Which gives you **" + newxp + "** xp.\n";
		}
		if (key.perks.includes(15)) {
			newxp = Math.ceil(newxp * (1 + (.15 * key.items.shelter)));
			hypostring += "You have Master Designer which gives you " + (1 + (.15 * key.items.shelter)).toFixed(2) + "x xp. Which gives you **" + newxp + "** xp.\n";
		}
		if (key.perks.includes(16)) {
			newxp = Math.ceil(newxp * (1 + (.15 * key.items.weaponry)));
			hypostring += "You have Master Fighter which gives you " + (1 + (.15 * key.items.weaponry)).toFixed(2) + "x xp. Which gives you **" + newxp + "** xp.\n";
		}
		if (key.perks.includes(17)) {
			newxp = Math.ceil(newxp * (1 + (.15 * key.items.stamina)));
			hypostring += "You have Master Slinger which gives you " + (1 + (.15 * key.items.stamina)).toFixed(2) + "x xp. Which gives you **" + newxp + "** xp.\n";
		}
		if (key.perks.includes(18)) {
			newxp = Math.ceil(newxp * (1 + (.15 * key.items.intel)));
			hypostring += "You have Master Thinker which gives you " + (1 + (.15 * key.items.intel)).toFixed(2) + "x xp. Which gives you **" + newxp + "** xp.\n\n";
		}
		
		if (key.perks.includes(0)) { // double xp
			newxp = newxp * 4;
			hypostring += "You have double xp which doubles because of Spiderweb. This gives you **" + newxp + "** xp.\n";
		}
		
		if (key.perks.includes(21)) { // equality
			hypostring += "You have equality. "
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
				hypostring += " Your shop items are equal, so you earn 6x the xp. This gives you **" + newxp + "** xp.\n";
			} else {
				hypostring += " Your shop items are not equal, so you do not get any additional xp.\n";
			}
			
		}
		
		if (key.perks.includes(20)) { // herald's gesture
			newxp = Math.ceil(newxp * (1 + (key.prestige * 0.1)));
			hypostring += "You have Herald's Gesture which gives you " + (1 + (key.prestige * 0.1)).toFixed(1) + "x more xp."
			hypostring += " This gives you **" + newxp + "** xp.\n";
		}
		
		if (key.perks.includes(19)) { // a gift from above
			hypostring += "You have A Gift From Above."
			if ((Math.floor(Math.random() * 300) + 1) == 1) { // 1 in 300 chance
				hypostring += " You are rewarded with a food and water\n\n";
			} else {
				hypostring += " You do not get anything from it.\n\n";
			}
		}
	}
	
	if (!(key.perks.includes(12))) { // Not spiderweb
		if(key.perks.includes(8)) { // gambling
			switch (hypoarg2) { 
				case "max":
					newxp = (key.xppm + (newxp + (15*key.level)));
					hypostring += "You have gambling which grants you xp between " + (newxp - (5*key.level)) + " and " + (newxp + (15*key.level));
					break;
				case "min":
					newxp = (key.xppm + (newxp - (5*key.level)));
					hypostring += "You have gambling which grants you xp between " + (newxp - (5*key.level)) + " and " + (newxp + (15*key.level));
					break;
				case "avg":
					newxp = (key.xppm + (newxp + (11*key.level)));
					hypostring += "You have gambling which grants you xp between " + (newxp - (5*key.level)) + " and " + (newxp + (15*key.level)) + ", averaging out to " + (newxp + (6*key.level));
					break;
				default:
					newxp = (key.xppm + (Math.floor(Math.random() * (25*key.level)) - (5*key.level)));
					hypostring += "You have gambling which grants you xp between " + (newxp - (5*key.level)) + " and " + (newxp + (15*key.level));
					break;
			}
			
			hypostring += ". In this case, you get **" + newxp + "** xp.\n\n";
		}
		
		if (key.perks.includes(4)) { // coin drops
			hypostring += "You have coin drops."
			if ((Math.floor(Math.random() * 100) + 1) == 1) { // 1 in 100 chance
				hypostring += " You earn a coin!\n"
			} else {
				hypostring += " You do not get a coin.\n"
			}
		}
		
		if (key.perks.includes(5)) { // xp boost
			hypostring += "You have xp boost.";
			if ((Math.floor(Math.random() * 40) + 1) == 1) { // 1 in 40 chance
				newxp = Math.ceil(newxp * 7.5); //to increase XP by 7.5x
				hypostring += " You get the boost and multiply your xp 7.5, ending up at **" + newxp + "** xp.\n";
			} else {
				hypostring += " You do not get the boost this time.\n";
			}
		}
		
		if (key.perks.includes(6)) { // web mastery
			hypostring += "You have Web Mastery.";
			if (hypoarg == ("both" || "web")) {
				newxp = Math.ceil(newxp * 1.5); //increase xp by 50%
				hypostring += " Your message includes a link, so you get 50% more xp, ending up at **" + newxp + "** xp.\n";
			} else {
				hypostring += " Your message did not contain a link.\n";
			}
		}
		if (key.perks.includes(6)) { // friends of the wild
			hypostring += "You have Friends of the Wild.";
			if (hypoarg == ("both" || "web")) {
				newxp = Math.ceil(newxp * 1.5); //increase xp by 50%
				hypostring += " Your message included a ping, so you get 50% more xp, ending up at **" + newxp + "** xp.\n\n";
			} else {
				hypostring += " Your message did not include a ping.\n\n";
			}
		}
		
		if (key.perks.includes(13)) { // Master perks
			newxp = Math.ceil(newxp * (1 + (.05 * key.items.food)));
			hypostring += "You have Master Forager which gives you " + (1 + (.05 * key.items.food)).toFixed(2) + "x xp. Which gives you **" + newxp + "** xp.\n";
		}
		if (key.perks.includes(14)) {
			newxp = Math.ceil(newxp * (1 + (.05 * key.items.water)));
			hypostring += "You have Master Drinker which gives you " + (1 + (.05 * key.items.water)).toFixed(2) + "x xp. Which gives you **" + newxp + "** xp.\n";
		}
		if (key.perks.includes(15)) {
			newxp = Math.ceil(newxp * (1 + (.05 * key.items.shelter)));
			hypostring += "You have Master Designer which gives you " + (1 + (.05 * key.items.shelter)).toFixed(2) + "x xp. Which gives you **" + newxp + "** xp.\n";
		}
		if (key.perks.includes(16)) {
			newxp = Math.ceil(newxp * (1 + (.05 * key.items.weaponry)));
			hypostring += "You have Master Fighter which gives you " + (1 + (.05 * key.items.weaponry)).toFixed(2) + "x xp. Which gives you **" + newxp + "** xp.\n";
		}
		if (key.perks.includes(17)) {
			newxp = Math.ceil(newxp * (1 + (.05 * key.items.stamina)));
			hypostring += "You have Master Slinger which gives you " + (1 + (.05 * key.items.stamina)).toFixed(2) + "x xp. Which gives you **" + newxp + "** xp.\n";
		}
		if (key.perks.includes(18)) {
			newxp = Math.ceil(newxp * (1 + (.05 * key.items.intel)));
			hypostring += "You have Master Thinker which gives you " + (1 + (.05 * key.items.intel)).toFixed(2) + "x xp. Which gives you **" + newxp + "** xp.\n\n";
		}
		
		if (key.perks.includes(0)) { // double xp
			newxp = newxp * 2;
			hypostring += "You have double xp. This gives you **" + newxp + "** xp.\n";
		}
		
		if (key.perks.includes(21)) { // equality
			hypostring += "You have equality. "
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
				hypostring += " Your shop items are equal, so you earn 4x the xp. This gives you **" + newxp + "** xp.\n";
			} else {
				hypostring += " Your shop items are not equal, so you do not get any additional xp.\n";
			}
			
		}
		
		if (key.perks.includes(20)) { // herald's gesture
			newxp = Math.ceil(newxp * (1 + (key.prestige * 0.05)));
			hypostring += "You have Herald's Gesture which gives you " + (1 + (key.prestige * 0.05)).toFixed(2) + "x more xp."
			hypostring += " This gives you **" + newxp + "** xp.\n";
		}
		
		if (key.perks.includes(19)) { // a gift from above
			hypostring += "You have A Gift From Above."
			if ((Math.floor(Math.random() * 300) + 1) == 1) { // 1 in 300 chance
				if ((Math.floor(Math.random() * 2) + 1) == 1) {
					hypostring += " You gain a food from it.\n\n";
				} else {
					hypostring += " You gain a water from it.\n\n";
				}
			} else {
				hypostring += " You do not get anything from it this time.\n\n"
			}
		}
	}
	
	if (key.minigames.meditate.active) { // Meditate
		hypostring += "The message would break your meditation.";
		
		currenttime = new Date();
		
		if (key.tree.includes(15)) {
			meditatexp = Math.floor((currenttime.getTime() - key.minigames.meditate.date) / 900000) * key.xppm;
		} else {
			meditatexp = Math.floor((currenttime.getTime() - key.minigames.meditate.date) / 1800000) * key.xppm;
		}
		
		if (key.tree.includes(16)) {
			meditatexp = Math.floor(meditatexp * 0.45);
			hypostring += " You have The All Seeing Spider, so you earn " + meditatexp + " xp from it.\n\n";
		} else if (key.tree.includes(15)){
			meditatexp = Math.floor(meditatexp * 0.25);
			hypostring += " You have Strongest Mind, so you earn " + meditatexp + " xp from it.\n\n";
		} else {
			meditatexp = 0;
			hypostring += " You lose all the xp you were working for.\n\n";
		}
		
		newxp += meditatexp;
		
	}
	
	hypostring += "You end up getting a total of **" + newxp + "** xp.\n";
	
	return hypostring;
	
}
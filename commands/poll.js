const config = require('../config.json');
const fs = require('fs');
const prefix = config.prefix;
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./megee.db', sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE);

module.exports = {
	name: 'poll',
	description: 'Create and Vote on public polls',
    usage: '`xd)poll help`',
    category: 'others',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
		const d = new Date();
		//var file = fs.readFileSync('poll.txt').toString();
        //var dataobj = JSON.parse(file);
		
		try {
			db.run("PRAGMA busy_timeout = 30000");
		} catch(error){throw error}
		
		if ((!args[0]) || (args[0] == "rand")) { //Get Random Poll
			
			
			db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[message.author.id], (error, results) => {
				if(error) {
					return console.log(error);
				}
				
				dbwords = `SELECT * FROM polls WHERE ID NOT IN (`;
				
				try {
					votedpolls = JSON.parse(results.VOTE_ARRAY).data;
				} catch {
					votedpolls = "nope"
				}
				if (votedpolls != "nope" && (args[0] != "rand")) {
					dbwords += votedpolls.toString();
				}
				
				dbwords += `) AND NOT TITLE GLOB '~~!@*' ORDER BY RANDOM() LIMIT 1`;
				
				db.get(dbwords, (error, data) => {
					if(error) {
						return console.log(error);
					}
					
					if (data == undefined) {
						return message.channel.send("You voted for every poll you could!");
					}
					
					sendembed(data);
				});
			});
		}
        
		if (args[0] == "help" || args[0] == "h") { //HELP
			return message.channel.send({embeds: [helpembed]});
		}
		
		if (args[0] == "create" || args[0] == "c") { //CREATE POLL
			rearg = message.content.slice(prefix.length + command.length + args[0].length + 1).trim().split(/\?+/);
			for (i = 0; i < rearg.length; i++) {
				rearg[i] = rearg[i].trim();
			}
			if (rearg[rearg.length - 1] == "") {
				rearg.pop();
			}
			
			try {
				title = rearg[0];
				a = rearg[1];
				b = rearg[2];
			} catch {
				return message.channel.send("Missing arguments.");
			}
			
			if (rearg.length != 3) {
				return message.channel.send("Too many or too few arguments. Each argument has to end in a `?`. Use `xd)poll help` for more info.");
			}
			
			if (title.length > 128) {
				return message.channel.send("Your title is too long! Must be less than 128 characters. (" + title.length + ")");
			}
			
			if (title.length < 4) {
				return message.channel.send("Your title is too short! Must be at least 4 characters. (" + title.length + ")");
			}
			
			if (a.length > 64 || b.length > 64) {
				return message.channel.send("Your option is too long! Must be less than 64 characters.");
			}
			
			if (a.length < 1 || b.length < 1) {
				return message.channel.send("Your option is too long! Must be at least 1 character.");
			}
			
			if(title.includes(`*`) || title.includes(`@`)) {
                return message.channel.send("Your title cannot contain `*` or `@`");
            }
			
			if(a.includes(`*`) || a.includes(`@`) || b.includes(`*`) || b.includes(`@`)) {
                return message.channel.send("Your options cannot contain `*` or `@`");
            }
			
			if(title.includes(`*`) || title.includes(`@`)) {
                return message.channel.send("Your title cannot contain `*` or `@`");
            }
			
			title = title.replace(/_/g," ");
			a = a.replace(/_/g," ");
			b = b.replace(/_/g," ");
			
			//date = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
			newid = Math.floor(Math.random() * 8999999999) + 1000000000;
			
			db.all(`SELECT ID FROM polls`,(error,ids) => {
				//return console.log(ids);
				bruh = []
				for(i = 0; i < ids.length; i++) {
					bruh.push(ids[i].ID);
				}
				//console.log(bruh);
				
				while (bruh.includes(newid)) {
					newid = Math.floor(Math.random() * 8999999999) + 1000000000;
				}
				
				db.run(`INSERT INTO polls (ID, AUTHOR, AUTHORID, DATE, TITLE, OPTION_A, OPTION_B, VOTES_A, VOTES_B, VOTES_TOTAL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [newid, message.author.username, message.author.id, d, title, a, b, 0, 0, 0], (error) => {
					if(error) {
						return console.log(error);
					}
					
					db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[message.author.id], (error, results) => {
						if(error) {
							return console.log(error);
						}
						
						if(results != undefined) {
							createarray = JSON.parse(results.CREATE_ARRAY);
							
							createarray.data.push(newid);
							
							db.run(`UPDATE polls_users SET CREATE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(createarray), message.author.id]);
						} else {
							db.run(`INSERT INTO polls_users (USERID, VOTE_ARRAY, CREATE_ARRAY) VALUES (?, ?, ?)`, [message.author.id, `{"data":[]}"]);`, `{"data":[]}`], (error) => {
								createarray = JSON.parse(`{"data":[]}`);
								
								createarray.data.push(newid);
							
								db.run(`UPDATE polls_users SET CREATE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(createarray), message.author.id]);
							});
						}
					});
				});
			
				newpoll = {
					"ID": newid,
					"AUTHOR": message.author.username,
					"AUTHORID":message.author.id,
					"DATE": d,
					"TITLE": title,
					"OPTION_A": a,
					"OPTION_B": b,
					"VOTES_A": 0,
					"VOTES_B": 0
				};
				
				sendembed(newpoll);
			});
			
		}
		
		if (args[0] == "vote" || args[0] == "v") { //VOTE
			if (!(Number.isInteger(Number(args[1])))) {
				return message.channel.send("ID must be a ten digit number.");
			}
			
			db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[message.author.id], (error, results) => {
				if (error) {
					throw error;
				}
				try {
					votedpolls = JSON.parse(results.VOTE_ARRAY).data;
					if (votedpolls.includes(searchid)) {
						return message.channel.send("You already voted for this poll!");
					}
				} catch {}
				
				return vote(message.author.id, Number(args[1]), args[2]);
			});
			
			
			}
		
		if (args[0] == "search" || args[0] == "s") { //SEARCH
			if (!(Number.isInteger(Number(args[1])))) {
				return message.channel.send("ID must be a ten digit number.");
			}
			searchid = Number(args[1]);
			
			db.get(`SELECT * FROM polls WHERE ID = ? AND NOT TITLE GLOB '~~!@*'`,[searchid], (error, data) => {
				if (data == undefined) {
					return message.channel.send("Invalid ID.");
				}
				
				sendembed(data);
			});
		}

		if (args[0] == "list" || args[0] == "l") { //LIST [sort] [filter] [page]
			dbcommand = `SELECT * FROM polls `;
			
			db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[message.author.id], (error, results) => {
				try {
					switch (args[2]) { //FILTER
						case "v":
							votedpolls = JSON.parse(results.VOTE_ARRAY).data;
							dbcommand += `WHERE ID IN (` + votedpolls.toString() + `) AND NOT TITLE GLOB '~~!@*' `;
							break;
						case "c":
							createdpolls = JSON.parse(results.CREATE_ARRAY).data;
							dbcommand += `WHERE ID IN (` + createdpolls.toString() + `) AND NOT TITLE GLOB '~~!@*' `;
							break;
						case "b":
							votedpolls = JSON.parse(results.VOTE_ARRAY).data;
							createdpolls = JSON.parse(results.CREATE_ARRAY).data;
							bothpolls = createdpolls.concat(votedpolls);
							dbcommand += `WHERE ID IN (` + bothpolls.toString() + `) AND NOT TITLE GLOB '~~!@*' `;
							break;
						case "-v":
							votedpolls = JSON.parse(results.VOTE_ARRAY).data;
							dbcommand += `WHERE ID NOT IN (` + votedpolls.toString() + `) AND NOT TITLE GLOB '~~!@*' `;
							break;
						case "-c":
							createdpolls = JSON.parse(results.CREATE_ARRAY).data;
							dbcommand += `WHERE ID NOT IN (` + createdpolls.toString() + `) AND NOT TITLE GLOB '~~!@*' `;
							break;
						case "-b":
							votedpolls = JSON.parse(results.VOTE_ARRAY).data;
							createdpolls = JSON.parse(results.CREATE_ARRAY).data;
							bothpolls = createdpolls.concat(votedpolls);
							dbcommand += `WHERE ID NOT IN (` + bothpolls.toString() + `) AND NOT TITLE GLOB '~~!@*' `;
							break;
						default:
							dbcommand += `WHERE NOT TITLE GLOB '~~!@*' `
					}
				} catch {
					return message.channel.send("Error with filter.")
				}
				switch (args[1]) { //SORT
					case "n":
						dbcommand += `ORDER BY DATE DESC `;
						break;
					case "o":
						dbcommand += `ORDER BY DATE ASC `;
						break;
					case "mv":
						dbcommand += `ORDER BY VOTES_TOTAL DESC `;
						break;
					case "lv":
						dbcommand += `ORDER BY VOTES_TOTAL ASC `;
						break;
					default:
						dbcommand += `ORDER BY DATE DESC `;
						break;
				}
				
				db.all(dbcommand, (error,data) => {
					sendlistembed(data);
				});
			});
			
			
		}
		
		if (args[0] == "delete") {
			if (!(Number.isInteger(Number(args[1])))) {
				return message.channel.send("ID must be a ten digit number.");
			}
			searchid = Number(args[1]);
			
			db.get(`SELECT * FROM polls WHERE ID = ? AND NOT TITLE GLOB '~~!@*'`,[searchid], (error, data) => {
				if (data == undefined) {
					return message.channel.send("Invalid ID.");
				}
				
				if (message.author.id == 207901876434370562 || message.author.id == data.AUTHORID) {
					db.run("PRAGMA busy_timeout = 30000");
					db.run(`UPDATE polls SET TITLE = ? WHERE ID = ?`,[(`~~!@` + data.title),searchid], () => {
						return message.channel.send("Poll deleted!");
					});
				}
				
				//sendembed(data);
			});
		}
		
		function sendlistembed(select) {
			//console.log(select);
			descriptionbuilder = `Sort: `;
			switch (args[1]) {
				case "n":
					descriptionbuilder += `**[n]** [o] [lv] [mv]`;
					break;
				case "o":
					descriptionbuilder += `[n] **[o]** [lv] [mv]`
					break;
				case "lv":
					descriptionbuilder += `[n] [o] **[lv]** [mv]`
					break;
				case "mv":
					descriptionbuilder += `[n] [o] [lv] **[mv]**`
					break;
				default:
					descriptionbuilder += `**[n]** [o] [lv] [mv]`;
					break;
			}
			
			descriptionbuilder += ` -- Filter: `;
			switch (args[2]) {
				case "v":
					descriptionbuilder += `[-] [b] [c] **[v]** [n]`;
					break;
				case "c":
					descriptionbuilder += `[-] [b] **[c]** [v] [n]`;
					break;
				case "b":
					descriptionbuilder += `[-] **[b]** [c] [v] [n]`;
					break;
				case "-v":
					descriptionbuilder += `**[-]** [b] [c] **[v]** [n]`;
					break;
				case "-c":
					descriptionbuilder += `**[-]** [b] **[c]** [v] [n]`;
					break;
				case "-b":
					descriptionbuilder += `**[-]** **[b]** [c] [v] [n]`;
					break;
				default:
					descriptionbuilder += `[-] [b] [c] [v] **[n]**`;
					break;
			}
			
			
			
			if((!args[3]) || !(Number(args[3]))) {
				page = 1;
			} else {
				page = (args[3]);
			}
			
			idfieldbuilder = ``;
			titlefieldbuilder = ``;
			
			if (page < 1) {
				return message.channel.send("Page number must be at least 1.");
			}
			
			pages = Math.ceil(select.length / 8);
			
			if (page > pages) {
				idfieldbuilder = `0 results`;
				titlefieldbuilder = `0 results`;
			} else {
				for (i = (page * 8) - 9; i < (page * 8) + 8; i++) {
					
					try {
						let temptitle = select[i].TITLE;
						if (temptitle.length > 50) {
							temptitle = temptitle.slice(0,50);
							temptitle = temptitle.trim();
							temptitle += "...";
						}
						idfieldbuilder += '`' + select[i].ID + '`\n';
						titlefieldbuilder += '`' + temptitle + '?`\n';
					} catch{}
				}
			}
			
			var listembed = new MessageEmbed()
				.setColor("#c6c6c6")
				.setTitle(select.length + " results")
				.setDescription(descriptionbuilder)
				.addFields({
					name: "ID",
					value: idfieldbuilder,
					inline: true
				},{
					name: "Poll",
					value: titlefieldbuilder,
					inline: true
				})
				.setFooter({text:page + "/" + pages})
			return message.channel.send({embeds: [listembed]});
		}
        function sendembed(select) {
			a = select.VOTES_A;
			b = select.VOTES_B;
			t = a + b;
			bar_length = 8;
			
			words = `<:a_end4:993299735630852106>`;
			
			for (i = 0; i < bar_length; i++) {
				if (i < (Math.round((a / t) * bar_length))) { //A MID
					words += "<:a_mid4:993299736452943882>";
				} else if (i == (Math.round((a / t) * bar_length))) { //MID
					//words += "<a:mid:988990340646207528>";
					words += "<:mid4:993299739099529287>";
					words += "<:b_mid4:993299737912545382>";
				} else if (i > (Math.round((a / t) * bar_length))) { //B MID
					words += "<:b_mid4:993299737912545382>";
				}
			}
			if ((Math.round((a / t) * bar_length)) == bar_length) {
				//words += "<a:mid:988990340646207528>";
				words += "<:mid4:993299739099529287>";
			}
			
			if (a == "0" && b == "0") {
				//words += "<a:mid:988990340646207528>";
				words += "<:mid4:993299739099529287>";
			}

			words += "<:b_end4:993299737157570693>";
			
			if (a > b) {
				aword = "__" + a.toString() + "__";
				bword = b.toString();
			} else if (a < b) {
				bword = "__" + b.toString() + "__";
				aword = a.toString();
			} else {
				aword = a.toString();
				bword = b.toString();
			}
			
			let newdate = new Date(Number(select.DATE));
			let button_lifespan = (60 * 60 * 1000);
			let button_expiration = d.getTime() + button_lifespan;
			
			words += `\nButtons expire <t:${Math.floor(button_expiration / 1000)}:R>`
			
			var pollembed = new MessageEmbed()
				.setColor("#c6c6c6")
				.setAuthor({name: "Submitted by " + select.AUTHOR})
				.setTitle(select.TITLE + "?")
				.setDescription(words)
				.setTimestamp(newdate.toISOString())
				.setFooter({text: (select.ID).toString()})
				.addFields({
					name: "a. " + select.OPTION_A,
					value: aword,
					inline: true
				},{
					name: "b. " + select.OPTION_B,
					value: bword,
					inline: true
				},{
					name: `__Vote for ${select.OPTION_A}__`,
					value: "xd)poll vote "+select.ID+" a"
				},{
					name: `__Vote for ${select.OPTION_B}__`,
					value: "xd)poll vote "+select.ID+" b"
				})
			
			const row = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId(`vote_a-${select.ID}`)
						.setLabel('Vote A')
						.setStyle('DANGER')
				)
				.addComponents(
					new MessageButton()
						.setCustomId(`vote_b-${select.ID}`)
						.setLabel('Vote B')
						.setStyle('SUCCESS')
				)
				
			
			
			return message.channel.send({
				embeds: [pollembed],
				components: [row]
			}).then((newmessage) => {
				const collectorFilter = i => {
					db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[i.user.id], (error, results) => {
						//console.log("2")
						if (error) {
							throw error;
						}
						//console.log("3")
						try {
							votedpolls = JSON.parse(results.VOTE_ARRAY).data;
							//console.log("4")
							//console.log(Number(i.customId.slice(7,17)));
							if (votedpolls.includes(Number(i.customId.slice(7,17)))) {
								i.reply({content:"You already voted for this poll!",ephemeral: true});
								return false;
								
							} else {
								console.log("returned true");
								return true;
							}
						} catch {}
					})
				};
				const collector = newmessage.createMessageComponentCollector({
					time: button_lifespan/*,
					filter: collectorFilter*/
				});
				collector.on('collect', i => {
					//i.message.delete();
					//console.log("collected " + i.user.id);
					//console.log("1")

					
					db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[i.user.id], (error, results) => {
						//console.log("2")
						if (error) {
							throw error;
						}
						//console.log("3")
						try {
							votedpolls = JSON.parse(results.VOTE_ARRAY).data;
							//console.log("4")
							//console.log(Number(i.customId.slice(7,17)));
							if (votedpolls.includes(Number(i.customId.slice(7,17)))) {
								//console.log("5")
								//console.log(collector.total);
								//collector.handleDispose()
								return i.reply({content:"You already voted for this poll!",ephemeral: true});
								
							} else {
								//console.log("6")
								collector.stop();
								return i.message.delete();
								
							}
						} catch {}
					})
					//collector.stop();
					//return i.message.delete();
				});
				collector.on('end', collection => {
					collection.forEach(click => {
						//console.log(click.user.id, click.customId);
						//console.log(click.customId.slice(7,17));
						/*
						db.get(`SELECT * FROM polls WHERE ID = ? AND NOT TITLE GLOB '~~!@*'`,[click.customId.slice(7,17)], (error, data) => {
							if (data == undefined) {
								return message.channel.send("Invalid ID.");
							}
							
							sendembed(data);
						});*/
						vote(click.user.id, Number(click.customId.slice(7,17)), click.customId.slice(5,6));
					})
					
					
				})
				collector.on('ignore', l => {
					return i.reply({content:"You already voted for this poll!",ephemeral: true});
				})
			});
		}
		function vote(voter, searchid, votechoice) {
			db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[voter], (error, results) => {
				
				if (error) {
					throw error;
				}
				try {
					votedpolls = JSON.parse(results.VOTE_ARRAY).data;
					if (votedpolls.includes(searchid)) {
						return;
					}
				} catch {}
				
				db.get(`SELECT * FROM polls WHERE ID = ? AND NOT TITLE GLOB '~~!@*'`,[searchid], (error, data) => {
					if (error) {
						throw error;
					}
					if (data == undefined){
						return message.channel.send("Invalid ID.");
					}
					
					if (!(votechoice == "a" || votechoice ==  "b")) {
						return message.channel.send("You must use either \"`a`\" or \"`b`.\"");
					}
					
					if (votechoice == "a") {
						data.VOTES_A++;
						data.VOTES_TOTAL++;
						//console.log("Arived here");
						db.run("PRAGMA busy_timeout = 30000");
						db.run(`UPDATE polls SET VOTES_A = ?, VOTES_TOTAL = ? WHERE ID = ?`,[data.VOTES_A,data.VOTES_TOTAL,searchid],(error) => {
							//console.log("And here");
							if (error) {
								throw error;
							}
							sendembed(data);
							db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[voter], (error, results) => {
								if(error) {
									return console.log(error);
								}
								
								if(results != undefined) {
									votearray = JSON.parse(results.VOTE_ARRAY);
									
									votearray.data.push(searchid);
									
									db.run(`UPDATE polls_users SET VOTE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(votearray), voter]);
								} else {
									db.run(`INSERT INTO polls_users (USERID, VOTE_ARRAY, CREATE_ARRAY) VALUES (?, ?, ?)`, [voter, `{"data":[]}`, `{"data":[]}`], (error) => {
										votearray = JSON.parse(`{"data":[]}`);
										
										votearray.data.push(searchid);
									
										db.run(`UPDATE polls_users SET VOTE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(votearray), voter]);
									});
								}
							});
						});
					} else if (votechoice == "b") {
						data.VOTES_B++;
						data.VOTES_TOTAL++;
						db.run("PRAGMA busy_timeout = 30000");
						db.run(`UPDATE polls SET VOTES_B = ?, VOTES_TOTAL = ? WHERE ID = ?`,[data.VOTES_B,data.VOTES_TOTAL,searchid],(error) => {
							if (error) {
								throw error;
							}
							
							sendembed(data);
							db.get(`SELECT * FROM polls_users WHERE USERID = ?`,[voter], (error, results) => {
								if(error) {
									return console.log(error);
								}
								
								if(results != undefined) {
									votearray = JSON.parse(results.VOTE_ARRAY);
									
									votearray.data.push(searchid);
									
									db.run(`UPDATE polls_users SET VOTE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(votearray), voter]);
								} else {
									db.run(`INSERT INTO polls_users (USERID, VOTE_ARRAY, CREATE_ARRAY) VALUES (?, ?, ?)`, [voter, `{"data":[]}`, `{"data":[]}`], (error) => {
										votearray = JSON.parse(`{"data":[]}`);
										
										votearray.data.push(searchid);
									
										db.run(`UPDATE polls_users SET VOTE_ARRAY = ? WHERE USERID = ?`, [JSON.stringify(votearray), voter]);
									});
								}
							});
						});
					}
					
					
				});
			});
		
		}
	},
};

const helpembed = new MessageEmbed()
	.setColor("#c6c6c6")
	.setTitle("Everybody Votes but it's a command")
	.setDescription("xd)poll allows you and others to create and vote on user made polls. Every poll can only have two questions.\nEach poll has an ID that you can use to find the exact poll again in case you need it.")
	.addFields({
		name: "`xd)poll`",
		value: "Get a random poll. Excludes polls you've already voted for."
	},{
		name: "`xd)poll create <question>? <option 1>? <option 2>?`",
		value: "Create a poll. Each question and options HAVE to end with a `?`.\n`<question>` is the question you're asking\n`<option 1>` is the first answer people can choose\n`<option 2>` is the second answer people can choose."
	},{
		name: "`xd)poll vote <id> <option>`",
		value: "Vote on a poll.\n`<id>` is the ID of the poll. It should be on the embed for it.\n`<option>` is which option of the poll you are voting. Should be either \"`a`\" or \"`b`\""
	},{
		name: "`xd)poll search <id>`",
		value: "Returns the poll and its current results by ID.\n`<id>` is the ID of the poll. You'll need to already know it before using this command."
	},{
		name: "`xd)poll list [sort] [filter] [page]`",
		value: "Returns a list of polls.\n\n`[sort]` is how you want the list sorted. Can be `n` for newest, `o` for oldest, `mv` for most voted, or `lv` for least voted.\n`[filter]` filters the list to what you want. Can be `v` for polls you've voted on, `c` for polls you've created, `b` for both filters combined, or `n` for no filter. Adding a `-` in front of the filter will exclude the filtered results rather than only showing the filtered results. example: `xd]poll list mv -b` will show a list of polls sorted by most voted and will exclude any polls you've created or voted on.\n`[page]` is what page of the list you want to show."
	},{
		name: "`xd)poll rand`",
		value: "Get a true random poll. It can include a poll you've already voted for."
	})


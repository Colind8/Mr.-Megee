const fetch = require('node-fetch');
const config = require('../config.json');
const prefix = config.prefix;


module.exports = {
	name: 'steamroll',
	description: 'Returns a random game for you to play.',
    usage: '`xd)steamroll [steamID]`',
    category: 'games',
	async execute(message) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
	    const command = args.shift().toLowerCase();
		
		if(!args[0]) { //REQUEST ALL STEAM GAMES
			try {
				var response = await fetch("http://api.steampowered.com/ISteamApps/GetAppList/v2");
				var data = await response.json();
				fetchgame(1,null);
			} catch {
				return message.channel.send("Unfortunately the game selected is no longer avalible.");
			}
		} else if (!isNaN(parseInt(args[0]))) { //REQUEST USER STEAM GAMES by id
			try {
				var response = await fetch("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=E9FE5072AC6290BBC6BF94CC809123F4&steamid=" + args[0] + "&format=json");
				var data = await response.json();
				fetchgame(2,args[0]);
				
			} catch {
				return message.channel.send("Invalid SteamID. Use the number or name in your Steam URL. Also, make sure games details are set to public.");
			}
			
		} else { //REQUEST USER STEAM GAMES by vanityurl
			try {
				var steamid = await fetch ("http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=E9FE5072AC6290BBC6BF94CC809123F4&vanityurl=" + args[0]);
				var datasteamid = await steamid.json();
				
				var response = await fetch("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=E9FE5072AC6290BBC6BF94CC809123F4&steamid=" + datasteamid.response.steamid + "&format=json");
				var data = await response.json();
				
				fetchgame(3,datasteamid.response.steamid);
				
			} catch {
				return message.channel.send("Invalid SteamID. Use the number or name in your Steam URL. Also, make sure games details are set to public.");
			}
			
		}
		
		async function checkgame(appid) {
			try {
				var gamecheck_response = await fetch("https://store.steampowered.com/api/appdetails?appids=" + appid);
				var gamecheck_data = await gamecheck_response.json();
				var gamecheck_contentdesc = gamecheck_data[appid].data.content_descriptors.ids;
				if (gamecheck_contentdesc.includes(3)) { //If game is disgusting not jesus
					return true;
				}
				if (gamecheck_data[appid].data.type != "game") { //If game is not a game
					return true;
				}
			} catch {
				return true;
			}
		}
		
		async function fetchgame(id, input) {
			switch (id) {
				case 1:
					var rand = Math.floor(Math.random() * data.applist.apps.length);
					var game = data.applist.apps[rand];
					await checkgame(game.appid).then(badgame => {
						if (badgame == true) {
							fetchgame(1,input);
						} else {
							var url = "https://store.steampowered.com/app/" + game.appid;
							return message.channel.send("App " + rand + " of " + data.applist.apps.length + "\n" + url);
						}
						
					});
					break;
				case 2:
					try {
						var rand = Math.floor(Math.random() * data.response.games.length);
						var game = data.response.games[rand];
						await checkgame(game.appid).then(badgame => {
							if (badgame == true) {
								fetchgame(2,input);
							} else {
								var url = "https://store.steampowered.com/app/" + game.appid;
								return message.channel.send("App " + rand + " of " + data.response.games.length + "\n" + url);
							}
						});
					} catch {
						return message.channel.send("Invalid SteamID. Use the number or name in your Steam URL. Also, make sure games details are set to public.");
					}
					break;
				case 3:
					try {
						var rand = Math.floor(Math.random() * data.response.games.length);
						var game = data.response.games[rand];
						checkgame(game.appid).then(badgame => {
							if (badgame == true) {
								fetchgame(2,input);
							} else {
								var url = "https://store.steampowered.com/app/" + game.appid;
								return message.channel.send("App " + rand + " of " + data.response.games.length + "\n" + url);
							}
						});
					} catch {
						return message.channel.send("Invalid SteamID. Use the number or name in your Steam URL. Also, make sure games details are set to public.");
					}
					break;
					
			}
		}

        
    },
};


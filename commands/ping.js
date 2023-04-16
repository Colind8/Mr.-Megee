module.exports = {
	name: 'ping',
	description: 'Replies with Pong!',
    usage: '`xd)ping`',
    category: 'utility',
	async execute(message) {
		await message.channel.send('Pong!');
	},
};
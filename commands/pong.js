module.exports = {
	name: 'pong',
	description: 'Replies with Ping!',
    usage: '`xd)pong`',
    category: 'utility',
	async execute(message) {
		await message.channel.send('Po- Ping!');
	},
};
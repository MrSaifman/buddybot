//Name: rules.js
//Project: Buddy Bot
//Author: Case Hassak
//Description: Used to set rules for rules channel and update rules.

const Discord = require('discord.js');
let rules = require("../rules.json");
module.exports.run = async (client, message, args) => {
    message.delete();
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You do not have permission to set rules!"); //Makes sure user has permission.
    const exampleEmbed = new Discord.MessageEmbed()
	.setColor('#00ffff')
	.setTitle('Welcome to Buddies™')
	.setAuthor('Lumenski', `${message.author.avatarURL()}`, 'https://discord.js.org')
	.setDescription("I'm a buddy, your a buddy, everyone here is a buddy!")
	.setThumbnail('https://static.wikia.nocookie.net/fairlyoddparents/images/1/1e/Da_Rules.png/revision/latest?cb=20180503070000&path-prefix=en')
	.addFields(
		{ name: 'Server Rules:', value: `${rules.rules}`},
        { name: 'Additional Roles:', value: 'Please visit <#842632032294666272> for additional roles.'},
		{ name: 'Join the Server:', value: 'Please react to this message with ✅ to gain access to the main chats!\n'},
	)
	.setTimestamp()
	.setFooter('Rules are subject to change without notice by staff members');

message.channel.send(exampleEmbed)
.then((react) => {
    react.react('✅');
});

};
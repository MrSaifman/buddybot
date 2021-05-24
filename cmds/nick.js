//Name: nick.js
//Project: Buddy Bot
//Author: Case Hassak
//Description: Used to allow a user to have a different nickname.

module.exports.run = async (client, message, args, con) => {
    if(message.member.hasPermission("MANAGE_NICKNAMES")) return;
    if(args[0] === undefined) return;
    const target = message.author.id;
    let toNick = message.guild.member(message.author);
    message.member.setNickname(args[0]);
}
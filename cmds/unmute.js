module.exports.run = async (client, message, args) => {
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You do not have permission to mute!")
        //Get the user and returns message if no user is specified in the command
        let toMute = message.guild.member(message.mentions.users.first() || message.guild.member(args[0])); //Takes a user and converts it to a member object
        if(!toMute) return message.channel.send("You did not specify a user mention!");

        let role = message.guild.roles.cache.find(r => r.name === "Muted");
            if(!(toMute.roles.cache.some(role => role.name === "Muted")))  return message.channel.send("User is not muted!");
            await toMute.roles.remove(role);
            message.channel.send(`I have muted ${toMute}!`);
            return;
}
//Name: purge.js
//Project: Buddy Bot
//Author: Case Hassak
//Version: 1.0
//Description : Used to remove a given number of messages from a channel.

module.exports.run = async (client, message, args) => {
  if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You do not have permission to mute!"); //Makes sure user has permission to mute.
  
  if(isNaN(parseFloat(parseInt(args[0])))){
    message.channel.send(`Invalid command!\n!purge [num]`);
    return;
  };
  
  let numMessages; 
  if(args[0] == undefined){
    numMessages = 2;
  }else if(args[0] >= 100){
    numMessages = 100;
  }else if(args[0] < 0){
    numMessages = 1;  
  }else{
    numMessages = parseInt(args[0]) + 1;
  };

  await message.channel.messages.fetch({ limit: numMessages })
    .then(messages => message.channel.bulkDelete(messages));
};
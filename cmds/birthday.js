//Name: birthday.js
//Project: Buddy Bot
//Author: Case Hassak
//Description: Used to set a users birthday.

module.exports.run = async (client, message, args, con) => {
    //Gets the user's SQL entry from the message id. Then it checks if a user already has a set birthday. Othewise it will set users birthday in their SQL entry.
    con.query(`SELECT * FROM users WHERE id = ${message.author.id}`, (error, rows)=>{
        if(rows[0].birthday !== null){
            return message.channel.send(`Birthday set to ${rows[0].birthday}. Contact a mod if this needs to be changed.`);
        }else{
            //Configures date to put into SQL.
            let date = args[0].split("/");
            let mm = Number(date[0]);
            let dd = Number(date[1]);

            //Checks to make sure the birthday is a valid date.
            if(mm < 1 || mm > 12) return message.channel.send("Invalid Month!\n!Birthday mm/dd");
            if(dd < 1 || dd > 31) return message.channel.send("Invalid Day!\n!Birthday mm/dd");
            if(isNaN(mm) || isNaN(dd)) return message.channel.send("Invalid Command!\n!Birthday mm/dd");
        
            //Appends a 0 to the birthday day or month if needed.
            if(dd<10) dd='0'+dd;
            if(mm<10) mm='0'+mm;

            //Confirmation check from user.
            let birthday = `${mm}-${dd}`
            message.channel.send(`Your bithday is ${birthday}. Is this correct? \nYou will not be able to change this again!`)
            .then((question) => {
                question.react('👍');
                question.react('👎');

                //Filter check for the user.
                const filter = (reaction, user) => {
                  return ['👍', '👎'].includes(reaction.emoji.name) && user.id === message.author.id;
                };
        
                //Collector
                const collector = question.createReactionCollector(filter, {
                    max: 1,
                    time: 30000
                  });
            
                collector.on('end', (collected, reason) => {
                if (reason === 'time'){
                    message.reply('Birthday set cancelled.');
                }else{
                    // Grab the first reaction in the array.
                    let userReaction = collected.array()[0];
                    let emoji = userReaction._emoji.name;
                      
                    //Handles the response based on the users reaction to the message.
                    if (emoji === '👍') {
                      message.reply('Birthday Confirmed!🎉');
                      con.query(`SELECT * FROM users WHERE id = ${message.author.id}`, (error, rows)=>{
                          if(error) throw error;
                          sql = `UPDATE users SET birthday = '${birthday}' WHERE id = '${message.author.id}'`;
                          return con.query(sql);
                      });
                    }else if (emoji === '👎'){
                        message.reply('Birthday set cancelled.');
                    }
                }
                });
            });
        }
    });
}



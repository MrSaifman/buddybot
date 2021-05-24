//Name: money.js
//Project: Buddy Bot
//Author: Case Hassak
//Description: Used to show a users money from the SQL table.

module.exports.run = async (client, message, args, con) => {
    let target = message.author.id;
    con.query(`SELECT * FROM users WHERE id = ${target}`, (error, rows)=>{
        if(error) throw error;
        return message.channel.send(`Money: $${rows[0].money}`);
    });
}

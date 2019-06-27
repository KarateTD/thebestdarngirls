'use strict'

class lookUp {

    static searching(aws, mysql, searchFor) {

        return new Promise((resolve, reject) => {
            if(aws && mysql && searchFor){

                var myHost, myUser, myPassword, myDatabase;
                myHost = process.env.host;
                myUser = process.env.username;
                myPassword = process.env.password;
                myDatabase = process.env.database;

                Promise.all([myHost,myUser,myPassword,myDatabase]).then(function(values){

                   // console.log("Host: " + myHost + "\nUser: " + myUser + "\nPassword: " + myPassword +"\nDatabase: " + myDatabase)

                     let connection = mysql.createConnection({
                         host: myHost,
                         user: myUser,
                         password: myPassword,
                         database: myDatabase
                     }); //end create connect

                     connection.connect(function(err){
                         if (err) {
                            console.log("error is " + err)
                            reject(err);
                         }
                     }); //end connect

                     connection.query('select * from reviews where title like \'%'+searchFor+'%\'', function(err, rows, fields){
                        var resultString = "[";
                        var count = 1;
                        connection.end();
                        if (err){
                            reject(err);
                        }else{
                            Object.keys(rows).forEach(function(key){
                                var row = rows[key];
                                resultString += "{\n\"option\":\""+count+"\",\n\"mtitle\":\""+ row.title+"\",\n\"review\":\""+row.review+"<br/><br/>"+row.rating+" out of 5 stars.\",\n\"image\":{\n\"smallImageUrl\":\"https://thebestdarngirls.s3.amazonaws.com/library/small-image/"+row.image+"\",\n\"largeImageUrl\":\"https://thebestdarngirls.s3.amazonaws.com/library/small-image/"+row.image+"\"\n}\n},"
                                count = count + 1;
                            }) //end forEach
                            resultString = resultString.slice(0, -1);
                            resultString += "]";
                            resolve(resultString);

                        } //end if/else
                     }); //end query
                }) //end promise all
            }else{
                reject("all values must exist");
            }//end if/else
        }); //end new promise
    } //end searching
} //end lookup

module.exports = lookUp;
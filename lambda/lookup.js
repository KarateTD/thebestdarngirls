module.exports = function (aws, mysql, searchFor) {

    //let mysql = require('mysql');
    //let aws = require('aws-sdk');

    var credentials = new aws.SharedIniFileCredentials({profile: 'personal'});
    aws.config.credentials = credentials;

    var paramHost = { Name: 'mysqlHost', WithDecryption: true};
    var paramUser = { Name: 'mysqlUser', WithDecryption: true};
    var paramPassword = { Name: 'mysqlPassword', WithDecryption: true};
    var paramDatabase = { Name: 'mysqlDatabase', WithDecryption: true};

    var request = new aws.SSM({apiVersion: '2014-11-06', region: 'us-east-1'});
    var Host = request.getParameter(paramHost).promise().then(function(data){ return data.Parameter.Value});
    var User = request.getParameter(paramUser).promise().then(function(data){ return data.Parameter.Value});
    var Password = request.getParameter(paramPassword).promise().then(function(data){ return data.Parameter.Value});
    var Database = request.getParameter(paramDatabase).promise().then(function(data){ return data.Parameter.Value});

    var myHost, myUser, myPassword, myDatabase;

    Promise.all([Host,User,Password,Database]).then(function(values){
        myHost = values[0]; myUser = values[1]; myPassword = values[2]; myDatabase = values[3];

        let connection = mysql.createConnection({
            host: myHost,
            user: myUser,
            password: myPassword,
            database: myDatabase
        });

        connection.connect(function(err){
            if (err) {
                return console.error("error: " + err.message);
            }else{
                console.log('Connected to the MySQL server');
            }
        });

        connection.query('select * from reviews where title like \'%'+searchFor+'%\'', function(err, rows, fields){
            var resultString = "";
            var count = 1;
            connection.end();
            if (err){
                console.log('Error while performing Query.');
            }else{
               Object.keys(rows).forEach(function(key){
                var row = rows[key];
                resultString += "{\n\"option\": \""+count+"\",\n\"mtitle\": \""+ row.title+"\",\n\"review\": \""+row.review+"<br/><br/>"+row.rating+" out of 5 stars.\",\n\"image\":{\n\"smallImageUrl\":\"https://thebestdarngirls.s3.amazonaws.com/library/small-image/"+row.image+"\",\n\"largeImageUrl\":\"https://thebestdarngirls.s3.amazonaws.com/library/small-image/"+row.image+"\"\n}\n},"
                count = count + 1;
            })
            resultString = resultString.slice(0, -1);
            console.log("returning: " + resultString);
            return resultString;

            }


        });

    })

}
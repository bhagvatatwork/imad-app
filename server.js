
var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool=require('pg').Pool;  /* For Db package we are using 'node-postgres' doc@ https://github.com/brianc/node-postgres */
var crypto = require('crypto');
var bodyParser = require ('body-parser'); 
// to Parse incoming request bodies in a middleware and make it available under req.body property
var session = require('express-session');

var config={
    host: "db.imad.hasura-app.io",
    port: "5432",
    user: "bhagvatatwork",
    //password: process.env.DB_PASSWORD,
    password: "db-bhagvatatwork-1499",
    database: "bhagvatatwork"
};

var app = express();
var pool= new Pool(config);
app.use(morgan('combined'));

// parse application/json
app.use(bodyParser.json()); //in case express app see JSON content ; load it in req.body content and in json format
/* other options inclue:
    bodyParser.raw([options])
    bodyParser.text([options])
    bodyParser.urlencoded([options])
*/    
app.use(session({
    secret: 'SomeRandomeSecretValue',
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30}
}));

// function to create common template (for article-one and article-two) and the dynamic data is filled by the calling function
function createTemplate (data){
	var title = data.title;
	var heading = data.heading;	
	var date = data.date;
	var content = data.content;

	var htmlTemplate=`
	<html>
		<head>
			${title}
			<meta name="viewport" content="width-device-width, initial-scale=1" />
			<link href="/ui/style.css" rel="stylesheet" />
		</head>
		<body>
			<div class="container">
				<div>
					<a href="/">Home </a>
				</div>
				<hr/>	
				<h3>
					${heading}
				</h3>
				<div>
				    ${date.toDateString()}
					<!--instead of using just 'date' as it shows date in java script object form so shown as 
					Mon Sep 05 2016 00:00:00 GMT+0000 (UTC); so to change it into our format -->
				</div>
				<div>
					${content}
				</div>
			</div>
		</body>
	</html>
	`;	
	return htmlTemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

function hash(input,salt){
    // How do we create a hash?
    var hashed=crypto.pbkdf2Sync(input,salt,10000,512,'sha512');
    return ["pbkdf2","10000",salt,hashed.toString('hex')].join('$');
}

app.get('/hash/:input', function(req,res){
    var hashedString = hash(req.params.input,'this-is-some-random-string');
    res.send(hashedString);
});

//As username and password are sensitive information can't have it in a GET request; so use POST instead
app.post('/create-user',function(req,res){
    // create new username and password
    var username = req.body.username;   //let's say we receive data in JSON format from user (use express framework 'body-parser')
    var password = req.body.password;
    
    var salt=crypto.randomBytes(128).toString('hex');
    var dbString = hash(password,salt);
    // DB table name 'user' is special keyword in postgres DB; hence used in doubleQuotes
    pool.query('INSERT INTO "user" (username, password) VALUES ($1, $2)',[username,dbString],function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }
        else{
            res.send('User Successfully Created' +username);
        }
    });
});
/* to test POST /create-user request use curl command
D:\>curl -XPOST --data '{"username": "bhagsi", "password": "password"}' http://bhagvatatwork.imad.hasura-app.io/create-user 
 >> Not a buffer <type error> pbkdf2   - due to express framework not able to determine user is sending content type as JSON
    >> so add HTTP header informing content type use flag -H
    >> also - v flag  (to see request in detailed manner)
    
D:\>curl -v -XPOST -H 'Content-Type:application/json' --data '{"username": "bhagsi", "password": "password"}' http://bhagvatatwork.imad.hasura-app.io/create-user

OUTPUT from server terminal:
Last login: Fri Mar  9 07:36:47 2018 from 203.199.72.210
bhagvatatwork@imad-feb-18-ssh:~$ curl -v -XPOST -H 'Content-Type:application/json' --data '{"username": "bhagsi", "password": "password"}' http://bhagvatatwork.imad.hasura-app.io/create-user
Note: Unnecessary use of -X or --request, POST is already inferred.
*   Trying 35.200.204.26...
* Connected to bhagvatatwork.imad.hasura-app.io (35.200.204.26) port 80 (#0)
> POST /create-user HTTP/1.1
> Host: bhagvatatwork.imad.hasura-app.io
> User-Agent: curl/7.47.0
> Accept: '*'/*
> Content-Type:application/json
> Content-Length: 46
> 
* upload completely sent off: 46 out of 46 bytes
< HTTP/1.1 200 OK
< Server: openresty/1.9.7.3
< Date: Thu, 15 Mar 2018 06:53:32 GMT
< Content-Type: text/html; charset=utf-8
< Content-Length: 31
< Connection: keep-alive
< X-Powered-By: Express
< ETag: W/"1f-RE8EVmLMV3rSaK2Zjjp8zvfg7xY"
< 
* Connection #0 to host bhagvatatwork.imad.hasura-app.io left intact
User Successfully Createdbhagsibhagvatatwork@imad-feb-18-ssh:~$ 
*/

app.post('/login',function(req,res){
    var username = req.body.username;   
    var password = req.body.password;
    
    // DB table name 'user' is special keyword in postgres DB; hence used in doubleQuotes
    pool.query('SELECT * FROM "user" WHERE username = $1',[username],function(err,result){
        if(err){
            res.status(500).send(err.toString());
        }else{
            if(result.rows.length === 0){
                res.send(403).send("username/password is invalid");
            }else{
                //Match the password
                var dbString = result.rows[0].password;
                var salt = dbString.split('$')[2]; //@ index 2 will have encoded salt value
                var hashedPassword = hash(password,salt);//Creating a hash based on the password submitted and the original salt
                if (hashedPassword === dbString){
                    // set a session
                    req.session.auth = {userId: result.rows[0].id};
                    // This will set cookie with a session id
                    // internally on the server side, it maps the session id to an object
                    // {auth: {userid}}
                    
                    res.send('Credentials correct');
                    
                }else{
                    res.send(403).send('username/password is invalid');       
                }
            }
        }
    });
});

app.get('/check-login', function(req,res){
   if(req.session && req.session.auth && req.session.auth.userId) {
       res.send('You are logged in: '+req.session.auth.userId.toString());
   }else{
       res.send('You are not logged in');
   }
});

app.get('/logout', function(req,res){
    delete req.session.auth;
    res.send('Logged out');
});




app.get('/articles/:articleName', function (req, res) {    // :articleName  - provided by express framework
	/* SQL injection: if user do not enter 'article-one' and instead enter ';DELETE from article WHERE 'a'='a
	SELECT * FROM article WHERE title = ''
	pool.query("SELECT * FROM article WHERE title = '", + req.params.articleName + "'",function(err,result){
	......hence we need to user query parameterization provided by SQL librabry */
	
	pool.query("SELECT * FROM article WHERE title = $1", [req.params.articleName],function(err,result){
	   if(err) {
	       res.status(500).send(err.toString());
	   }else{
	       if(result.rows.length === 0){
	           res.status(404).send("Article not found...");
	       }
	       else{
	           var articleData=result.rows[0];
	           res.send(createTemplate(articleData));
	       }
	   }
	});
});


app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {                  // To handle javascript file 'ui/main.js' (dealing with client)
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});


// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});


var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool=require('pg').Pool;  /* For Db package we are using 'node-postgres' doc@ https://github.com/brianc/node-postgres */
var crypto = require('crypto');

var config={
    host: "db.imad.hasura-app.io",
    port: "5432",
    user: "bhagvatatwork",
    //password: process.env.DB_PASSWORD,
    password: "db-bhagvatatwork-1499",
    database: "bhagvatatwork"
};

var app = express();
app.use(morgan('combined'));

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
    var hashed=crypto.pbkdf2Sync(input,salt,10000,512,'sha-512');
    console.log('hashed password value (HPV): ',hashed);
    console.log('HPV (encoded in hex format): ',hashed.toString('hex'));
    return hashed.toString('hex');
}
app.get('/hash/:input', function(req,res){
    var hashedString = hash(req.params.input,'this-is-some-random-string');
    res.send(hashedString);
});

var pool = new Pool(config);
app.get('/test-db',function(req, res){
    pool.query('SELECT * FROM test', function(err, result){
        if(err){
            res.status(500).send(err.toString());
        }
        else{
            res.send(JSON.stringify(result.rows));
        }
    });
});


var counter=0;
app.get('/counter',function(req,res){
    counter=counter+1;
    res.send(counter.toString());
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


var names=[];
app.get('/submit-name/:name', function (req, res) {
  // Get the name from the request
  var name= req.params.name;
  names.push(name);
  
  //JSON - javascript object notation - to covert javascript object to string
  res.send(JSON.stringify(names));
});

//above function implementation now using query parameter string (Also this function I have placed before "app.get('/:articleName', function (req, res)" to avoid error that might result into parameters not being handled)
app.get('/submit-name', function (req, res) {   //URL: /submit-name?name=xxx
  // Get the name from the request
  var name= req.query.name;
  names.push(name);
  
  //JSON - javascript object notation - to covert javascript object to string
  res.send(JSON.stringify(names));
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

var express = require('express');
var morgan = require('morgan');
var path = require('path');

var app = express();
app.use(morgan('combined'));

/* created list of articles data that varies from one page to other
var articleOne={
	title: 'Article One | Bhagvat',
	heading: 'Article One',
	date: 'Sep 5, 2016',
	content:`
	<p>
					This is the content from first article.This is the content from first article.This is the content from first article.This is the content from first article.This is the content from first article.This is the content from first article.This is the content from first article.
	</p>`
};
*/

var articles={
	'article-one': {
		title: 'Article One | Bhagvat',
		heading: 'Article One',
		date: 'Sep 5, 2016',
		content:`
		<p>
						This is the content from first article.This is the content from first article.This is the content from first article.This is the content from first article.This is the content from first article.This is the content from first article.This is the content from first article.
		</p>`
	},
	
	'article-two': {
		title: 'Article Two | Bhagsi',
		heading: 'Article Two',
		date: 'Jan 1, 2016',
		content:`
		<p>
						This is the content from Second article.
		</p>`
	}	
}

// function to create common template (for article-one and article-two) and the dynamic data is filled by the calling function
function createTemplate (data){
	var title=data.title;
	var heading=data.heading;	
	var date=data.date;
	var content=data.content;

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
					${date}
				</div>
				<div>
					${content}
				</div>
			</div>
		</body>
	</html>`
	
	return htmlTemplate;
}

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

/*
app.get('/article-one', function (req, res) {
  //res.sendFile(path.join(__dirname, 'ui', 'article-one.html'));  // earlier implementation with file article-one.html
  res.send(createTemplate(articles.articleOne));  // new implementation wherein content is published dynamically at run time
});

app.get('/article-two', function (req, res) {
  //res.sendFile(path.join(__dirname, 'ui', 'article-two.html'));  // earlier implementation with file article-two.html
  res.send(createTemplate(articles.articleTwo));  // new implementation wherein content is published dynamically at run time
});
*/

app.get('/:articleName', function (req, res) {    // /:articleName  - provided by express framework
	var articleName= req.params.articleName;
  res.send(createTemplate(articles[articleName]));  // new implementation wherein content is published dynamically at run time
});

app.get('/article-three', function (req, res) {
  res.send("This is from Article-Three page");
});


var counter=0;
app.get('/counter',function(req,res){
    counter=counter+1;
    res.send(counter.toString());
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
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

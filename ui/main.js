console.log('Loaded!!!');

//Submit username/pwd to login
var submit = document.getElementById('submit_btn');

submit.onclick=function(){       // Make a request to server and send the name
	//Crete a request object
    var request = new XMLHttpRequest();
	
	// capture the response and store it in a variable
	request.onreadystatechange=function(){
		if(request.readyState==XMLHttpRequest.DONE){
			if(request.status==200){
			    alert('Logged in successfully');
			}else if(request.status ===403){
			    alert('username/password is invalid');
			}else if(request.status ===500){
			    alert('something went wrong on the server');
			}	
		}
	};
    
	//Make a request 
	var username=document.getElementById('username').value;
	var password=document.getElementById('password').value;
	console.log(username);
	console.log(password);
	
	request.open("POST",'http://bhagvatatwork.imad.hasura-app.io/login',true);
	request.setRequestHeader('Content-Type','application/json');
	request.send(JSON.strigify({username: username, password: password}));
};



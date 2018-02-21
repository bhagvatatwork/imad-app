console.log('Loaded!!!');

//Change the text of the div element where id='main-txt'
var element= document.getElementById('main-txt');
element.innerHTML='New value';

/*
// move the image by 200 pixel on click
var img=document.getElementById('madi');
img.onclick	= function(){
	img.style.marginLeft='200px';
};
*/

//move the image gradually like animation
var img=document.getElementById('madi');
var marginLeft=0;
function moveRight(){
	marginLeft = marginLeft+1;
	img.style.marginLeft = marginLeft + 'px';
}
img.onclick	= function(){
	var interval= setInterval(moveRight,100);
};



//counter code
var button=document.getElementById('counter');
var counter=0;

button.onclick= function(){
    //Crete a request object
    var request = new XMLHttpRequest();
	
	// capture the response and store it in a variable
	request.onreadystatechange=function(){
		if(request.readyState==XMLHttpRequest.DONE){
			if(request.status==200){
				//code for counter increment
				var counter=request.responseText;
				var span= document.getElementById('count');
				span.innerHTML=counter.toString();      
			}	
		}
	};
    
	//Make a request to counter endpoint
	request.open("GET",'http://localhost:8080/counter',true);
	request.send(null);
	
    /*Manual: Render the variable in correct span
	var span= document.getElementById('count');
    span.innerHTML=counter.toString();      
    counter=counter + 1;
    */
};


//Submit name logic
var submit = document.getElementById('submit_btn');
submit.onclick=function(){       // Make a request to server and send the name
	//Crete a request object
    var request = new XMLHttpRequest();
	
	// capture the response and store it in a variable
	request.onreadystatechange=function(){
		if(request.readyState==XMLHttpRequest.DONE){
			if(request.status==200){
				// Capture a list of names and render it as a list
				var names=request.responseText;
				names=JSON.parse(names);   // Reverse what happen at server side: convert a string into array elements
				var list='';
				for(var i=0;i<names.length;i++){
					list+='<li>'+ names[i] +'</li>';
				}
				var ul= document.getElementById('namelist');
				ul.innerHTML = list;
			}	
		}
	};
    
	//Make a request to 'submit-name' endpoint
	//var nameInput=document.getElementById('name');
	//var name=nameInput.value;
	var name=document.getElementById('name').value;
	request.open("GET",'http://localhost:8080/submit-name?name='+name,true);
	request.send(null);

};



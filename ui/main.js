console.log('Loaded!!!');

//Change the text of the div element where id='main-txt'
var element= document.getElementById('main-txt');
element.innerHTML='New value';

// move the image by 200 pixel on click
var img=document.getElementById('madi');
img.onclick	= function(){
	img.style.marginLeft='200px';
};

/*
//counter code
var button=document.getElementById('counter');
var counter=0;

button.onClick= function(){
    //Make a request to counter endpoint
    
    // capture the response and store it in a variable
    
    //Render the variable in correct span
    counter=counter + 1;
    var span= document.getElementById('count');
    span.innerHTML=counter.toString();
        
};

*/
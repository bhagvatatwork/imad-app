console.log('Loaded!');

//counter code
var counter=0;
var button=document.getElementById("counter");

button.onClick= function(){
    //Make a request to counter endpoint
    
    // capture the response and store it in a variable
    
    //Render the variable in correct span
    counter=counter+1;
    var span= document.getElementById("count");
    span.innerHTML=counter.toString();
        
};


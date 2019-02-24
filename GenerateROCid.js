var city = new Array(1,10,19,28,37,46,55,64,39,73,82,2,11,20,48,29,38,47,56,65,74,83,21,3,12,30);
var id = new Array();
id[0] = String.fromCharCode(Math.floor(Math.random() * (26)) + 65);
id[1] = Math.floor(Math.random() * (2)) + 1;
for(var i=2; i<9; i++){
    id[i] = Math.floor(Math.random() * (9)) + 0;
}
var total = city[id[0].charCodeAt(0)-65];
for(var i=1; i<=8; i++){
    total += eval(id[i]) * (9 - i);
}
var total_arr = (total+'').split('');
var lastChar = eval(10-total_arr[total_arr.length-1]);
var lastChar_arr = (lastChar+'').split('');
id[id.length++] = lastChar_arr[lastChar_arr.length-1];
var idcard = id.join('');

function copyToClipboard(text){
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute('value', text);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}
copyToClipboard(idcard);
alert("Copied the text: " + idcard);

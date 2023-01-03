
par_op = '｟';
par_cl = '｠';
address_server = "http://" + document.getElementById("IP").value + ":" + document.getElementById("PORT").value + "/";
console.log('Server address: ' + address_server);
textareaMaxLen = 5000;
cbox_debug = document.getElementById("cbox_debug");
console_div = document.getElementById("console_div");
console_table = document.getElementById("console_table");
src_textarea = document.getElementById("src_textarea");
tgt_textarea = document.getElementById("tgt_textarea");
sync_button = document.getElementById("sync_button");
src_count = document.getElementById("src_count");
tgt_count = document.getElementById("tgt_count");
src_lang = document.getElementById("src_lang");
tgt_lang = document.getElementById("tgt_lang");
mydiv = document.getElementById("mydiv");
myselect = document.getElementById("myselect");

//when the initial HTML document has been completely loaded and parsed, without waiting for style sheets, images, and subframes to finish loading
document.addEventListener("DOMContentLoaded", function(){
    src_count.innerHTML = '0/' + textareaMaxLen;
    tgt_count.innerHTML = '0/' + textareaMaxLen;
    console_table.disabled = true;
    sync_button.disabled = true;
    src_textarea.disabled = false;
    tgt_textarea.disabled = false;
    tag_s2t = par_op + 'to-' + tgt_lang.options[tgt_lang.selectedIndex].value + par_cl;
    tag_t2s = par_op + 'to-' + src_lang.options[src_lang.selectedIndex].value + par_cl;
});

//change of source language
src_lang.addEventListener('change', (event) => {
    tag_s2t = par_op + 'to-' + tgt_lang.options[tgt_lang.selectedIndex].value + par_cl;
    tag_t2s = par_op + 'to-' + src_lang.options[src_lang.selectedIndex].value + par_cl;
    //initial situation
    src_textarea.value = ''
    tgt_textarea.value = ''
    src_count.innerHTML = '0/' + textareaMaxLen;
    tgt_count.innerHTML = '0/' + textareaMaxLen;
    console_table.disabled = true;
    sync_button.disabled = true;
    src_textarea.disabled = false;
    tgt_textarea.disabled = false;
});

//change of target language
tgt_lang.addEventListener('change', (event) => {
    tag_s2t = par_op + 'to-' + tgt_lang.options[tgt_lang.selectedIndex].value + par_cl;
    tag_t2s = par_op + 'to-' + src_lang.options[src_lang.selectedIndex].value + par_cl;
    //initial situation
    src_textarea.value = ''
    tgt_textarea.value = ''
    src_count.innerHTML = '0/' + textareaMaxLen;
    tgt_count.innerHTML = '0/' + textareaMaxLen;
    console_table.disabled = true;
    sync_button.disabled = true;
    src_textarea.disabled = false;
    tgt_textarea.disabled = false;
});

//when src_textarea is modified
src_textarea.addEventListener('input', (event) => {
    autoGrow(src_textarea,tgt_textarea);
    if (src_textarea.value.length){ //the other textarea is disabled and the sync_button activated
	tgt_textarea.disabled = true;
	sync_button.disabled = false;
	sync_button.childNodes[0].nodeValue = '\u25B6 BiSync \u25B6';
	//src_textarea.value = src_textarea.value.replace('\n',' '); //to avoid multiple lines
	//src_textarea.value = src_textarea.value.replace('  ',' '); //to avoid repeated spaces
    }
    else{ //all string deleted
	src_textarea.disabled = false;
	tgt_textarea.disabled = false;
	sync_button.disabled = true;
	sync_button.childNodes[0].nodeValue = '\u25C0 BiSync \u25B6';
    }
    if (src_textarea.value.length > textareaMaxLen){src_textarea.value = src_textarea.value.substring(0,textareaMaxLen);} //to limit length
    src_count.innerHTML = src_textarea.value.length + '/' + textareaMaxLen;
});

//when tgt_textarea is modified
tgt_textarea.addEventListener('input', (event) => {
    autoGrow(tgt_textarea,src_textarea);
    if (tgt_textarea.value.length){ //the other textarea is disabled and the sync_button activated
        src_textarea.disabled = true;
	sync_button.disabled = false;
	sync_button.childNodes[0].nodeValue = '\u25C0 BiSync \u25C0';
	//tgt_textarea.value = tgt_textarea.value.replace('\n',' '); //to avoid multiple lines  
	//tgt_textarea.value = tgt_textarea.value.replace('  ',' '); //to avoid repeated spaces
    }
    else{ //all string deleted
	src_textarea.disabled = false;
	tgt_textarea.disabled = false;
	sync_button.disabled = true;
	sync_button.childNodes[0].nodeValue = '\u25C0 BiSync \u25B6'
    }
    if (tgt_textarea.value.length > textareaMaxLen){tgt_textarea.value = tgt_textarea.value.substring(0,textareaMaxLen);} //to limit length
    tgt_count.innerHTML = tgt_textarea.value.length + '/' + textareaMaxLen;
});

//when sync_button clicked
sync_button.addEventListener('click', (event) => {
    if (src_textarea.disabled){ //target-to-source
	src = tgt_textarea.value;
	tgt = src_textarea.value;
	tag = tag_t2s;
	ind = -1;
	server_request_out(src,tgt,tag,'src'); //updates src_textarea.value
	src_textarea.disabled = false;
	src_count.innerHTML = src_textarea.value.length + '/' + textareaMaxLen;
    }
    if (tgt_textarea.disabled){ //source-to-target
	src = src_textarea.value;
	tgt = tgt_textarea.value;
	tag = tag_s2t;
	ind = -1;
	server_request_out(src,tgt,tag,'tgt'); //updates tgt_textarea.value
	tgt_textarea.disabled = false;
	tgt_count.innerHTML = tgt_textarea.value.length + '/' + textareaMaxLen;
    }
    sync_button.disabled = true;
    sync_button.childNodes[0].nodeValue = '\u25C0 BiSync \u25B6'
});

//when src_textarea clicked to prefix from a word
src_textarea.addEventListener('dblclick', (event) => {
    if (src_textarea.value.length > 0 && tgt_textarea.value.length > 0 && src_textarea.selectionStart < src_textarea.value.length){
	src = tgt_textarea.value;
	tgt = src_textarea.value;
	tag = tag_t2s;
	ind = src_textarea.selectionStart;
	alternatives = server_request_alt(src,tgt,tag,ind);
	showOptionsMenu(event);  
	//rewrite src_textarea
	src_count.innerHTML = src_textarea.value.length + '/' + textareaMaxLen;
    }
});

//when tgt_textarea clicked to prefix from a word
tgt_textarea.addEventListener('dblclick', (event) => {
    if (tgt_textarea.value.length > 0 && src_textarea.value.length > 0 && tgt_textarea.selectionStart < tgt_textarea.value.length){
	src = src_textarea.value;
	tgt = tgt_textarea.value;
	tag = tag_s2t;
	ind = tgt_textarea.selectionStart;
	alternatives = server_request_alt(src,tgt,tag,ind);
	showOptionsMenu(event);  
	//rewrite tgt_textarea
	tgt_count.innerHTML = tgt_textarea.value.length + '/' + textareaMaxLen;
    }
});

cbox_debug.addEventListener('change', (event) => {
    if (cbox_debug.checked == true) {
	console_div.removeAttribute("hidden");
    }
    else {
	console_div.setAttribute("hidden", "hidden");
    }
});

myselect.onchange = function(){
    mydiv.setAttribute("hidden", "hidden");
    console.log('selected ' + myselect.value)
};

function autoGrow(oField,oField2) {
    if (oField.scrollHeight > oField.clientHeight & oField.rows < 20) {
	oField.style.height = `${oField.scrollHeight}px`;
	oField2.style.height = `${oField.scrollHeight}px`;
    }
}

function showOptionsMenu(e){
    posX = e.clientX
    posY = e.clientY
    console.log('mouse on ' + posX + ', ' + posY)
    mydiv.style.left = posX + 'px';
    mydiv.style.top  = posY + 'px';
    mydiv.removeAttribute("hidden");
}

function add_console_row(pos, rest){
    row = console_table.insertRow(pos);
    cell = row.insertCell(0); //one single cell in row
    if (pos == 0) {cell.style.backgroundColor = '#b3b3b3';}
    date = new Date(Date.now())
    mydate = date.toLocaleString('en-GB').replace(', ','-') + date.getMilliseconds()
    cell.innerHTML = '[' + mydate + '] ' + rest; //insert in console_table the input 
}

async function server_request_out(src, tgt, tag, side){
    add_console_row(0, src + ' ' + tag + ' ' + tgt + ' ' + '[ind=' + ind + ']');
    params = { "src": src, "tgt": tgt, "tag": tag, "ind": ind }
    //console.log("REQUEST: "+JSON.stringify(params));
    response = await fetch(address_server, {"method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify(params)})
    if (! response.ok){
	//console.log("RESPONSE: HTTP error: "+`${response.status}`);
	alarm("RESPONSE: HTTP error: "+`${response.status}`);
    }
    else{
	const data = await response.json();
	one_best = data['out']
	//console.log("RESPONSE: "+one_best);
	add_console_row(1, one_best);
	if (side == 'src'){src_textarea.value = one_best;}
	if (side == 'tgt'){tgt_textarea.value = one_best;}
    }
}


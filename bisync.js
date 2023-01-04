
par_op = '｟';
par_cl = '｠';
address_server = "http://" + document.getElementById("IP").value + ":" + document.getElementById("PORT").value + "/";
console.log('Server address: ' + address_server);
textareaMaxLen = 5000;
textareaSingleLine = false;
cbox_debug = document.getElementById("cbox_debug");
console_div = document.getElementById("console_div");
console_table = document.getElementById("console_table");
src_textarea = document.getElementById("src_textarea");
tgt_textarea = document.getElementById("tgt_textarea");
//sync_button = document.getElementById("sync_button");
src_count = document.getElementById("src_count");
tgt_count = document.getElementById("tgt_count");
src_lang = document.getElementById("src_lang");
tgt_lang = document.getElementById("tgt_lang");
sync_time = document.getElementById("sync_time");
sync_label = document.getElementById("sync_label");
menudiv = document.getElementById("menudiv");
menuselect = document.getElementById("menuselect");
timeoutID = null;
src_textarea_pred = '';
tgt_textarea_pred = '';


//hide/show debug console
cbox_debug.addEventListener('change', (event) => {
    if (cbox_debug.checked == true) {
	console_div.removeAttribute("hidden");
    }
    else {
	console_div.setAttribute("hidden", "hidden");
    }
});


//when the initial HTML document has been completely loaded and parsed, without waiting for style sheets, images, and subframes to finish loading
document.addEventListener("DOMContentLoaded", function(){
    src_count.innerHTML = '0/' + textareaMaxLen;
    tgt_count.innerHTML = '0/' + textareaMaxLen;
    console_table.disabled = true;
    src_textarea.disabled = false; //src_textarea is disabled when tgt_textarea is modified
    src_textarea.value = '';
    tgt_textarea.disabled = false; //tgt_textarea is disabled when src_textarea is modified
    tgt_textarea.value = '';
    tag_s2t = par_op + 'to-' + tgt_lang.options[tgt_lang.selectedIndex].value + par_cl;
    tag_t2s = par_op + 'to-' + src_lang.options[src_lang.selectedIndex].value + par_cl;
});

//change of source language
/*
src_lang.addEventListener('change', (event) => {
    tag_s2t = par_op + 'to-' + tgt_lang.options[tgt_lang.selectedIndex].value + par_cl;
    tag_t2s = par_op + 'to-' + src_lang.options[src_lang.selectedIndex].value + par_cl;
    src_textarea.value = ''
    tgt_textarea.value = ''
    src_count.innerHTML = '0/' + textareaMaxLen;
    tgt_count.innerHTML = '0/' + textareaMaxLen;
    console_table.disabled = true;
    sync_button.disabled = true;
    src_textarea.disabled = false;
    tgt_textarea.disabled = false;
});
*/

//change of target language
/*
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
*/

//when src_textarea is modified
src_textarea.addEventListener('input', (event) => {
    autoGrow(src_textarea,tgt_textarea);
    if (src_textarea.value.length){ //the other textarea is disabled
	tgt_textarea.disabled = true;
	src_textarea.value = clean_line(src_textarea.value);
	if (timeoutID) {clearTimeout(timeoutID);}
	if (sync_time.value > 0){timeoutID = setTimeout(sync,sync_time.value*1000);}
    }
    else{ //textarea fully deleted
	src_textarea.disabled = false;
	tgt_textarea.disabled = false;
    }
    src_count.innerHTML = src_textarea.value.length + '/' + textareaMaxLen;
});

//when tgt_textarea is modified
tgt_textarea.addEventListener('input', (event) => {
    autoGrow(tgt_textarea,src_textarea);
    if (tgt_textarea.value.length){ //the other textarea is disabled
        src_textarea.disabled = true;
	tgt_textarea.value = clean_line(tgt_textarea.value);
	if (timeoutID) {clearTimeout(timeoutID);}
	if (sync_time.value > 0){timeoutID = setTimeout(sync,sync_time.value*1000);}
    }
    else{ //textarea fully deleted
	src_textarea.disabled = false;
	tgt_textarea.disabled = false;
	if (timeoutID) {clearTimeout(timeoutID);}
    }
    tgt_count.innerHTML = tgt_textarea.value.length + '/' + textareaMaxLen;
});

function clean_line(txt){
    txt = txt.replace('  ',' ');
    if (textareaSingleLine) {txt = txt.replace('\n',' ');}
    if (txt.length > textareaMaxLen) {txt = txt.substring(0,textareaMaxLen);}
    return txt;
}

function autoGrow(oField,oField2) {
    if (oField.scrollHeight > oField.clientHeight & oField.rows < 20) {
	oField.style.height = `${oField.scrollHeight}px`;
	oField2.style.height = `${oField.scrollHeight}px`;
    }
}

function sync(){
    if (src_textarea.disabled){ //target-to-source
	src_textarea.value = server_request_out(tgt_textarea.value, tag_t2s, src_textarea.value, src_textarea_pred); //updates src_textarea.value
	src_textarea_pred = src_textarea.value;
	src_textarea.disabled = false;
	src_count.innerHTML = src_textarea.value.length + '/' + textareaMaxLen;
    }
    if (tgt_textarea.disabled){ //source-to-target
	tgt_textarea.value = server_request_out(src_textarea.value, tag_s2t, tgt_textarea.value, tgt_textarea_pred); //updates tgt_textarea.value
	tgt_textarea_pred = tgt_textarea.value;
	tgt_textarea.disabled = false;
	tgt_count.innerHTML = tgt_textarea.value.length + '/' + textareaMaxLen;
    }
}

src_textarea.addEventListener("contextmenu", function(e){e.preventDefault();}); //to avoid opening context menu (when right-clicking) in next function
//when src_textarea right-clicked to prefix from a word
src_textarea.addEventListener('contextmenu', (event) => {
    if (src_textarea.value.length > 0 && tgt_textarea.value.length > 0 && src_textarea.selectionStart < src_textarea.value.length){ 
	console.log('right-click on src_textarea pos='+src_textarea.selectionStart)
	alternatives = []; //server_request_alt(tgt_textarea.value,src_textarea.value,tag_t2s,src_textarea.selectionStart);
	src_textarea.value = showOptionsMenu(event, alternatives);  
	src_count.innerHTML = src_textarea.value.length + '/' + textareaMaxLen;
    }
});


tgt_textarea.addEventListener("contextmenu", function(e){e.preventDefault();}); //to avoid opening context menu (when right-clicking) in next function
//when tgt_textarea dblclicked (and shiftKey) to prefix from a word
tgt_textarea.addEventListener('contextmenu', (event) => {
    if (tgt_textarea.value.length > 0 && src_textarea.value.length > 0 && tgt_textarea.selectionStart < tgt_textarea.value.length){ // && tgt_textarea.selectionEnd == tgt_textarea.selectionStart){
	console.log('right-click on tgt_textarea pos='+tgt_textarea.selectionStart)
	alternatives = []; //server_request_alt(src_textarea.value,tgt_textarea.value,tag_s2t,tgt_textarea.selectionStart);
	tgt_textarea.value = showOptionsMenu(event, alternatives);  
	tgt_count.innerHTML = tgt_textarea.value.length + '/' + textareaMaxLen;
    }
});

//when src_textarea select (and not shiftKey) a gap to fill
src_textarea.addEventListener('select', (event) => {
    if (src_textarea.value.length > 0 && tgt_textarea.value.length > 0 && src_textarea.selectionStart < src_textarea.value.length && src_textarea.selectionEnd > src_textarea.selectionStart){
	console.log('select on src_textarea pos=['+src_textarea.selectionStart+','+src_textarea.selectionEnd+']')
	txt = tgt_textarea.value + tag_t2s + src_textarea.value.substring(0,src_textarea.selectionStart) + '<GAP>' + src_textarea.value.substring(src_textarea.selectionEnd);
	paraphrases = []; //server_request_par(txt);
	src_textarea.value = showOptionsMenu(event, paraphrases);  
	src_count.innerHTML = src_textarea.value.length + '/' + textareaMaxLen;
    }
});

//when tgt_textarea select (and not shiftKey) a gap to fill
tgt_textarea.addEventListener('select', (event) => {
    if (src_textarea.value.length > 0 && tgt_textarea.value.length > 0 && tgt_textarea.selectionStart < tgt_textarea.value.length && tgt_textarea.selectionEnd > tgt_textarea.selectionStart){
	console.log('select on tgt_textarea pos=['+tgt_textarea.selectionStart+','+tgt_textarea.selectionEnd+']')
	txt = src_textarea.value + tag_s2t + tgt_textarea.value.substring(0,tgt_textarea.selectionStart) + '<GAP>' + tgt_textarea.value.substring(tgt_textarea.selectionEnd);
	paraphrases = []; //server_request_par(txt);
	tgt_textarea.value = showOptionsMenu(event, paraphrases);
	tgt_count.innerHTML = tgt_textarea.value.length + '/' + textareaMaxLen;
    }
});

//when one option is selected on the floating menu
menuselect.onchange = function(){
    menudiv.setAttribute("hidden", "hidden");
    console.log('selected ' + menuselect.value)
};

function showOptionsMenu(e,options){
    posX = e.clientX
    posY = e.clientY
    console.log('mouse on ' + posX + ', ' + posY)
    menudiv.style.left = posX + 'px';
    menudiv.style.top  = posY + 'px';
    menudiv.removeAttribute("hidden");
    return 'my new sentence';
}

async function server_request_out(src, tag, tgt, tgt_pred){
    add_console_row(0, src + ' ' + tag + ' ' + tgt);
    params = { "src": src, "tgt": tgt, "tag": tag }
    console.log("REQUEST: "+JSON.stringify(params));
    response = await fetch(address_server, {"credentials": "same-origin", "method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify(params)})
    if (! response.ok){
	console.log("RESPONSE: HTTP error: "+`${response.status}`);
	alert("RESPONSE: HTTP error: "+`${response.status}`);
    }
    else{
	const data = await response.json();
	one_best = data['out']
	console.log("RESPONSE: "+one_best);
	add_console_row(1, one_best);
	return one_best
    }
    return ''
}

function add_console_row(pos, rest){
    row = console_table.insertRow(pos);
    cell = row.insertCell(0); //one single cell in row
    if (pos == 0) {cell.style.backgroundColor = '#b3b3b3';}
    date = new Date(Date.now())
    mydate = date.toLocaleString('en-GB').replace(', ','-') + date.getMilliseconds()
    cell.innerHTML = '[' + mydate + '] ' + rest; //insert in console_table the input 
}



par_op = '｟';
par_cl = '｠';
address_server = "http://" + document.getElementById("IP").value + ":" + document.getElementById("PORT").value + "/";
console.log('Server address: ' + address_server);
textareaMaxLen = 0; //0 for no limit
textareaSingleLine = false;
src_textarea = document.getElementById("src_textarea");
tgt_textarea = document.getElementById("tgt_textarea");
src_count = document.getElementById("src_count");
tgt_count = document.getElementById("tgt_count");
src_count_cell = document.getElementById("src_count_cell");
tgt_count_cell = document.getElementById("tgt_count_cell");
src_lang = document.getElementById("src_lang");
tgt_lang = document.getElementById("tgt_lang");
sync_time = document.getElementById("sync_time");
menudiv = document.getElementById("menudiv");
menuselect = document.getElementById("menuselect");
timeoutID = null;
src_textarea_pre = '';
tgt_textarea_pre = '';
disabled_color = '#FAFAFA';

function reset_default(){
    src_textarea.disabled = false; //src_textarea is disabled when tgt_textarea is modified
    src_textarea.value = '';
    tag_s2t = par_op + 'to-' + tgt_lang.options[tgt_lang.selectedIndex].value + par_cl;
    
    tgt_textarea.disabled = false; //tgt_textarea is disabled when src_textarea is modified
    tgt_textarea.value = '';
    tag_t2s = par_op + 'to-' + src_lang.options[src_lang.selectedIndex].value + par_cl;

    update_counts();
    //sync_time.value = 1;
    //sync_label.value = '1 (sec)';
}

//when the initial HTML document has been completely loaded and parsed, without waiting for style sheets, images, and subframes to finish loading
document.addEventListener("DOMContentLoaded", reset_default());

//hide menudiv when escape released
document.addEventListener('keyup', (event) => {if (event.keyCode == 27){menudiv.setAttribute("hidden", "hidden");}});

//change of source language
src_lang.addEventListener('change', (event) => {reset_default();});

//change of target language
tgt_lang.addEventListener('change', (event) => {reset_default();});

//************************************************************************************
//*** textareas modified *************************************************************
//************************************************************************************

//when src_textarea is modified
src_textarea.addEventListener('input', (event) => {
    if (sync_time.value == 0) return;
    if (src_textarea.value.length){ //the other textarea is disabled
    	disable_textareas('tgt');
	   	src_textarea.value = clean_line(src_textarea.value);
	   	clear_and_reset_timeout(true);
    }
    else{ //textarea fully deleted
    	disable_textareas('none');
	   	clear_and_reset_timeout(false);
    }
   	update_counts();
});

//when tgt_textarea is modified
tgt_textarea.addEventListener('input', (event) => {
    if (sync_time.value == 0) return;
    if (tgt_textarea.value.length){ //the other textarea is disabled
    	disable_textareas('src');
	   	tgt_textarea.value = clean_line(tgt_textarea.value);
	   	clear_and_reset_timeout(true);
    }
    else{ //textarea fully deleted
    	disable_textareas('none');
	   	clear_and_reset_timeout(false);
    }
   	update_counts();
});

function clean_line(txt){
    txt = txt.replace('  ',' ');
    if (textareaSingleLine) {txt = txt.replace('\n',' ');}
    if (textareaMaxLen > 0 && txt.length > textareaMaxLen) {txt = txt.substring(0,textareaMaxLen);}
    return txt;
}

function clear_and_reset_timeout(do_reset){
    if (timeoutID) { //clear if already set
	   	clearTimeout(timeoutID);
    }
    if (do_reset && sync_time.value > 0){ //set new timeout
    	timeoutID = setTimeout(server_request_sync,sync_time.value*1000);
    }
}

//************************************************************************************
//*** textareas right-clicked ********************************************************
//************************************************************************************

//when src_textarea right-clicked to prefix from a word
src_textarea.addEventListener("contextmenu", function(e){e.preventDefault();}); //to avoid opening context menu (when right-clicking) in next function
src_textarea.addEventListener('contextmenu', (event) => {
    if (!sync_time) return;
    if (src_textarea.value.length > 0 && tgt_textarea.value.length > 0 && src_textarea.selectionStart < src_textarea.value.length){ 
	   	console.log('right-click on src_textarea pos='+src_textarea.selectionStart)
	   	alternatives = []; //server_request_alt(tgt_textarea.value,src_textarea.value,tag_t2s,src_textarea.selectionStart);
	/*
	src_textarea.value = showOptionsMenu(event, alternatives);  
	src_textarea_pre = src_textarea.value;
	src_count.innerHTML = src_textarea.value.length;
	if (textareaMaxLen>0) {src_count.innerHTML += '/'+textareaMaxLen;}
	*/
    }
});

//when tgt_textarea right-clicked to prefix from a word
tgt_textarea.addEventListener("contextmenu", function(e){e.preventDefault();}); //to avoid opening context menu (when right-clicking) in next function
tgt_textarea.addEventListener('contextmenu', (event) => {
    if (sync_time.value == 0) return;
    if (tgt_textarea.value.length > 0 && src_textarea.value.length > 0 && tgt_textarea.selectionStart < tgt_textarea.value.length){ // && tgt_textarea.selectionEnd == tgt_textarea.selectionStart){
	   	console.log('right-click on tgt_textarea pos='+tgt_textarea.selectionStart)
	   	alternatives = []; //server_request_alt(src_textarea.value,tgt_textarea.value,tag_s2t,tgt_textarea.selectionStart);
	/*
	tgt_textarea.value = showOptionsMenu(event, alternatives);
	tgt_textarea_pre = tgt_textarea.value;
	tgt_count.innerHTML = tgt_textarea.value.length;
	if (textareaMaxLen>0) {tgt_count.innerHTML += '/'+textareaMaxLen;}
	*/
    }
});

//************************************************************************************
//*** textareas selected *************************************************************
//************************************************************************************

//when src_textarea select (mouseup) a gap to fill
src_textarea.addEventListener('mouseup', (event) => {
    if (sync_time.value == 0) return;
    if (src_textarea.value.length > 0 && tgt_textarea.value.length > 0 && src_textarea.selectionStart < src_textarea.value.length && src_textarea.selectionEnd > src_textarea.selectionStart){
	   	console.log('select on src_textarea pos=['+src_textarea.selectionStart+','+src_textarea.selectionEnd+']')
	   	txt = tgt_textarea.value + tag_t2s + src_textarea.value.substring(0,src_textarea.selectionStart) + '<GAP>' + src_textarea.value.substring(src_textarea.selectionEnd);
	   	paraphrases = []; //server_request_par(txt);
	/*
	src_textarea.value = showOptionsMenu(event, paraphrases);  
	src_textarea_pre = src_textarea.value;
	src_count.innerHTML = src_textarea.value.length;
	if (textareaMaxLen>0) {src_count.innerHTML += '/'+textareaMaxLen;}
	*/
    }
});

//when tgt_textarea select (mouseup) a gap to fill
tgt_textarea.addEventListener('mouseup', (event) => {
    if (sync_time.value == 0) return;
    if (src_textarea.value.length > 0 && tgt_textarea.value.length > 0 && tgt_textarea.selectionStart < tgt_textarea.value.length && tgt_textarea.selectionEnd > tgt_textarea.selectionStart){
    	console.log('select on tgt_textarea pos=['+tgt_textarea.selectionStart+','+tgt_textarea.selectionEnd+']')
	   	txt = src_textarea.value + tag_s2t + tgt_textarea.value.substring(0,tgt_textarea.selectionStart) + '<GAP>' + tgt_textarea.value.substring(tgt_textarea.selectionEnd);
	   	paraphrases = []; //server_request_par(txt);
	/*
	tgt_textarea.value = showOptionsMenu(event, paraphrases);
	tgt_textarea_pre = tgt_textarea.value;
	tgt_count.innerHTML = tgt_textarea.value.length;
	if (textareaMaxLen>0) {tgt_count.innerHTML += '/'+textareaMaxLen;}
	*/
    }
});

//when one option is selected on the floating menudiv
menuselect.onchange = function(){
    menudiv.setAttribute("hidden", "hidden");
    console.log('selected ' + menuselect.value)
};

function showOptionsMenu(e,options){
    posX = e.clientX
    posY = e.clientY
    console.log('mouse on ' + posX + ', ' + posY)
    menudiv.style.left = posX + 'px';
    menudiv.style.top  = posY+10 + 'px';
    menudiv.removeAttribute("hidden");
    return 'my new sentence';
}

//************************************************************************************
//*** server requests ****************************************************************
//************************************************************************************

async function server_request_sync(){
    if (src_textarea.disabled){ //target-to-source
        src = tgt_textarea.value;
        tag = tag_t2s;
        tgt = src_textarea.value;   
        pre = tgt_textarea_pre;
    }
    if (tgt_textarea.disabled){ //source-to-target
    	src = src_textarea.value;
        tag = tag_s2t;
        tgt = tgt_textarea.value;
        pre = src_textarea_pre;
    }
        
    params = { "src": src, "tag": tag, "tgt": tgt, "src-": pre }
    console.log("REQ: "+JSON.stringify(params));
    response = await fetch(address_server, {"credentials": "same-origin", "method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify(params)})
    if (! response.ok){
        console.log("RES: HTTP error: "+`${response.status}`);
        alert("HTTP error: "+`${response.status}`);
        return;
    }
    const data = await response.json();
    console.log("RES: "+JSON.stringify(data));
    one_best = data['out']
    if (src_textarea.disabled){ //outputs in source side
		src_textarea.value = one_best;
		src_textarea_pre = one_best;
		update_counts();
    }
    if (tgt_textarea.disabled){ //outputs in target side
		tgt_textarea.value = one_best;
		tgt_textarea_pre = one_best;
		update_counts();
    }
    disable_textareas('noone');
}

//************************************************************************************
//*** other **************************************************************************
//************************************************************************************

function disable_textareas(side){
    //src_textarea.disabled
    if (side == 'src') src_textarea.disabled = true;
    else src_textarea.disabled = false
    
    //src_textarea.style.background
    if (side == 'src') src_textarea.style.background = disabled_color;
    else src_textarea.style.background = 'transparent';

    //src_count_cell.disabled
    if (side == 'src') src_count_cell.style.background = disabled_color;
    else src_count_cell.style.background = 'transparent';

    //tgt_textarea.disabled
    if (side == 'tgt') tgt_textarea.disabled = true;
    else tgt_textarea.disabled = false
    
    //tgt_textarea.style.background
    if (side == 'tgt') tgt_textarea.style.background = disabled_color;
    else tgt_textarea.style.background = 'transparent';
    
    //tgt_count_cell.disabled
    if (side == 'tgt') tgt_count_cell.style.background = disabled_color;
    else tgt_count_cell.style.background = 'transparent';    
}

update_counts(){
	src_count.innerHTML = src_textarea.value.length;
	tgt_count.innerHTML = tgt_textarea.value.length;
	if (textareaMaxLen>0) {
		src_count.innerHTML += '/'+textareaMaxLen;
		tgt_count.innerHTML += '/'+textareaMaxLen;
	}
}


/*
function autoGrow(oField,oField2) {
    if (oField.scrollHeight > oField.clientHeight & oField.rows < 20) {
	oField.style.height = `${oField.scrollHeight}px`;
	oField2.style.height = `${oField.scrollHeight}px`;
	}
}
*/


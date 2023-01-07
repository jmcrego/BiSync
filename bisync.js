
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

//hide menuselect when escape released
document.addEventListener('keyup', (event) => {if (event.keyCode == 27) {menuselect.setAttribute("hidden", "hidden");}});

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
    console.log('src_textarea modified');
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
    console.log('tgt_textarea modified');
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

//************************************************************************************
//*** textareas cursor moved *********************************************************
//************************************************************************************

//when cursor moves in src_textarea => alternatives or paraphrases (if selection) 
src_textarea_cursor = -1;
tgt_textarea_cursor = -1;
src_textarea.addEventListener('keyup',(event) => cursor_moved(event, 'src')); // Any key released (only arrows must be considered)
src_textarea.addEventListener('click',(event) => cursor_moved(event, 'src')); // Click down (only left button must be considered)
tgt_textarea.addEventListener('keyup',(event) => cursor_moved(event, 'tgt')); // Any key released (only arrows must be considered)
tgt_textarea.addEventListener('click',(event) => cursor_moved(event, 'tgt')); // Click down (only left button must be considered)

function cursor_moved(e,side) {
	if (e.key != 'ArrowDown' && e.key != 'ArrowUp' && e.key != 'ArrowLeft' && e.key != 'ArrowRight' && e.button != 0) {
		return;
	} 
	if (side=='src') {
		Start = src_textarea.selectionStart;
		End = src_textarea.selectionEnd;
		ta = src_textarea;
		ta_value = src_textarea.value;
		cursor = src_textarea_cursor
	}
	else if (side=='tgt') {
		Start = tgt_textarea.selectionStart;
		End = tgt_textarea.selectionEnd;
		ta = tgt_textarea;
		ta_value = tgt_textarea.value;
		cursor = tgt_textarea_cursor
	}

	if (Start != End) { //selection => gap
   		console.log('src_textarea cursor selects from ' + Start + ' to ' + End + ' ' + ta_value.substring(Start, End));
   		server_request_gap(side);
	}
	else if (Start != cursor) { //movement of cursor => prefix
		nextChar = ' ';
		prevChar = ' ';
		if (Start < ta_value.length) {nextChar = ta_value.charAt(Start);} 
		if (Start > 0) {prevChar = ta_value.charAt(Start-1);} 
		if (prevChar == ' ' && nextChar != ' '){
			console.log('Start=' + Start + ' char is '+ta_value.charAt(Start));
	   		server_request_pref(side);
		}
	}

	if (side=='src'){
		src_textarea_cursor = Start;
	}
	else{
		tgt_textarea_cursor = Start;		
	}
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
    disable_textareas('none');
}

async function server_request_gap(side){
	if (side=='src'){
		Start = src_textarea.selectionStart;
		End = src_textarea.selectionEnd;
		ta = src_textarea;
		ta_value = src_textarea.value;
		cursor = src_textarea_cursor
        tag = tag_t2s;
        src = tgt_textarea.value;
	}
	else{ //side=='tgt'
		Start = tgt_textarea.selectionStart;
		End = tgt_textarea.selectionEnd;
		ta = tgt_textarea;
		ta_value = tgt_textarea.value;
		cursor = tgt_textarea_cursor
        tag = tag_s2t;
        src = src_textarea.value;
	}
	let {posX, posY} = getCaretCoordinates(ta);
   	gappy = ta_value.substring(0,Start) + par_op+'gap'+par_cl + ta_value.substring(End);
    params = { "src": src, "tag": tag, "gappy": gappy}
    console.log("REQ: "+JSON.stringify(params));
    response = await fetch(address_server, {"credentials": "same-origin", "method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify(params)})
    if (! response.ok){
        console.log("RES: HTTP error: "+`${response.status}`);
        alert("HTTP error: "+`${response.status}`);
        return;
    }
    const data = await response.json();
    console.log("RES: "+JSON.stringify(data));
    //options = data['alt']; //menu
    options = ['uuu','vvv','www','xxx','yyy','zzz'];
    optionsMenu(posX,posY,options);
}

async function server_request_pref(side){
	if (side=='src'){
		Start = src_textarea.selectionStart;
		End = src_textarea.selectionEnd;
		ta = src_textarea;
		ta_value = src_textarea.value;
		cursor = src_textarea_cursor
        tag = tag_t2s;
        src = tgt_textarea.value;
	}
	else{ //side=='tgt'
		Start = tgt_textarea.selectionStart;
		End = tgt_textarea.selectionEnd;
		ta = tgt_textarea;
		ta_value = tgt_textarea.value;
		cursor = tgt_textarea_cursor
        tag = tag_s2t;
        src = src_textarea.value;
	}
	let {posX, posY} = getCaretCoordinates(ta);
	pref = ta_value.substring(0,Start);
    params = { "src": src, "tag": tag, "pref": pref}
    console.log("REQ: "+JSON.stringify(params));
    response = await fetch(address_server, {"credentials": "same-origin", "method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify(params)})
    if (! response.ok){
        console.log("RES: HTTP error: "+`${response.status}`);
        alert("HTTP error: "+`${response.status}`);
        return;
    }
    const data = await response.json();
    console.log("RES: "+JSON.stringify(data));
    //options = data['alt']; //menu
    options = ['uuu','vvv','www','xxx','yyy','zzz'];
    optionsMenu(posX,posY,options);
}

//************************************************************************************
//*** Menu with alternatives *********************************************************
//************************************************************************************

//when one option is selected on the floating menuselect
menuselect.onchange = function(){
    menuselect.setAttribute("hidden", "hidden");
    console.log('selected ' + menuselect.options[menuselect.selectedIndex].text)
    //write result in corresponding textarea
   	update_counts();
};

function optionsMenu(posX,posY,options){
	//remove previous select options
	while (menuselect.options.length > 0) {menuselect.remove(0);}

	//add new select options
	for (i = 0; i<options.length; i++){
	    opt = document.createElement('option');
    	opt.value = i;
	    opt.innerHTML = options[i];
    	menuselect.appendChild(opt);
	}

    //positionning menu
    console.log('positionning Menu on (' + posX + ', ' + posY + ')')
    menuselect.style.left = posX + 'px';
    menuselect.style.top  = posY + 'px';
    menuselect.removeAttribute("hidden");
}


//************************************************************************************
//*** other **************************************************************************
//************************************************************************************

function disable_textareas(side){
    //src_textarea.disabled
    if (side == 'src') src_textarea.disabled = true;
    else src_textarea.disabled = false;
    
    //src_textarea.style.background
    if (side == 'src') src_textarea.style.background = disabled_color;
    else src_textarea.style.background = 'transparent';

    //src_count_cell.disabled
    if (side == 'src') src_count_cell.style.background = disabled_color;
    else src_count_cell.style.background = 'transparent';

    //tgt_textarea.disabled
    if (side == 'tgt') tgt_textarea.disabled = true;
    else tgt_textarea.disabled = false;
    
    //tgt_textarea.style.background
    if (side == 'tgt') tgt_textarea.style.background = disabled_color;
    else tgt_textarea.style.background = 'transparent';
    
    //tgt_count_cell.disabled
    if (side == 'tgt') tgt_count_cell.style.background = disabled_color;
    else tgt_count_cell.style.background = 'transparent';    
}

function update_counts(){
	src_count.innerHTML = src_textarea.value.length;
	tgt_count.innerHTML = tgt_textarea.value.length;
	if (textareaMaxLen>0) {
		src_count.innerHTML += '/'+textareaMaxLen;
		tgt_count.innerHTML += '/'+textareaMaxLen;
	}
}

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

function getCaretCoordinates(el){
	posX = 300;
	posY = 300;
	return {posX, posY};
}

/*
function autoGrow(oField,oField2) {
    if (oField.scrollHeight > oField.clientHeight & oField.rows < 20) {
	oField.style.height = `${oField.scrollHeight}px`;
	oField2.style.height = `${oField.scrollHeight}px`;
	}
}
*/


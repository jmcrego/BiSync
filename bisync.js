
const tts = window.speechSynthesis;
let address_server = "http://" + document.getElementById("IP").value + ":" + document.getElementById("PORT").value + "/";
let src_textarea = document.getElementById("src_textarea");
let tgt_textarea = document.getElementById("tgt_textarea");
let src_speak = document.getElementById("src_speak");
let tgt_speak = document.getElementById("tgt_speak");
let src_count = document.getElementById("src_count");
let tgt_count = document.getElementById("tgt_count");
let srctgt_back = document.getElementById("srctgt_back");
let srctgt_clear = document.getElementById("srctgt_clear");
let srctgt_next = document.getElementById("srctgt_next");
let src_freeze = document.getElementById("src_freeze");
let tgt_freeze = document.getElementById("tgt_freeze");
let src_count_cell = document.getElementById("src_count_cell");
let tgt_count_cell = document.getElementById("tgt_count_cell");
let src_lang = document.getElementById("src_lang");
let tgt_lang = document.getElementById("tgt_lang");
let sync_time = document.getElementById("sync_time");
let sync_label = document.getElementById("sync_label");
let sync_values = document.getElementById("sync_values");
let menuselect = document.getElementById("menuselect");
console.log('Server address: ' + address_server);

let par_op = '｟';
let par_cl = '｠';
let textareaMaxLen = 0; //0 for no limit
let textareaSingleLine = true;
let timeoutID = null;
let mousePosX = 0;
let mousePosY = 0;
let disabled_color = '#FAFAFA';
let enabled_color = 'transparent';

//when the initial HTML document has been completely loaded and parsed, without waiting for style sheets, images, and subframes to finish loading
document.addEventListener("DOMContentLoaded", reset_default());

//hide menuselect when escape released
document.addEventListener('keyup', (event) => {if (event.keyCode == 27) {hide_menuselect();}});
//hide menuselect when click outside menuselect
document.addEventListener('click', (event) => {
	mousePosX = event.clientX;
	mousePosY = event.clientY;
	if (!menuselect.contains(event.target)) {
		hide_menuselect();
	}
});

//change of source language
src_lang.addEventListener('change', (event) => {reset_default();});

//change of target language
tgt_lang.addEventListener('change', (event) => {reset_default();});

//change sync_time input range
sync_time.addEventListener('change', (event) => {change_sync(event)});

//press button srctgt_remove
srctgt_clear.addEventListener('click', (event) => {console.log('srctgt clear'); reset_default();});

//press button speak_src
src_speak.addEventListener('click', (event) => {speak('src');});

//press button tgt_speak
tgt_speak.addEventListener('click', (event) => {speak('tgt');});

//press button src_freeze
src_freeze.addEventListener('click', (event) => {toggle_freeze('src');});

//press button tgt_freeze
tgt_freeze.addEventListener('click', (event) => {toggle_freeze('tgt');});

function change_sync(event){
	console.log('changed sync to '+sync_values.options[event.target.value].label); 
	sync_label.innerHTML = sync_values.options[event.target.value].label;
}

function speak(side){
	if (side == 'src'){
		ta = src_textarea;
		lang = 'en-GB';
	}
	else if (side == 'tgt'){
		ta = tgt_textarea;
		lang = 'fr-FR';
	}
	if (ta.value.length == 0){return;}
	if (tts.speaking) {
		if (tts.paused) {tts.resume();console.log('speak resume');}
		else {tts.pause();console.log('speak pause');}
	}
	else{
		tts.cancel();
		const utterance = new SpeechSynthesisUtterance(ta.value); // speak text
		utterance.lang = lang; //fr-FR or en-GB
		tts.speak(utterance);
		console.log('speak');
	}
}

function toggle_freeze(side){
	if (side == 'src'){
		if (src_freeze.innerHTML == 'lock_open') {
			src_freeze.innerHTML = 'lock';
			disable_textarea('src')
			console.log('src freeze');
		}
		else {
			src_freeze.innerHTML = 'lock_open';
			enable_textarea('src')
			console.log('src unfreeze');
		}
	}
	else if (side == 'tgt'){
		if (tgt_freeze.innerHTML == 'lock_open') {
			tgt_freeze.innerHTML = 'lock';
			disable_textarea('tgt')
			console.log('tgt freeze');
		}
		else {
			tgt_freeze.innerHTML = 'lock_open';
			enable_textarea('tgt')
			console.log('tgt unfreeze');
		}
	}
}

function enable_textarea(side){
	if (side == 'src' || side == 'both'){
		if (src_freeze.innerHTML == 'lock_open'){
		    src_textarea.disabled = false;
    		src_textarea.style.background = enabled_color;
    		src_count_cell.style.background = enabled_color;
    		src_lang_cell.style.background = enabled_color;
    	}
	}
	else if (side == 'tgt' || side == 'both'){
		if (tgt_freeze.innerHTML == 'lock_open'){
		    tgt_textarea.disabled = false;
    		tgt_textarea.style.background = enabled_color;
    		tgt_count_cell.style.background = enabled_color;
    		tgt_lang_cell.style.background = enabled_color;
    	}
	}
}


function disable_textarea(side){
	if (side == 'src' || side == 'both'){
	    src_textarea.disabled = true;
    	src_textarea.style.background = disabled_color;
   		src_count_cell.style.background = disabled_color;
   		src_lang_cell.style.background = disabled_color;
	}
	else if (side == 'tgt' || side == 'both'){
	    tgt_textarea.disabled = true;
    	tgt_textarea.style.background = disabled_color;
   		tgt_count_cell.style.background = disabled_color;
   		tgt_lang_cell.style.background = disabled_color;
	}
}

function reset_default(){
	//enable(both)
	enable_textarea('both');
    src_textarea.value = '';
    tag_s2t = par_op + tgt_lang.options[tgt_lang.selectedIndex].value + par_cl;
	src_freeze.innerHTML = 'lock_open';
    tgt_textarea.value = '';
    tag_t2s = par_op + src_lang.options[src_lang.selectedIndex].value + par_cl;
	tgt_freeze.innerHTML = 'lock_open';
    update_counts();
    if (tts.speaking) tts.cancel();
}


//************************************************************************************
//*** textareas modified *************************************************************
//************************************************************************************

//when src_textarea is modified
src_textarea.addEventListener('input', (event) => {
   	hide_menuselect();
    if (src_textarea.value.length){ 
	   	src_textarea.value = clean_line(src_textarea.value); 
	   	if (tgt_freeze.innerHTML == 'lock_open'){
	    	disable_textarea('tgt'); //disable the other textarea
	   		clear_and_reset_timeout(true);
	   	}
    }
    else{ //textarea fully deleted
    	enable_textarea('both');
	   	clear_and_reset_timeout(false);
    }
   	update_counts();
    if (tts.speaking) tts.cancel();
});

//when tgt_textarea is modified
tgt_textarea.addEventListener('input', (event) => {
   	hide_menuselect();
    if (tgt_textarea.value.length){ 
	   	tgt_textarea.value = clean_line(tgt_textarea.value); 
	   	if (src_freeze.innerHTML == 'lock_open'){
	    	disable_textarea('src'); //disable the other textarea
	   		clear_and_reset_timeout(true);
	   	}
    }
    else{ //textarea fully deleted
    	enable_textarea('both');
	   	clear_and_reset_timeout(false);
    }
   	update_counts();
    if (tts.speaking) tts.cancel();
});

//************************************************************************************
//*** textareas cursor moved *********************************************************
//************************************************************************************

//when cursor moves in src_textarea => alternatives or paraphrases (if selection) 
src_textarea.addEventListener('keyup',(event) => cursor_moved(event, 'src')); // Any key released (only arrows must be considered)
src_textarea.addEventListener('click',(event) => cursor_moved(event, 'src')); // Click down (only left button must be considered)
tgt_textarea.addEventListener('keyup',(event) => cursor_moved(event, 'tgt')); // Any key released (only arrows must be considered)
tgt_textarea.addEventListener('click',(event) => cursor_moved(event, 'tgt')); // Click down (only left button must be considered)

function cursor_moved(e,side) {
	cursor_moved_side = side;
	hide_menuselect();
	if (e.key != 'ArrowDown' && e.key != 'ArrowUp' && e.key != 'ArrowLeft' && e.key != 'ArrowRight' && e.button != 0) {
		return;
	} 
	if (cursor_moved_side=='src') {
		Start = src_textarea.selectionStart;
		End = src_textarea.selectionEnd;
		ta = src_textarea;
		ta_value = src_textarea.value;
	}
	else if (cursor_moved_side=='tgt') {
		Start = tgt_textarea.selectionStart;
		End = tgt_textarea.selectionEnd;
		ta = tgt_textarea;
		ta_value = tgt_textarea.value;
	}

	if (Start != End) { //selection => gap
   		console.log('textarea cursor selects from ' + Start + ' to ' + End + ': ' + ta_value.substring(Start, End));
		cursor_moved_type = 'gap';
   		server_request_gap();
	}
	else { //cursor moves => prefix (if begin of token)
		nextChar = ' ';
		prevChar = ' ';
		if (Start < ta_value.length) {nextChar = ta_value.charAt(Start);} 
		if (Start > 0) {prevChar = ta_value.charAt(Start-1);} 
		if (prevChar == ' ' && nextChar != ' '){
			console.log('textarea cursor prefixes from ' + Start + ' char is '+ta_value.charAt(Start));
			cursor_moved_type = 'pref';
	   		server_request_pref();
		}
	}
}

//************************************************************************************
//*** server requests ****************************************************************
//************************************************************************************

async function server_request_sync(){
	if (src_freeze == 'lock' || tgt_freeze == 'lock'){
		return;		
	}
    if (src_textarea.disabled){ //target-to-source
        src = tgt_textarea.value;
        tag = tag_t2s;
        tgt = src_textarea.value;   
    }
    if (tgt_textarea.disabled){ //source-to-target
    	src = src_textarea.value;
        tag = tag_s2t;
        tgt = tgt_textarea.value;
    }
    params = { "src": src, "lang": tag, "tgt": tgt, "mode": "sync" }
    console.log("REQ: "+JSON.stringify(params));
    response = await fetch(address_server, {"method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify(params)});
    if (! response.ok){
        console.log("RES: HTTP error: "+`${response.status}`);
        alert("HTTP error: "+`${response.status}`);
    }
    const data = await response.json();
    console.log("RES: "+JSON.stringify(data));
    one_best = data['oraw'][0];
    if (src_textarea.disabled){ //outputs in source side
		src_textarea.value = one_best;
		update_counts();
    }
    if (tgt_textarea.disabled){ //outputs in target side
		tgt_textarea.value = one_best;
		update_counts();
    }
    enable_textarea('src');
    enable_textarea('tgt');
}

async function server_request_gap(){
	if (cursor_moved_side == 'src'){ // tgt ((t2s)) src_with_gap
		Start = src_textarea.selectionStart;
		End = src_textarea.selectionEnd;
		tgt_with_gap = src_textarea.value.substring(0,Start) + par_op+'GAP'+par_cl + src_textarea.value.substring(End);
        lang = tag_t2s;
        src = tgt_textarea.value;
        disable_textarea('tgt');
	}
	else{ //side=='tgt'// src ((s2t)) tgt_with_gap
		Start = tgt_textarea.selectionStart;
		End = tgt_textarea.selectionEnd;
		tgt_with_gap = tgt_textarea.value.substring(0,Start) + par_op+'GAP'+par_cl + tgt_textarea.value.substring(End);
        lang = tag_s2t;
        src = src_textarea.value;
        disable_textarea('src');
	}
    params = { "src": src, "lang": lang, "tgt": tgt_with_gap, "mode": "gap"}
    console.log("REQ: "+JSON.stringify(params));
    response = await fetch(address_server, {"credentials": "same-origin", "method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify(params)});
    if (! response.ok){
        console.log("RES: HTTP error: "+`${response.status}`);
        alert("HTTP error: "+`${response.status}`);
        return;
    }
    const data = await response.json();
    console.log("RES: "+JSON.stringify(data));
    optionsMenu(data['oraw']);
}

async function server_request_pref(){
	if (cursor_moved_side == 'src'){ // tgt ((t2s)) src_pref
		Start = src_textarea.selectionStart;
		tgt_pref = src_textarea.value.substring(0,Start);
        lang = tag_t2s;
        src = tgt_textarea.value;
	    disable_textarea('tgt');
	}
	else{ //side=='tgt'// src ((s2t)) tgt_pref
		Start = tgt_textarea.selectionStart;
		tgt_pref = tgt_textarea.value.substring(0,Start);
        lang = tag_s2t;
        src = src_textarea.value;
	    disable_textarea('src');
	}
    params = { "src": src, "lang": lang, "tgt": tgt_pref, "mode": "pref"};
    console.log("REQ: "+JSON.stringify(params));
    response = await fetch(address_server, {"credentials": "same-origin", "method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify(params)});
    if (! response.ok){
        console.log("RES: HTTP error: "+`${response.status}`);
        alert("HTTP error: "+`${response.status}`);
        return;
    }
    const data = await response.json();
    console.log("RES: "+JSON.stringify(data));
	optionsMenu(data['oraw']);
}

//************************************************************************************
//*** Menu with alternatives *********************************************************
//************************************************************************************

//when one option is selected on the floating menuselect
menuselect.onchange = function(){
	resp = menuselect.options[menuselect.selectedIndex].text;
    menuselect.setAttribute("hidden", "hidden");
    console.log('selected ' + resp);
    if (cursor_moved_type == 'gap') {
	    if (cursor_moved_side == 'src'){
			src_textarea.value = tgt_with_gap.replace(par_op+'GAP'+par_cl,resp);
		   	if (tgt_freeze.innerHTML == 'lock_open'){ clear_and_reset_timeout(true); }
	    }
    	else if (cursor_moved_side == 'tgt') {
			tgt_textarea.value = tgt_with_gap.replace(par_op+'GAP'+par_cl,resp);
		   	if (src_freeze.innerHTML == 'lock_open'){ clear_and_reset_timeout(true); }
    	}
    }
    else if (cursor_moved_type == 'pref') {
    	if (cursor_moved_side == 'src'){ 
			src_textarea.value = src_textarea.value.substring(0,Start) + resp;
		   	if (tgt_freeze.innerHTML == 'lock_open'){ clear_and_reset_timeout(true); }
	    }
    	else if (cursor_moved_side=='tgt') {
			tgt_textarea.value = tgt_textarea.value.substring(0,Start) + resp;
		   	if (src_freeze.innerHTML == 'lock_open'){ clear_and_reset_timeout(true); }
    	}
    }
    //disable_textareas('none');
   	update_counts();
   	hide_menuselect();
};

function optionsMenu(options){
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
	menuselect.style.left = mousePosX + 'px';
    menuselect.style.top  = mousePosY + 20 + 'px';
	menuselect.style.position = 'absolute';
    menuselect.removeAttribute("hidden"); //is visible
}


//************************************************************************************
//*** other **************************************************************************
//************************************************************************************

/*
function disable_textareas(side){
    //src_textarea.disabled
    if (side == 'src') src_textarea.disabled = true;
    else src_textarea.disabled = false;
    
    //src_textarea.style.background
    if (side == 'src') src_textarea.style.background = disabled_color;
    else src_textarea.style.background = enabled_color;

    //src_count_cell.disabled
    if (side == 'src') src_count_cell.style.background = disabled_color;
    else src_count_cell.style.background = enabled_color;

    //src_lang_cell.disabled
    if (side == 'src') src_lang_cell.style.background = disabled_color;
    else src_lang_cell.style.background = enabled_color;


    //tgt_textarea.disabled
    if (side == 'tgt') tgt_textarea.disabled = true;
    else tgt_textarea.disabled = false;
    
    //tgt_textarea.style.background
    if (side == 'tgt') tgt_textarea.style.background = disabled_color;
    else tgt_textarea.style.background = enabled_color;
    
    //tgt_count_cell.disabled
    if (side == 'tgt') tgt_count_cell.style.background = disabled_color;
    else tgt_count_cell.style.background = enabled_color;    

    //tgt_lang_cell.disabled
    if (side == 'tgt') tgt_lang_cell.style.background = disabled_color;
    else tgt_lang_cell.style.background = enabled_color;
}
*/

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

function hide_menuselect(){
	if (!menuselect.hasAttribute('hidden')){
		menuselect.setAttribute("hidden", "hidden");
		clear_and_reset_timeout(false);
		enable_textarea('both');
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


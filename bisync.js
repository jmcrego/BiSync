/****** MAIN ******/

let par_op = '｟';
let par_cl = '｠';
let textareaMaxLen = 0; //0 for no limit
let textareaSingleLine = true;
let timeoutID = null;
let mousePosX = 0;
let mousePosY = 0;
let disabled_color = '#FAFAFA';
let enabled_color = 'transparent';
const tts = window.speechSynthesis;

//Settings
let reset_all = document.getElementById("reset_all");
let settings = document.getElementById("settings");
let settings_table = document.getElementById("settings_table");
let IP = document.getElementById("IP");
let PORT = document.getElementById("PORT");
let address_server = "http://" + document.getElementById("IP").value + ":" + document.getElementById("PORT").value + "/";
let langs = document.getElementById("langs");
let alt = document.getElementById("alt");
let alt_incr = document.getElementById("alt_incr");
let alt_decr = document.getElementById("alt_decr");
let delay = document.getElementById("delay");
let delay_incr = document.getElementById("delay_incr");
let delay_decr = document.getElementById("delay_decr");

//Content
let src_lang = document.getElementById("src_lang");
let tgt_lang = document.getElementById("tgt_lang");
let src_textarea = document.getElementById("src_textarea");
let tgt_textarea = document.getElementById("tgt_textarea");
let src_div = document.getElementById("src_div");
let tgt_div = document.getElementById("tgt_div");

//Gadgets
let src_gadgets_cell = document.getElementById("src_gadgets_cell");
let tgt_gadgets_cell = document.getElementById("tgt_gadgets_cell");
let src_speak = document.getElementById("src_speak");
let tgt_speak = document.getElementById("tgt_speak");
let src_count = document.getElementById("src_count");
let tgt_count = document.getElementById("tgt_count");
let src_freeze = document.getElementById("src_freeze");
let tgt_freeze = document.getElementById("tgt_freeze");

//Menu with alternatives
let menuselect = document.getElementById("menuselect");
console.log('Server address: ' + address_server);

//when the initial HTML document has been completely loaded and parsed, without waiting for style sheets, images, and subframes to finish loading
document.addEventListener("DOMContentLoaded", reset_default());


/**************************************************************/
/*************************** EVENTS ***************************/
/**************************************************************/

//hide menuselect when escape released
document.addEventListener('keyup', (event) => {
	if (event.keyCode == 27) {hide_menuselect();}
});

//hide menuselect when click outside menuselect
document.addEventListener('click', (event) => {
	mousePosX = event.clientX;
	mousePosY = event.clientY;
	if (!menuselect.hasAttribute("hidden") && !menuselect.contains(event.target)) {hide_menuselect();}
});

//change of address
IP.addEventListener('change', (event) => {address_server = "http://" + IP.value + ":" + PORT.value + "/"; console.log('address: '+address_server)});
PORT.addEventListener('change', (event) => {address_server = "http://" + IP.value + ":" + PORT.value + "/"; console.log('address: '+address_server)});

//change of languages
langs.addEventListener('change', (event) => {reset_default();});

//click alt_incr
alt_incr.addEventListener('click', (event) => {
	if (alt.innerHTML == '15'){}//max reached
	else {alt.innerHTML = parseInt(alt.innerHTML) + 1;}
});

//click alt_decr
alt_decr.addEventListener('click', (event) => {
	if (alt.innerHTML == '2'){}//min reached
	else {alt.innerHTML = parseInt(alt.innerHTML) - 1;}
});

//click delay_incr
delay_incr.addEventListener('click', (event) => {
	if (delay.innerHTML == 'OFF') {delay.innerHTML = 1;}
	else if (delay.innerHTML == "5"){}
	else {delay.innerHTML = parseInt(delay.innerHTML) + 1;}
});

//click delay_decr
delay_decr.addEventListener('click', (event) => {
	if (delay.innerHTML == '1') {delay.innerHTML = "OFF";}
	else if (delay.innerHTML == "OFF"){}
	else {delay.innerHTML = parseInt(delay.innerHTML) - 1;}
});

//press settings
settings.addEventListener('click', (event) => {
	if (settings_table.getAttribute("hidden") == "hidden") {
		settings_table.removeAttribute("hidden");
		settings.style="font-variation-settings: 'FILL' 1, 'wght' 200, 'GRAD' 0, 'opsz' 24; cursor: pointer;"
	}
	else {
		settings_table.setAttribute("hidden", "hidden");
		settings.style="font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24; cursor: pointer;"
	}
});

//press button reset_all
reset_all.addEventListener('click', (event) => {reset_default();});

//press button speak_src
src_speak.addEventListener('click', (event) => {speak('src');});

//press button tgt_speak
tgt_speak.addEventListener('click', (event) => {speak('tgt');});

//press button src_freeze
src_freeze.addEventListener('click', (event) => {toggle_freeze('src');});

//press button tgt_freeze
tgt_freeze.addEventListener('click', (event) => {toggle_freeze('tgt');});

//press button src_copy
src_copy.addEventListener('click', (event) => {navigator.clipboard.writeText(src_textarea.value);});

//press button tgt_copy
tgt_copy.addEventListener('click', (event) => {navigator.clipboard.writeText(tgt_textarea.value);});

// Click down on src_textarea
src_textarea.addEventListener('click',(event) => caret_moved(event, 'src')); // Click down (only left button must be considered)
//src_textarea.addEventListener('keyup',(event) => caret_moved(event, 'src')); // Any key released (only arrows must be considered)

// Click down on tgt_textarea
tgt_textarea.addEventListener('click',(event) => caret_moved(event, 'tgt')); // Click down (only left button must be considered)
//tgt_textarea.addEventListener('keyup',(event) => caret_moved(event, 'tgt')); // Any key released (only arrows must be considered)

//when src_textarea is modified
src_textarea.addEventListener('input', (event) => {
   	hide_menuselect();
   	sync_div('src');
   	//sync_scroll('src');
    if (src_textarea.value.length){ 
	   	src_textarea.value = clean_line(src_textarea.value); 
	   	if (!tgt_is_freezed){
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
   	sync_div('tgt');
   	//sync_scroll('tgt');
    if (tgt_textarea.value.length){ 
	   	tgt_textarea.value = clean_line(tgt_textarea.value); 
	   	if (!src_is_freezed){
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

//src_textarea.addEventListener('scroll', (event) => {sync_scroll('src');});

//tgt_textarea.addEventListener('scroll', (event) => {sync_scroll('tgt');});


/*****************************************************************/
/*************************** FUNCTIONS ***************************/
/*****************************************************************/

function reset_default(){
	tgt_is_freezed = false;
	src_is_freezed = false;
	enable_textarea('both');
    src_textarea.value = '';
    sync_div('src');
 	//sync_scroll('src');
    tgt_textarea.value = '';
    sync_div('tgt');
    //sync_scroll('tgt');
    if (langs.options[langs.selectedIndex].value == 'enfr'){
	    tag_s2t = par_op + 'fr' + par_cl;
    	tag_t2s = par_op + 'en' + par_cl;
    	src_lang.innerHTML = 'English';
    	tgt_lang.innerHTML = 'Français';
    }
    else if (langs.options[langs.selectedIndex].value == 'defr'){
	    tag_s2t = par_op + 'fr' + par_cl;
    	tag_t2s = par_op + 'de' + par_cl;
    	src_lang.innerHTML = 'Deutsch';
    	tgt_lang.innerHTML = 'Français';
    }
    else if (langs.options[langs.selectedIndex].value == 'esfr'){
	    tag_s2t = par_op + 'fr' + par_cl;
    	tag_t2s = par_op + 'es' + par_cl;
    	src_lang.innerHTML = 'Español';
    	tgt_lang.innerHTML = 'Français';
    }
    update_counts();
    if (tts.speaking) tts.cancel();
	src_textarea.style.fontSize = '20px';
	src_div.style.fontSize      = '20px';
	tgt_textarea.style.fontSize = '20px';
	tgt_div.style.fontSize      = '20px';
	src_freeze.style="font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24; cursor: pointer;"
	tgt_freeze.style="font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24; cursor: pointer;"
	//src_freeze.style="font-variation-settings: 'FILL' 1, 'wght' 200, 'GRAD' 0, 'opsz' 24; cursor: pointer;"
	//tgt_freeze.style="font-variation-settings: 'FILL' 1, 'wght' 200, 'GRAD' 0, 'opsz' 24; cursor: pointer;"
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
		//if (tts.paused) {tts.resume();console.log('speak resume');}
		//else {tts.pause();console.log('speak pause');}
		tts.cancel();
		//console.log('speak stop');
	}
	else{
		//tts.cancel();
		const utterance = new SpeechSynthesisUtterance(ta.value); // speak text
		utterance.lang = lang; //fr-FR or en-GB
		tts.speak(utterance);
		//console.log('speak');
	}
}

function toggle_freeze(side){	
	if (side == 'src'){
		if (!src_is_freezed) {
			src_is_freezed = true;
			src_freeze.style="font-variation-settings: 'FILL' 1, 'wght' 200, 'GRAD' 0, 'opsz' 24; cursor: pointer;"
			disable_textarea('src')
		}
		else {
			src_is_freezed = false;
			src_freeze.style="font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24; cursor: pointer;"
			enable_textarea('src')
		}
	}
	else if (side == 'tgt'){
		if (!tgt_is_freezed) {
			tgt_is_freezed = true;
			tgt_freeze.style="font-variation-settings: 'FILL' 1, 'wght' 200, 'GRAD' 0, 'opsz' 24; cursor: pointer;"
			disable_textarea('tgt')
		}
		else {
			tgt_is_freezed = false;
			tgt_freeze.style="font-variation-settings: 'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24; cursor: pointer;"
			enable_textarea('tgt')
		}
	}
}

function enable_textarea(side){
	if (side == 'src' || side == 'both'){
		if (!src_is_freezed){
		    src_textarea.disabled = false;
    		src_div.style.background = enabled_color; //src_textarea.style.background = enabled_color;
    		src_gadgets_cell.style.background = enabled_color;
    		src_lang_cell.style.background = enabled_color;
    	}
	}
	if (side == 'tgt' || side == 'both'){
		if (!tgt_is_freezed){
		    tgt_textarea.disabled = false;
    		tgt_div.style.background = enabled_color; //tgt_textarea.style.background = enabled_color;
    		tgt_gadgets_cell.style.background = enabled_color;
    		tgt_lang_cell.style.background = enabled_color;
    	}
	}
}

function disable_textarea(side){
	if (side == 'src' || side == 'both'){
	    src_textarea.disabled = true;
    	src_div.style.background = disabled_color; //src_textarea.style.background = disabled_color;
   		src_gadgets_cell.style.background = disabled_color;
   		src_lang_cell.style.background = disabled_color;
	}
	if (side == 'tgt' || side == 'both'){
	    tgt_textarea.disabled = true;
    	tgt_div.style.background = disabled_color; //tgt_textarea.style.background = disabled_color;
   		tgt_gadgets_cell.style.background = disabled_color;
   		tgt_lang_cell.style.background = disabled_color;
	}
}

function sync_div(side){
	if (side == 'src'){
		ta = src_textarea;
		div = src_div;
	}
	else if (side == 'tgt'){
		ta = tgt_textarea;
		div = tgt_div;
	}
	ta.value = ta.value.replaceAll('\t',' '); //replace all TABs by spaces in textarea
	text = ta.value;
	//text = text.replace(/ /g,'&nbsp;'); //text = text.replaceAll(' ','&nbsp;') //prevents multiple spaces problem in <div>
	text = text.replace(/\r?\n/g,'<br/>'); //text = text.replaceAll('\n','<br>');
  	if (text.endsWith('<br/>')) { text += "&nbsp;"; } // Add a space to the final line if empty (this prevents newlines problem in <div>)
	div.innerHTML = text; //.replace(new RegExp("&", "g"), "&").replace(new RegExp("<", "g"), "<"); /* Global RegExp */
}

function sync_scroll(side){
	if (side == 'src'){
		ta = src_textarea;
		div = src_div;
	}
	else if (side == 'tgt'){
		ta = tgt_textarea;
		div = tgt_div;
	}
	/* Scroll result to scroll coords of event - sync with textarea */
	div.scrollTop = ta.scrollTop;
	div.scrollLeft = ta.scrollLeft;
}

function caret_moved(e,side) {
	caret_moved_side = side;
	hide_menuselect();
	if (e.key != 'ArrowDown' && e.key != 'ArrowUp' && e.key != 'ArrowLeft' && e.key != 'ArrowRight' && e.button != 0) {
		return;
	} 
	if (caret_moved_side=='src') {
		Start = src_textarea.selectionStart;
		End = src_textarea.selectionEnd;
		ta = src_textarea;
		ta_value = src_textarea.value;
	}
	else if (caret_moved_side=='tgt') {
		Start = tgt_textarea.selectionStart;
		End = tgt_textarea.selectionEnd;
		ta = tgt_textarea;
		ta_value = tgt_textarea.value;
	}

	if (Start != End) { //selection => gap
   		console.log('textarea caret selects from ' + Start + ' to ' + End + ': ' + ta_value.substring(Start, End));
		caret_moved_type = 'gap';
   		server_request_gap();
	}
	else { //caret moves => prefix (if begin of token)
		nextChar = ' ';
		prevChar = ' ';
		if (Start < ta_value.length) {nextChar = ta_value.charAt(Start);} 
		if (Start > 0) {prevChar = ta_value.charAt(Start-1);} 
		if (prevChar == ' ' && nextChar != ' '){
			console.log('textarea caret prefixes from ' + Start + ' char is '+ta_value.charAt(Start));
			caret_moved_type = 'pref';
	   		server_request_pref();
		}
	}
}

function update_counts(){
	src_count.innerHTML = src_textarea.value.length;
	tgt_count.innerHTML = tgt_textarea.value.length;
	if (textareaMaxLen>0) {
		src_count.innerHTML += '/'+textareaMaxLen;
		tgt_count.innerHTML += '/'+textareaMaxLen;
	}
	while (src_textarea.clientHeight < src_textarea.scrollHeight ||  tgt_textarea.clientHeight < tgt_textarea.scrollHeight){
		size = parseInt(window.getComputedStyle(src_textarea,null).getPropertyValue("font-size").slice(0, -2));
		if (size < 15) break;
		src_textarea.style.fontSize = (size - 1) + 'px';
		src_div.style.fontSize      = (size - 1) + 'px';
		tgt_textarea.style.fontSize = (size - 1) + 'px';
		tgt_div.style.fontSize      = (size - 1) + 'px';
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
    if (do_reset && delay.innerHTML != "OFF"){ //set new timeout
    	timeoutID = setTimeout(server_request_sync,parseInt(delay.innerHTML)*1000);
    }
}

function hide_menuselect(){
	if (!menuselect.hasAttribute('hidden')){
		menuselect.setAttribute("hidden", "hidden");
		clear_and_reset_timeout(false);
		enable_textarea('both');
	}	
}

//************************************************************************************
//*** server requests ****************************************************************
//************************************************************************************

async function server_request_sync(){
	if (src_is_freezed || tgt_is_freezed){
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
    params = { "src": src, "lang": tag, "tgt": tgt, "alt": alt.innerHTML, "mode": "sync"}
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
	   	sync_div('src');
	   	//sync_scroll('src');
		update_counts();
    }
    if (tgt_textarea.disabled){ //outputs in target side
		tgt_textarea.value = one_best;
	   	sync_div('tgt');
	   	//sync_scroll('tgt');
		update_counts();
    }
    enable_textarea('src');
    enable_textarea('tgt');
}

async function server_request_gap(){
	if (caret_moved_side == 'src'){ // tgt ((t2s)) src_with_gap
		Start = src_textarea.selectionStart;
		End = src_textarea.selectionEnd;
		str_gapped = src_textarea.value.substring(Start,End);
		tgt_with_gap = src_textarea.value.substring(0,Start) + par_op+'GAP'+par_cl + src_textarea.value.substring(End);
        lang = tag_t2s;
        src = tgt_textarea.value;
        disable_textarea('tgt');
	}
	else{ //side=='tgt'// src ((s2t)) tgt_with_gap
		Start = tgt_textarea.selectionStart;
		End = tgt_textarea.selectionEnd;
		str_gapped = tgt_textarea.value.substring(Start,End);
		tgt_with_gap = tgt_textarea.value.substring(0,Start) + par_op+'GAP'+par_cl + tgt_textarea.value.substring(End);
        lang = tag_s2t;
        src = src_textarea.value;
        disable_textarea('src');
	}
    params = { "src": src, "lang": lang, "tgt": tgt_with_gap, "alt": alt.innerHTML, "mode": "gap"}
    console.log("REQ: "+JSON.stringify(params));
    response = await fetch(address_server, {"credentials": "same-origin", "method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify(params)});
    if (! response.ok){
        console.log("RES: HTTP error: "+`${response.status}`);
        alert("HTTP error: "+`${response.status}`);
        return;
    }
    const data = await response.json();
    console.log("RES: "+JSON.stringify(data));
    optionsMenu(data['oraw'],str_gapped);
}

async function server_request_pref(){
	if (caret_moved_side == 'src'){ // tgt ((t2s)) src_pref
		Start = src_textarea.selectionStart;
		tgt_pref = src_textarea.value.substring(0,Start);
		str_gapped = src_textarea.value.substring(Start);
        lang = tag_t2s;
        src = tgt_textarea.value;
	    disable_textarea('tgt');
	}
	else{ //side=='tgt'// src ((s2t)) tgt_pref
		Start = tgt_textarea.selectionStart;
		tgt_pref = tgt_textarea.value.substring(0,Start);
		str_gapped = tgt_textarea.value.substring(Start);
        lang = tag_s2t;
        src = src_textarea.value;
	    disable_textarea('src');
	}
    params = { "src": src, "lang": lang, "tgt": tgt_pref, "alt": alt.innerHTML, "mode": "pref"};
    console.log("REQ: "+JSON.stringify(params));
    response = await fetch(address_server, {"credentials": "same-origin", "method": "POST", "headers": {"Content-Type": "application/json"}, "body": JSON.stringify(params)});
    if (! response.ok){
        console.log("RES: HTTP error: "+`${response.status}`);
        alert("HTTP error: "+`${response.status}`);
        return;
    }
    const data = await response.json();
    console.log("RES: "+JSON.stringify(data));
	optionsMenu(data['oraw'],str_gapped);
}

//************************************************************************************
//*** Menu with alternatives *********************************************************
//************************************************************************************

//when one option is selected on the floating menuselect
menuselect.onchange = function(){
	resp = menuselect.options[menuselect.selectedIndex].text;
    menuselect.setAttribute("hidden", "hidden");
    console.log('selected ' + resp);
    if (caret_moved_type == 'gap') {
	    if (caret_moved_side == 'src'){
			src_textarea.value = tgt_with_gap.replace(par_op+'GAP'+par_cl,resp);
		   	sync_div('src');
		   	//sync_scroll('src');
		   	if (!tgt_is_freezed){ clear_and_reset_timeout(true); }
	    }
    	else if (caret_moved_side == 'tgt') {
			tgt_textarea.value = tgt_with_gap.replace(par_op+'GAP'+par_cl,resp);
		   	sync_div('tgt');
		   	//sync_scroll('tgt');
		   	if (!src_is_freezed){ clear_and_reset_timeout(true); }
    	}
    }
    else if (caret_moved_type == 'pref') {
    	if (caret_moved_side == 'src'){ 
			src_textarea.value = src_textarea.value.substring(0,Start) + resp;
		   	sync_div('src');
		   	//sync_scroll('src');
		   	if (!tgt_is_freezed){ clear_and_reset_timeout(true); }
	    }
    	else if (caret_moved_side=='tgt') {
			tgt_textarea.value = tgt_textarea.value.substring(0,Start) + resp;
		   	sync_div('tgt');
		   	//sync_scroll('tgt');
		   	if (!src_is_freezed){ clear_and_reset_timeout(true); }
    	}
    }
    //disable_textareas('none');
   	update_counts();
   	hide_menuselect();
};

function optionsMenu(options, str_gapped){
	//remove previous select options
	while (menuselect.options.length > 0) {menuselect.remove(0);}

	//add new select options
	for (i = 0; i<options.length; i++){
	    opt = document.createElement('option');
    	opt.value = i;
	    opt.innerHTML = options[i];
	    console.log(str_gapped+' *** '+options[i])
	    if (options[i] == str_gapped){
			opt.style.backgroundColor = 'lightgrey';
	    	//opt.selected = true;
			//menuselect.selectedIndex = i; 
	    }
    	menuselect.appendChild(opt);
	}
    //positionning menu
	menuselect.style.left = mousePosX + 'px';
    menuselect.style.top  = mousePosY + 20 + 'px';
	menuselect.style.position = 'absolute';
    menuselect.removeAttribute("hidden"); //is visible
}




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
sync_label = document.getElementById("sync_label");
sync_values = document.getElementById("sync_values");
menuselect = document.getElementById("menuselect");
timeoutID = null;
src_textarea_pre = '';
tgt_textarea_pre = '';
disabled_color = '#FAFAFA';
const tts = window.speechSynthesis;

function reset_default(){
    src_textarea.disabled = false; //src_textarea is disabled when tgt_textarea is modified
    src_textarea.value = '';
    tag_s2t = par_op + tgt_lang.options[tgt_lang.selectedIndex].value + par_cl;
    
    tgt_textarea.disabled = false; //tgt_textarea is disabled when src_textarea is modified
    tgt_textarea.value = '';
    tag_t2s = par_op + src_lang.options[src_lang.selectedIndex].value + par_cl;

    update_counts();
    if (tts.speaking) tts.cancel();
    //sync_time.value = 1;
    //sync_label.value = '1 (sec)';
}

//when the initial HTML document has been completely loaded and parsed, without waiting for style sheets, images, and subframes to finish loading
document.addEventListener("DOMContentLoaded", reset_default());

//hide menuselect when escape released
document.addEventListener('keyup', (event) => {if (event.keyCode == 27) {hide_menuselect();}});
//hide menuselect when click outside menuselect
document.addEventListener('click', (event) => {if (!menuselect.contains(event.target)) {hide_menuselect();}}); 

//change of source language
src_lang.addEventListener('change', (event) => {reset_default();});

//change of target language
tgt_lang.addEventListener('change', (event) => {reset_default();});

sync_time.addEventListener('change', (event) => {console.log('changed sync to '+sync_values.options[event.target.value].label); sync_label.innerHTML = sync_values.options[event.target.value].label;});

//press button speak_src
speak_src.addEventListener('click', (event) => {
	if (src_textarea.value.length == 0){return;}
	if (tts.speaking) {
		if (tts.paused) {tts.resume();console.log('speak_src resume');}
		else {tts.pause();console.log('speak_src pause');}
	}
	else{
		tts.cancel();
		const utterance = new SpeechSynthesisUtterance(src_textarea.value); // speak text
		utterance.lang = 'en-GB';
		tts.speak(utterance);
		console.log('speak_src speak');
	}
});

//press button speak_tgt
speak_tgt.addEventListener('click', (event) => {
	if (tgt_textarea.value.length == 0){return;}
	if (tts.speaking) {
		if (tts.paused) {tts.resume();console.log('speak_tgt resume');}
		else {tts.pause();console.log('speak_tgt pause');}
	}
	else{
		tts.cancel();
		const utterance = new SpeechSynthesisUtterance(src_textarea.value); // speak text
		utterance.lang = 'fr-FR';
		tts.speak(utterance);
		console.log('speak_tgt speak');
	}
});


//************************************************************************************
//*** textareas modified *************************************************************
//************************************************************************************

//when src_textarea is modified
src_textarea.addEventListener('input', (event) => {
   	hide_menuselect();
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
    if (tts.speaking) tts.cancel();
});

//when tgt_textarea is modified
tgt_textarea.addEventListener('input', (event) => {
   	hide_menuselect();
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
	hide_menuselect();
	if (e.key != 'ArrowDown' && e.key != 'ArrowUp' && e.key != 'ArrowLeft' && e.key != 'ArrowRight' && e.button != 0) {
		return;
	} 
	if (side=='src') {
		Start = src_textarea.selectionStart;
		End = src_textarea.selectionEnd;
		ta = src_textarea;
		ta_value = src_textarea.value;
	}
	else if (side=='tgt') {
		Start = tgt_textarea.selectionStart;
		End = tgt_textarea.selectionEnd;
		ta = tgt_textarea;
		ta_value = tgt_textarea.value;
	}

	if (Start != End) { //selection => gap
   		console.log('textarea cursor selects from ' + Start + ' to ' + End + ': ' + ta_value.substring(Start, End));
   		server_request_gap(side);
	}
	else { //cursor moves => prefix (if begin of token)
		nextChar = ' ';
		prevChar = ' ';
		if (Start < ta_value.length) {nextChar = ta_value.charAt(Start);} 
		if (Start > 0) {prevChar = ta_value.charAt(Start-1);} 
		if (prevChar == ' ' && nextChar != ' '){
			console.log('textarea cursor prefixes from ' + Start + ' char is '+ta_value.charAt(Start));
	   		server_request_pref(side);
		}
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
		//cursor = src_textarea_cursor
        tag = tag_t2s;
        src = tgt_textarea.value;
	}
	else{ //side=='tgt'
		Start = tgt_textarea.selectionStart;
		End = tgt_textarea.selectionEnd;
		ta = tgt_textarea;
		ta_value = tgt_textarea.value;
		//cursor = tgt_textarea_cursor
        tag = tag_s2t;
        src = src_textarea.value;
	}
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
    optionsMenu(side,options);
}

async function server_request_pref(side){
	if (side=='src'){
		Start = src_textarea.selectionStart;
		End = src_textarea.selectionEnd;
		ta = src_textarea;
		ta_value = src_textarea.value;
		//cursor = src_textarea_cursor
        tag = tag_t2s;
        src = tgt_textarea.value;
	}
	else{ //side=='tgt'
		Start = tgt_textarea.selectionStart;
		End = tgt_textarea.selectionEnd;
		ta = tgt_textarea;
		ta_value = tgt_textarea.value;
		//cursor = tgt_textarea_cursor
        tag = tag_s2t;
        src = src_textarea.value;
	}
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
    optionsMenu(side,options);
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
   	hide_menuselect();
};

function optionsMenu(side, options){
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
	//let {posX, posY} = getCaretTopPoint();

	posY = -565;
	if (side == 'src') {posX = 30;}
	else {posX = -30 - menuselect.clientWidth;}

    menuselect.style.left = posX + 'px';
    menuselect.style.top  = posY + 'px';
    menuselect.removeAttribute("hidden"); //is visible
}

function getCaretTopPoint () {
	const sel = document.getSelection();
    const r = sel.getRangeAt(0);
    let rect;
    let r2;
    let x;
    let y;
    // supposed to be textNode in most cases
    // but div[contenteditable] when empty
    const node = r.startContainer;
    const offset = r.startOffset;
    if (offset > 0) {
        // new range, don't influence DOM state
        r2 = document.createRange()
        r2.setStart(node, (offset - 1))
        r2.setEnd(node, offset)
        // https://developer.mozilla.org/en-US/docs/Web/API/range.getBoundingClientRect
        // IE9, Safari?(but look good in Safari 8)
        rect = r2.getBoundingClientRect()
        x = rect.right;
        y = rect.top;
    } else if (offset < node.length) {
        r2 = document.createRange()
        // similar but select next on letter
        r2.setStart(node, offset)
        r2.setEnd(node, (offset + 1))
        rect = r2.getBoundingClientRect()
		x = rect.left;
		y = rect.top;
    } else { // textNode has length
        // https://developer.mozilla.org/en-US/docs/Web/API/Element.getBoundingClientRect
        rect = node.getBoundingClientRect()
        const styles = getComputedStyle(node)
        const lineHeight = parseInt(styles.lineHeight)
        const fontSize = parseInt(styles.fontSize)
        // roughly half the whitespace... but not exactly
        const delta = (lineHeight - fontSize) / 2
        x = rect.left;
        y = (rect.top + delta);
    }
    console.log('caret position ['+x+', '+y+']');
    return {x, y};
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

    //src_lang_cell.disabled
    if (side == 'src') src_lang_cell.style.background = disabled_color;
    else src_lang_cell.style.background = 'transparent';


    //tgt_textarea.disabled
    if (side == 'tgt') tgt_textarea.disabled = true;
    else tgt_textarea.disabled = false;
    
    //tgt_textarea.style.background
    if (side == 'tgt') tgt_textarea.style.background = disabled_color;
    else tgt_textarea.style.background = 'transparent';
    
    //tgt_count_cell.disabled
    if (side == 'tgt') tgt_count_cell.style.background = disabled_color;
    else tgt_count_cell.style.background = 'transparent';    

    //tgt_lang_cell.disabled
    if (side == 'tgt') tgt_lang_cell.style.background = disabled_color;
    else tgt_lang_cell.style.background = 'transparent';

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

function hide_menuselect(){
	if (!menuselect.hasAttribute('hidden')){
		menuselect.setAttribute("hidden", "hidden");
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


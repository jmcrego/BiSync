import logging
import pyonmttok
import ctranslate2
from flask import Flask, request, json, jsonify
from flask_cors import CORS

### run this script on the server:
# export FLASK_APP=bisync.py
# flask run --host=0.0.0.0 --port=5000
### to test, you can send client data using:
#curl -X POST -H "Content-type: application/json" -d "{\"src\": \"This is my new sentence.\", \"lang\":\"｟fr｠\", \"tgt\":\"\", \"mode\":\"sync\"}" "http://127.0.0.1:5000/"
logging.basicConfig(format='[%(asctime)s.%(msecs)03d] %(levelname)s %(message)s', datefmt='%Y-%m-%d_%H:%M:%S', level=getattr(logging, 'INFO', None), filename='./bisync.log')

mdir = "./ct2_model_ckpt-524288"
translator = ctranslate2.Translator(mdir, device="cpu")
logging.info('loaded Model {}'.format(mdir))
onmttok = pyonmttok.Tokenizer('aggressive', joiner_annotate=True, segment_numbers=True, bpe_model_path=mdir+"/bpe_32k")
logging.info('loaded Tokenizer')

app = Flask(__name__)
CORS(app)
@app.route('/', methods=['POST'])

def sync_request():
    req = request.json
    logging.info('REQUEST: {}'.format(req))
    oraw = translate(req['src'], req['lang'], req['tgt'], req['mode'], int(req['alt']))
    res = {"oraw" : oraw}
    logging.info('RESPONSE: {}'.format(res))
    return jsonify(res);


def translate(src, lang, tgt, mode, alt):
    if mode == 'sync':
        if len(tgt) == 0:
            iraw = src + ' ' + lang
        else:
            operation = '｟INS｠'
            iraw = src + ' ' + lang #+ ' ' + tgt + ' ' + operation
        itok = onmttok(iraw)
        results = translator.translate_batch([itok], disable_unk=True)
        otok = results[0].hypotheses
        oraw = [onmttok.detokenize(t) for t in otok]

    elif mode == 'gap':
        iraw = src + ' ' + lang + ' ' + tgt
        itok = onmttok(iraw)
        results = translator.translate_batch([itok], beam_size=alt, num_hypotheses=alt, return_alternatives=True, disable_unk=True)
        otok = results[0].hypotheses
        oraw = [onmttok.detokenize(t) for t in otok]

    elif mode == 'pref':
        iraw = src + ' ' + lang 
        itok = onmttok(iraw)
        praw = tgt
        ptok = onmttok(praw)
        results = translator.translate_batch([itok], target_prefix=[ptok], beam_size=alt, num_hypotheses=alt, return_alternatives=True, disable_unk=True)
        otok = results[0].hypotheses
        oraw = [onmttok.detokenize(t[len(ptok):]) for t in otok]

    logging.info('iraw: {}'.format(iraw))
    logging.info('itok: {}'.format(itok))
    logging.info('otok: {}'.format(otok))
    logging.info('oraw: {}'.format(oraw))
    return oraw #list with alternatives

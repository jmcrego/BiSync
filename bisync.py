import logging
import pyonmttok
import ctranslate2
from flask import Flask, request, json, jsonify
from flask_cors import CORS

### run this script on the server:
# export FLASK_APP=bisync.py
# flask run --host=0.0.0.0 --port=5000
### send client data using:
#curl -X POST -H "Content-type: application/json" -d "{\"src\": \"My source sentence.\", \"tgt\": \"Ma phrase\", \"tag\":\"｟to-fr｠\", \"ind\": -1}" "http://10.25.0.1:5000/"
logging.basicConfig(format='[%(asctime)s.%(msecs)03d] %(levelname)s %(message)s', datefmt='%Y-%m-%d_%H:%M:%S', level=getattr(logging, 'INFO', None), filename='./bisync.log')

mdir = "./ct2_model_ckpt-81920"
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
    oraw = translate(req['src'], req['lang'], req['tgt'], req['mode'])
    res = {"oraw" : oraw}
    logging.info('RESPONSE: {}'.format(res))
    return jsonify(res);


def translate(src, lang, tgt, mode):
    if mode == 'sync':
        if len(tgt) == 0:
            iraw = src + ' ' + lang
        else:
            operation = '｟INS｠'
            iraw = src + ' ' + lang #+ ' ' + tgt + ' ' + operation

    elif mode == 'gap':
        iraw = src + ' ' + lang + ' ' + tgt

    logging.info('iraw: {}'.format(iraw))
    itok = onmttok(iraw)
    logging.info('itok: {}'.format(itok))
    results = translator.translate_batch([itok])
    otok = results[0].hypotheses[0]
    logging.info('otok: {}'.format(otok))
    oraw = onmttok.detokenize(otok)
    logging.info('oraw: {}'.format(oraw))
    return oraw

import pyonmttok
from flask import Flask, request, json, jsonify
from flask_cors import CORS
import logging

### run this script on the server:
# export FLASK_APP=bisync.py
# flask run --host=0.0.0.0 --port=5000
### send client data using:
#curl -X POST -H "Content-type: application/json" -d "{\"src\": \"My source sentence.\", \"tgt\": \"Ma phrase\", \"tag\":\"｟to-fr｠\", \"ind\": -1}" "http://10.25.0.1:5000/"
logging.basicConfig(format='[%(asctime)s.%(msecs)03d] %(levelname)s %(message)s', datefmt='%Y-%m-%d_%H:%M:%S', level=getattr(logging, 'INFO', None), filename='./bisync.log')

onmttok = pyonmttok.Tokenizer('conservative', joiner_annotate=True)
#bisync_model = 
app = Flask(__name__)
CORS(app)
@app.route('/', methods=['POST'])

#def process_json():
def json_request():
    req = request.json
    logging.info('REQUEST {}'.format(req))
    src = req['src']
    tag = req['tag']
    tgt = req['tgt']
    
    raw_input = src + ' ' + tag + ' ' + tgt
    tok_input = onmttok(raw_input)

    ### translate 
    alt = []
    tok_output = tok_input #translate(tok_input)
    raw_output = onmttok.detokenize(tok_output)
        
    raw_output = onmttok.detokenize(tok_output)
    res = {"out" : raw_output, "alt": alt}
    logging.info('RESPONSE {}'.format(res))
    return jsonify(res);


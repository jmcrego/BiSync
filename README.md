<p align="right"> <img src="logos/systran-logo.svg" height="75"/> &nbsp; &nbsp; <img src="logos/lisn-logo.svg" height="75"/> </p>

# BiSync  

BiSync is a bilingual writing assistant that allows users to freely compose text in two languages while maintaining the two monolingual texts synchronized. It is trained to restore parallelism by following similar updates to those introduced by the user.
BiSync also includes additional functionalities, such as the display of alternative prefix translations and paraphrases, which are intended to facilitate the authoring of texts. 
Read <a href="https://arxiv.org/pdf/2210.13163.pdf" target="_blank">this</a> paper for further details on the BiSync network.

<a href="https://youtu.be/_l-ugDHfNgU" target="_blank">This</a> video demonstrates BiSync.

## Download and Install

* Clone this repository:
```
git clone https://github.com/jmcrego/BiSync.git
```
* Dependencies in requirements.txt are needed to run the server.
```
pip install -r requirements.txt
```
* Download available BiSync models (to the same directory where you clone this repository):
  - <a href="https://drive.google.com/file/d/1UlX82eprW3dT8WrZDr7dkn_ACrAdW9vl/view?usp=share_link" target="_blank">ct2_en-fr_int8.tgz</a>
* Uncompress the .tgz file:
```
tar xvzf ct2_en-fr_int8.tgz
ls ct2_en-fr_int8
  358K bpe_32k
   59M model.bin
  258K shared_vocabulary.txt
```

## Instructions

### Server

To run the model (linux or macos) use:

```bash
export FLASK_APP=bisync.py
flask run --host=127.0.0.1 --port=5000
```

### Client

Open bisync.html using any web browser (preferably Chrome):
* Configuration:
  - Update IP and Port settings with the address where the BiSync server was launched.
  - Select the left and right-side languages (the model must habe been trained with such languages).
  - Select the number of alternatives to request as well as the delay before synchronisation takes place.
    <p align="center"> <img src="https://github.com/jmcrego/BiSync/blob/main/pics/bisync_settings.png" alt="BiSync settings" width="250"/> </p>
* Use:
  - Edit (or post-edit) any input box and BiSync will automatically synchronise the other box to restore parallelism.
    <p align="center"> <img src="https://github.com/jmcrego/BiSync/blob/main/pics/tired.png" alt="Bilingual synchronisation"/> </p>
  - Click on the beginning of a word to get alternative translations starting on such word (previous words will remain unchanged).
    <p align="center"> <img src="https://github.com/jmcrego/BiSync/blob/main/pics/tired_prefix.png" alt="Prefix alternatives"/> </p>
  - Select a sequence of words to get alternative translations for the selected sequence.
    <p align="center"> <img src="https://github.com/jmcrego/BiSync/blob/main/pics/tired_gap.png" alt="Paraphrase alternatives"/> </p>

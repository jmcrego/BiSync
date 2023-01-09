<p align="right"> <img src="logos/systran-logo.svg" height="75"/> &nbsp; &nbsp; <img src="logos/lisn-logo.svg" height="75"/> </p>

# BiSync  

BiSync is a writing tool that allows you to edit texts in two languages.

In the general setting, BiSync works as a classical MT system providing the translation of input sentences. When the user refines (post-edits) a previous translation in one of the languages, BiSync transforms the text in the other language to restore the translation parallelism. BiSync is trained to restore parallelism by following similar updates to those introduced by the user. BiSync can also produce alternative translations from a given word or paraphrases for a selected word sequence. Read this <a href="https://arxiv.org/pdf/2210.13163.pdf" target="_blank">paper</a> for further details on the BiSync network.

## Download

* Clone this repository into a machine with an available web browser to run the client (bisync.html).
* Clone this repository into a machine to run the server (bisync.py).
* Download available BiSync models into the machine where the server will run (use *-cpu to run on CPU and *-gpu when a GPU is available):
  - en-fr-cpu, en-fr-gpu
  - en-es-cpu, en-es-gpu
  - es-fr-cpu, es-fr-gpu

## Instructions

### Server

To run the model (linux or macos) use:

```bash
export FLASK_APP=bisync.py
flask run --host=127.0.0.1 --port=5000
```
Dependencies in requirements.txt are needed to run the server.

### Client

Load bisync.html using any web browser:
* Configuration:
  - Update IP and Port settings with the address where the BiSync server was launched.
  - Select the left and right-side languages (the model must habe been trained with such languages).
* Use:
  - Edit (or post-edit) your text on either language. BiSync will update the corresponding translation.
  - Place the cursor on the beginning of a word to get alternative translations starting on the selected word.
  - Select a sequence of words to get alternative translations if the selected sequence.

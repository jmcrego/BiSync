# BiSync

BiSync is a writing assistant that allows to edit and synchronize text in two languages.
             
In the most general setting, BiSync works as a classical MT system providing the translation of input sentences. In addition, when the user refines (post-edits) a preceding translation in either language, BiSync transforms the text in the other language to restore translation parallelism. BiSync is trained to restore parallelism by following similar updates to those introduced by the user. Read this [paper](https://arxiv.org/pdf/2210.13163.pdf) for further details on the BiSync network.

## Download

Download available BiSync models (use *-cpu to run on CPU and *-gpu when a GPU is available):

* en-fr-cpu, en-fr-gpu
* en-es-cpu, en-es-gpu
* es-fr-cpu, es-fr-gpu

## Instructions

### Server

To run the model (linux or macos) use:

```bash
export FLASK_APP=bisync.py
flask run --host=127.0.0.1 --port=5000
```

You need OpenNMT-tf, pyonmttok, flask and flask_cors libraries. You may use a remote host and any available port.

### Client

Use a web browser and load bisync.html:
* Update IP and Port settings with the address where the BiSync server was launched.
* Activate the Debug setting to obtain details of the client/server communication.
* Select the left and right-side languages (the model must habe been trained with such languages).
* Edit (or post-edit) any text area and press the BiSync button to get the corresponding translation.
* Double-click on any word to obtain alternative translations starting from the selected word.
* You are allowed to write up to 5000 characters.


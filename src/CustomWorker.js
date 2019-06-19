
var workerCode = require('./worker/WorkerFunctionEmitter').valueOf();

var MIME_TYPE = 'application/javascript';

var stringifyCodeBits = function(codeBits) {
    var blobs = [];
    switch (typeof codeBits) {
        case 'string':
            codeBits = [codeBits];
        case 'array':
            blobs = codeBits.map(processCodeBits);
        default:
            break;
    }

    return blobs;
}

var processCodeBits = function(codeBit) {
    if (!codeBit) {
        codeBit = '';
    }

    if (codeBit.indexOf('\n') !== -1) {
        return Promise.resolve(codeBit);
    } else {
        return fetch(codeBit).then(r => r.blob());
    }
}

window.CustomWorker = function(codeBits) {
    codeBits = stringifyCodeBits(codeBits);

        workerCode = workerCode.toString().slice(13);
        workerCode = workerCode.slice(0, workerCode.length-2);

    codeBits.unshift(processCodeBits(workerCode));

    var cWorker = this;

    Promise.all(codeBits).then(function(codeStrings) {
        var codeForWorker = new Blob(codeStrings, {type: MIME_TYPE});
        var codeUrl = URL.createObjectURL(codeForWorker);

                    var pending = {};

        cWorker.worker = new Worker(codeUrl);
        cWorker.worker.onmessage = function(messageEvent) {
            var data = messageEvent.data;

            if (data.type === 'function') {
                cWorker[data.name] = function() {
                    var params = [];
                    for(var a of arguments) {
                        params.push(a);
                    }
                    var payload = {
                        type: 'function',
                        name: data.name,
                        data: params
                    }
                    if (this.hasResponse) {
                        payload.respondCode = Date.now();
                    }
                    cWorker.worker.postMessage(payload);

                    if (this.hasResponse) {
                        var p = new Promise(function(resolve, reject) {
                            pending[payload.respondCode] = resolve
                        });
                        return p;
                    }
                }
                cWorker[data.name].hasResponse = data.isResolved;
                cWorker[data.name] = cWorker[data.name].bind(cWorker[data.name]);
            }
            if (data.type === 'response') {
                var pendingResolver = pending[data.id];
                if (pendingResolver) {
                    delete pending[data.id];
                    pendingResolver(data.response)
                }
            }
        }
    });
}

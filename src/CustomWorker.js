
var UUID = require('./UUID');
var workerCode = require('./worker/WorkerFunctionEmitter');

var MIME_TYPE = 'application/javascript';

var convertCodeLinksToStrings = function(codeBit) {
    if (!codeBit) {
        codeBit = '';
    }

    if (codeBit.indexOf('\n') !== -1) {
        return Promise.resolve(codeBit);
    } else {
        return fetch(codeBit).then(r => r.blob());
    }
}

var stringifyCodeBits = function(codeBits) {
    var blobs = [];
    switch (typeof codeBits) {
        case 'string':
            codeBits = [codeBits];
        case 'array':
            blobs = codeBits.map(convertCodeLinksToStrings);
        default:
            break;
    }

    return blobs;
}

var processMessage = function(messageEvent) {

    var data = messageEvent.data;

    switch (data.type) {
        case 'function'
    }
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
                payload.respondCode = UUID.generate();
            }
            worker.postMessage(payload);

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


window.CustomWorker = function(codeBits) {
    codeBits = stringifyCodeBits(codeBits);

    var workerCodeStr = workerCode.getCodeAsString();
    codeBits.unshift(convertCodeLinksToStrings(workerCodeStr));

    var cWorker = this;
    var pending = {};
    var worker = null;

    Promise.all(codeBits).then(function(codeStrings) {
        var codeForWorker = new Blob(codeStrings, {type: MIME_TYPE});
        var codeUrl = URL.createObjectURL(codeForWorker);

        worker = new Worker(codeUrl);
        worker.onmessage = function(messageEvent) {
            var data = messageEvent.data;

            if (data.type === 'function') {
                cWorker[data.name] = function() {
                    var params = [];
                    jfor(var a of arguments) {
                        params.push(a);
                    }
                    var payload = {
                        type: 'function',
                        name: data.name,
                        data: params
                    }
                    if (this.hasResponse) {
                        payload.respondCode = UUID.generate();
                    }
                    worker.postMessage(payload);

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

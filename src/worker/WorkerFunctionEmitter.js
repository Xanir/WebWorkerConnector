
module.exports = function() {

    var registeredFuctions = {};
    var workerContext = this;
    workerContext.onmessage = function(messageEvent) {
        var mData = messageEvent.data;
        if (mData.type === 'function');

        var fnAction = registeredFuctions[mData.name];
        if (fnAction) {
            var response = fnAction.fn.apply(null, mData.data);
            if (mData.respondCode) {
                workerContext.postMessage({
                    id: mData.respondCode,
                    type: 'response',
                    response: response
                });
            }
        }
    }

    var registerFunction = function(fnName, fnCode, isResolved) {
        isResolved = !!isResolved;
        workerContext.postMessage({
            type: 'function',
            name: fnName,
            isResolved: isResolved
        });
        registeredFuctions[fnName] = {fn: fnCode, responds: isResolved};
    }

    var registerEvent = function(eventName) {
        workerContext.postMessage({
            type: 'event',
            name: fnName,
            isResolved: isResolved
        });
    }

};

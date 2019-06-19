# WebWorkerConnector

var workerCode = `
	registerFunction('pushData', function(data) {
	  console.log(data)
    })

	registerFunction('addValues', function(a, b, c) {
	  return a + b + c;
    })
`
var myWorker = new CustomWorker(workerCode)

myWorker.pushData('pushing stuff to a worker');
myWorker.addValues(4, 7, 3).then(console.log)

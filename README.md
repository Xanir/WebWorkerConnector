# WebWorkerConnector

```
var workerCode = `
	var data = [];
	registerFunction('pushData', function(data) {
		var data.push(data)
    });
	registerFunction('addData', function(data) {
		return data.reduce((t, v) => t+v);
    }, true);

	registerFunction('addValues', function(a, b, c) {
	  return a + b + c;
    }, true)
`
var myWorker = new CustomWorker(workerCode)

myWorker.pushData(4);
myWorker.pushData(9);
myWorker.addData().then(console.log); // 13

myWorker.addValues(4, 7, 3).then(console.log) //14
```

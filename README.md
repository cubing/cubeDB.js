# `cubeDB.js`

Robust browser-side storage for speedsolving results using [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB) and [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

See [schema.md](./schema.md) for nitty-gritty details.

Note: this is still experimental.

## Goal

Create a *standard storage format* and a *reference library* for storing speedsolving times that:

- exposes high-level functions that are *easy* to use and *flexible* enough for most Javascript cubing timers,
- allows large databases and *efficient* updates,
- supports *syncing* across different devices/timers, and
- encourages *good practices* (e.g. asynchronous code, simplicity and sane defaults rather than many options, separation of concerns, efficient APIs for data operations)

## A note on `Promise`s

In order to avoid freezing a web page while waiting for an operation to finish, Javascript supports *asynchronous* execution. `cubeDB.js` uses [Promises](https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Promise), which are a [well-designed](https://promisesaplus.com/) way that many modern web apps handle this. Feel free to read up on Promises, but you only have to know one trick in order to use them: Instead of

    var result = functionThatReturnsAValue();
    // Do something with the result.

do this:

    functionThatReturnsAPromise().then(function(result) {
      // Do something with the result.
    })


## Current API (subject to change)

### Initialization

    cubeDB.initialize().then(function() {
      // cubeDB is ready.
    })

### Adding Attempts

    cubeDB.addAttempt({
      "date": currentUnixSeconds(),
      "resultCentiseconds": randomInt.below(1000) + 1000
    })

### Export

    cubeDB.export().then(function(jsonData) {
      console.log("cubeDB export:", jsonData)
    })

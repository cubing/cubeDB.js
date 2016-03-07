/* Definitions */

var currentUnixSeconds = function() {
  return Math.floor((new Date()).getTime() / 1000);
};

var testAddingAttempt = function() {
  var cubeDB = new CubeDB();

  var addAttempt = function() {
    return cubeDB.addAttempt({
      "date": currentUnixSeconds(),
      "resultMilliseconds": Math.floor(Math.random()*10000) + 10000
    });
  };

  var done = function() {
    DEBUG_LOG("Reached end of test!");
  }

  cubeDB.initialize()
    .then(addAttempt)
    .then(addAttempt)
    .then(cubeDB.export.bind(cubeDB))
    .then(function(json) {
      DEBUG_LOG(JSON.stringify(json, null, "  "));
    })
    .then(done);
};

var deleteDatabase = function() { return new Promise(function(resolve, reject) {
  var request = indexedDB.deleteDatabase("cubeDB");
  request.onsuccess = function() {
    DEBUG_LOG("Deleted old database.");
    resolve();
  }
  request.onerror = reject;
})};

// Test code.

deleteDatabase().then(testAddingAttempt);
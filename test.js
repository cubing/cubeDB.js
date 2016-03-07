/* Definitions */

var currentUnixSeconds = function() {
  return Math.floor((new Date()).getTime() / 1000);
};

var testAddingAttempt = function() {
  var cubeDB = new CubeDB();

  var addAttempt = function() {
    cubeDB.addAttempt({
      "date": currentUnixSeconds(),
      "resultMilliseconds": 1113
    });
  };

  var done = function() {
    DEBUG_LOG("Reached end of test!");
  }

  cubeDB.initialize()
    .then(addAttempt)
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
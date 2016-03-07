"use strict";

/*

- import/export to JSON (with version)
- promisify everything

*/

var CubeDB = function() {
  this.debugLog("CubeDB");
  if (!indexedDB) {
    throw new Error("Your browser does not support IndexedDB for storage!");
  }
  this.initializeDB();
}

CubeDB.prototype = {
  DATABASE_NAME: "cubeDB",
  CURRENT_DATABASE_VERSION: 1,
  UUID_NUM_CHARS: 16,
  DEBUG: true,

  debugLog: function(message) {
    if (this.DEBUG) {
      console.log.apply(console, arguments);
    }
  },

  initializeDB: function() {
    var request = indexedDB.open(this.DATABASE_NAME, this.CURRENT_DATABASE_VERSION);
    request.onerror = function(event) {
      throw new Error("Could not open dabatase!");
    };
    request.onsuccess = this.debugLog.bind(this, "Successfully opened database.", event);
    request.onupgradeneeded = this.onupgradeneeded.bind(this);
  },

  onupgradeneeded: function(event) {
    this.debugLog("onupgradeneeded");
    this.createDatabaseV1(event);
  },

  createDatabaseV1: function(event) {
    this.db = event.target.result;
    var attemptsStore = this.db.createObjectStore("attempts", {keyPath: "id"});
    attemptsStore.createIndex("date", "date", {unique: false});
    attemptsStore.createIndex("resultMilliseconds", "resultMilliseconds", {unique: false});
    attemptsStore.transaction.oncomplete = (function() {
      this.debugLog("attemptsStore created");
      this.addAttempt({
        "date": currentUnixSeconds(),
        "resultMilliseconds": 1113
      });
    }).bind(this);
  },

  newUUID: function() {
    // To make it clear from a glance that the UUID is a string,
    // always start with an alphabetic character.
    var charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var uuid = charSet[randomInt.below(charSet.length)];

    // Now allow numeric characters.
    charSet += "0123456789";
    while (uuid.length < this.UUID_NUM_CHARS) {
      uuid += charSet[randomInt.below(charSet.length)];
    }
    this.debugLog("New UUID:", uuid);
    return uuid;
  },

  addAttempt: function(attemptData) {
    this.debugLog("addAttempt");
    // TODO: validate attemptData
    var transaction = this.db.transaction(["attempts"], "readwrite");

    var attemptsStore = transaction.objectStore("attempts");
    attemptData.id = this.newUUID();
    attemptsStore.put(attemptData);
    transaction.oncomplete = console.log.bind(console, "oncomplete");
  },

  export: function() {
    return {
      "version": 1
    };
  }
}

var currentUnixSeconds = function() {
  return Math.floor((new Date()).getTime() / 1000);
}

/* Test code */

var request = indexedDB.deleteDatabase("cubeDB");
request.onerror = console.log.bind(console, "error");
request.onsuccess = function() {
  console.log("success");
  var cubeDB = new CubeDB();
}

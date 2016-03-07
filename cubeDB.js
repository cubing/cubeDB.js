"use strict";

/*

- import to JSON (with version)
- Make the CubeDB constructor work as a promise
- Support deleting/resetting database (with backup?)
- Handle transaction.onabort

*/

var DEBUG_LOG = function(message) {
  console.log.apply(console, arguments);
};

var CubeDB = function() {
  DEBUG_LOG("CubeDB constructor");
  if (!indexedDB) {
    throw new Error("Your browser does not support IndexedDB for storage!");
  }
};

CubeDB.prototype = {
  DEFAULT_DATABASE_NAME: "cubeDB",
  CURRENT_DATABASE_VERSION: 1,
  UUID_NUM_CHARS: 16,

  initialize: function(databaseName) { return new Promise((function(resolve, reject) {
    DEBUG_LOG("initialize");
    var request = indexedDB.open(databaseName || this.DEFAULT_DATABASE_NAME, this.CURRENT_DATABASE_VERSION);
    request.onsuccess = resolve;
    request.onerror = function(event) {
      throw new Error("Could not open dabatase!");
    };
    request.onupgradeneeded = this._onupgradeneeded.bind(this);
  }).bind(this)); },

  _onupgradeneeded: function(event) { return new Promise((function(resolve, reject) {
    DEBUG_LOG("_onupgradeneeded");
    this._createDatabaseV1(event).then(resolve, reject);
  }).bind(this)); },

  _createDatabaseV1: function(event) { return new Promise((function(resolve, reject) {
    DEBUG_LOG("_createDatabaseV1");
    this._database = event.target.result;

    // Create object store.
    var attemptsStore = this._database.createObjectStore("attempts", {keyPath: "id"});

    // Create indices.
    attemptsStore.createIndex("date", "date", {unique: false});
    attemptsStore.createIndex("resultCentiseconds", "resultCentiseconds", {unique: false});

    // Callback handling.
    attemptsStore.transaction.oncomplete = resolve;
    attemptsStore.transaction.onerror = reject;
  }).bind(this)); },

  _newUUID: function() {
    // To make it clear from a glance that the UUID is a string,
    // always start with an alphabetic character.
    var charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var uuid = charSet[randomInt.below(charSet.length)];

    // Now allow numeric characters.
    charSet += "0123456789";
    while (uuid.length < this.UUID_NUM_CHARS) {
      uuid += charSet[randomInt.below(charSet.length)];
    }
    DEBUG_LOG("New UUID:", uuid);
    return uuid;
  },

  addAttempt: function(attemptData) { return new Promise((function(resolve, reject) {
    DEBUG_LOG("addAttempt");
    // TODO: validate attemptData
    var transaction = this._database.transaction(["attempts"], "readwrite");

    var attemptsStore = transaction.objectStore("attempts");
    attemptData.id = this._newUUID();
    attemptsStore.put(attemptData);
    transaction.oncomplete = resolve;
    transaction.onerror = reject;
  }).bind(this)); },

  // TODO: Generalize this to export any IndexedDB database.
  export: function() { return new Promise((function(resolve, reject) {
    DEBUG_LOG("export");
    var transaction = this._database.transaction(["attempts"], "readonly");
    var attemptsStore = transaction.objectStore("attempts");

    var attempts = [];

    // TODO: How interoperable is getAll()?
    var openCursor = attemptsStore.openCursor();
    openCursor.onsuccess = (function(event) {
      var cursor = event.target.result;
      if (cursor) {
        attempts.push(cursor.value);
        cursor.continue();
      }
    }).bind(this);
    openCursor.onerror = function() {
      // TODO: Check that the spec has this.
      reject();
    }

    transaction.oncomplete = function() {
        resolve({
          databaseVersion: this.CURRENT_DATABASE_VERSION,
          attempts: attempts
        });
      // TODO: Reconcile this with openCursor().onsuccess;
    }
    transaction.onerror = reject;
  }).bind(this)); }
};

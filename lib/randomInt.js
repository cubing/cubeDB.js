// The node.js header and footer can be removed if you're only using this in a browser.

// Compatibility shim to work both in browers and node.js
// Based on on https://gist.github.com/rpflorence/1198466
(function (globalObject, name, definition){
  if (typeof module !== "undefined" && module.exports) { // Node.js
    module.exports = (definition.bind(globalObject))(true, require("crypto"));
  } else { // Browser
    // Pass null for getRandomValues so that the main code can calculate the IE fallback even when run on its own.
    globalObject[name] = (definition.bind(globalObject))(false, null);
  }
})(window || this, "randomInt", function (isNode, crypto) {

if (isNode) {
  window = {
    cryptoUint32: {
      "getRandomValues": function(arr) {
        if (! (arr instanceof Uint32Array)) {
          throw new Error("The cryptoUint32.getRandomValues() shim only takes unsigned 32-bit int arrays");
        }
        var bytes = crypto.randomBytes(arr.length * 4);
        var uint32_list = [];
        for (var i = 0; i < arr.length; i++) {
          uint32_list.push(
            (bytes[i*4+0] << 24) +
            (bytes[i*4+1] << 16) +
            (bytes[i*4+2] << 08) +
            (bytes[i*4+3] << 00)
          );
        }
        arr.set(uint32_list);
      }
    }
  }
}

/**************** End of node.js header ****************/








/*
 * randomInt.below(max) returns a random non-negative integer less than max (0 <= output < max).
 * `max` must be at most 2^53.
 */
var randomInt = (function() {
  var MAX_JS_PRECISE_INT = 9007199254740992;
  var allowMathRandomFallback_ = false;
  var random53BitValue_;

  function enableInsecureMathRandomFallback() {
    if (!cryptoObject_) {
      var warningString = "WARNING: randomInt is falling back to Math.random for random number generation."
      console.warn ? console.warn(warningString) : console.log(warningString);
      allowMathRandomFallback_ = true;
    }
  }

  var cryptoObject_;
       if (typeof this.crypto   !== "undefined") { cryptoObject_ = this.crypto;   }
  else if (typeof this.msCrypto !== "undefined") { cryptoObject_ = this.msCrypto; }
  else                                           { cryptoObject_ = null;          }

  var UPPER_HALF_MULTIPLIER = 2097152; // 2^21. We have to use multiplication because bit shifts truncate to 32 bits.
  var LOWER_HALF_DIVIDER = 2048;
  if (cryptoObject_) {
    random53BitValue_ = function() {
      // Construct a random 53-bit value from a 32-bit upper half and a 21-bit lower half.
      var array = new Uint32Array(2);
      cryptoObject_.getRandomValues(array);
      var upper = array[0];
      var lower = array[1];
      return Math.floor(upper * UPPER_HALF_MULTIPLIER) + Math.floor(lower / LOWER_HALF_DIVIDER);
    }
  } else {
    var warningString = "ERROR: randomInt could not find a suitable crypto.getRandomValues() function."
    console.error ? console.error(warningString) : console.log(warningString);
    random53BitValue_ = function() {
      if (allowMathRandomFallback_) {
        var TWO_TO_THE_32 = 4294967296; // We're assuming Math.random() has 32 bits of entropy on all platforms.
        var upper = Math.floor(Math.random() * TWO_TO_THE_32);
        var lower = Math.floor(Math.random() * TWO_TO_THE_32);
        return Math.floor(upper * UPPER_HALF_MULTIPLIER) + Math.floor(lower / LOWER_HALF_DIVIDER);
      } else {
        throw new Error("randomInt cannot get random values.");
      }
    }
  }

  function validateMax_(max) {
    if (typeof max !== "number" || max < 0 || Math.floor(max) !== max) {
      throw new Error("randomInt.below() not called with a positive integer value.");
    }
    if (max > MAX_JS_PRECISE_INT) {
      throw new Error("Called randomInt.below() with max == " + max + ", which is larger than Javascript can handle with integer precision.")
    };
  };

  function below(max) {
    validateMax_(max);

    var val = random53BitValue_();
    var maxUniformSamplingRange = Math.floor(MAX_JS_PRECISE_INT / max) * max;

    // Rejection sampling:
    if (val < maxUniformSamplingRange)
    {
      return val % max;
    }
    else {
      // val % max would produce a biased result. This bias an be very bad if `max` is on the order of MAX_JS_PRECISE_INT. We have to try again, so just call ourselves recursively.
      // For some values of `max` just above 9007199254740992 / 2, this happens about once on average. For other values of `max`, it's less than that (and for small values of `max` it's extremely unlikely).
      return below(max);
    }
  };

  return {
    below: below,
    enableInsecureMathRandomFallback: enableInsecureMathRandomFallback
  };
}.bind(this))();








/****************  Start of node.js footer ****************/
return randomInt;
});
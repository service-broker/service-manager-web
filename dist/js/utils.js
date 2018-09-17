polyfills();

var logger = {
  LogLevel: {
    TRACE: 0,
    INFO: 2,
    WARN: 3,
    ERROR: 4
  },
  level: 0,
  trace: function() {
    if (this.level <= this.LogLevel.TRACE) console.log.apply(console, arguments);
  },
  info: function() {
    if (this.level <= this.LogLevel.INFO) console.info.apply(console, arguments);
  },
  warn: function() {
    if (this.level <= this.LogLevel.WARN) console.warn.apply(console, arguments);
  },
  error: function() {
    if (this.level <= this.LogLevel.ERROR) console.error.apply(console, arguments);
  }
};

function polyfills() {
  if (typeof Object.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
      value: function(target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) throw new TypeError('Cannot convert undefined or null to object');
        var to = Object(target);
        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];
          if (nextSource != null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }

  if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(search, pos) {
      return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
    };
  }

  if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
      value: function(searchElement, fromIndex) {
        if (this == null) throw new TypeError('"this" is null or not defined');
        var o = Object(this);
        var len = o.length >>> 0;
        if (len === 0) return false;
        var n = fromIndex | 0;
        var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
        function sameValueZero(x, y) {
          return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
        }
        while (k < len) {
          if (sameValueZero(o[k], searchElement)) return true;
          k++;
        }
        return false;
      },
      configurable: true,
      writable: true
    });
  }

  if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
      value: function(predicate) {
        if (this == null) throw new TypeError('"this" is null or not defined');
        var o = Object(this);
        var len = o.length >>> 0;
        if (typeof predicate !== 'function') throw new TypeError('predicate must be a function');
        var thisArg = arguments[1];
        var k = 0;
        while (k < len) {
          var kValue = o[k];
          if (predicate.call(thisArg, kValue, k, o)) return kValue;
          k++;
        }
        return undefined;
      },
      configurable: true,
      writable: true
    });
  }

  if (!Array.prototype.groupBy) {
    Object.defineProperty(Array.prototype, 'groupBy', {
      value: function(keySelector, valueReducer) {
        if (!valueReducer) {
          valueReducer = function(a,b) {
            if (!a) a = [];
            a.push(b);
            return a;
          }
        }
        var result = {};
        for (var i=0; i<this.length; i++) {
          var key = keySelector(this[i]);
          if (key != null) result[key] = valueReducer(result[key], this[i]);
        }
        return result;
      },
      configurable: true,
      writable: true
    })
  }

  if (!Promise.prototype.finally) {
    Object.defineProperty(Promise.prototype, 'finally', {
      value: function(callback) {
        var promise = this;
        function chain() {
          return Promise.resolve(callback()).then(function() {return promise});
        }
        return promise.then(chain, chain);
      },
      configurable: true,
      writable: true
    })
  }

  if (!Object.entries) {
    Object.entries = function( obj ){
      var ownProps = Object.keys( obj ),
          i = ownProps.length,
          resArray = new Array(i); // preallocate the Array
      while (i--)
        resArray[i] = [ownProps[i], obj[ownProps[i]]];

      return resArray;
    };
  }

  if (!Array.prototype.flat) {
    Object.defineProperty(Array.prototype, "flat", {
      value: function() {
        return Array.prototype.concat.apply([], this);
      },
      configurable: true,
      writable: true
    })
  }
}


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

function request(method, params) {
  return sb.request({name: "service-manager"}, {header: Object.assign({method: method}, params)});
}

function objectToArray(obj, map) {
  var arr = [];
  if (typeof map == "function") for (var prop in obj) arr.push(map(obj[prop], prop));
  else for (var prop in obj) arr.push(obj[prop]);
  return arr;
}

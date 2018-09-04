
function ServiceBroker(url, logger) {
  var pending = {};
  var pendingIdGen = 0;
  var ws = new WebSocket(url);
  var ready = new Promise(function(fulfill, reject) {
    ws.onerror = reject;
    ws.onopen = function() {
      ws.onerror = logger.error;
      fulfill();
    };
  });

  ws.onclose = function() {
    logger.error("Lost connection to service broker");
  };

  ws.onmessage = function(e) {
    var msg = messageFromString(e.data);
    logger.trace('<', msg.header);
    if (msg.header.type == "ServiceResponse") onServiceResponse(msg);
    else logger.error("Unhandled", msg.header);
  };

  function messageFromString(text) {
    var index = text.indexOf('\n');
    if (index == -1) return {header: JSON.parse(text)};
    else return {header: JSON.parse(text.substr(0,index)), payload: text.substr(index+1)};
  }

  function onServiceResponse(msg) {
    if (pending[msg.header.id]) {
      if (msg.header.error) pending[msg.header.id].reject(new Error(msg.header.error));
      else pending[msg.header.id].fulfill(msg);
      delete pending[msg.header.id];
    }
    else logger.error("Response received but no pending request", msg.header);
  }

  function request(service, req) {
    var id = ++pendingIdGen;
    var promise = new Promise(function(fulfill, reject) {
      pending[id] = {fulfill: fulfill, reject: reject};
    })
    var header = {
      id: id,
      type: "ServiceRequest",
      service: service
    };
    send(Object.assign({}, req.header, header), req.payload);
    return promise;
  }

  function send(header, payload) {
    logger.trace(">", header);
    ws.send(JSON.stringify(header) + (payload ? "\n"+payload : ""));
  }

  return {
    ready: ready,
    request: request,
  }
}

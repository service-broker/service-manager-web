
function ServiceBroker(url, logger) {
  var pending = {};
  var pendingIdGen = 0;
  var handlers = {};
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
    else if (msg.header.type == "ServiceRequest") onServiceRequest(msg);
    else if (msg.header.type == "SbStatusResponse") onServiceResponse(msg);
    else if (msg.header.error) onServiceResponse(msg);
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

  function onServiceRequest(msg) {
    if (handlers[msg.header.service.name]) {
      Promise.resolve(handlers[msg.header.service.name](msg))
        .then(function(res) {
          if (!res) res = {};
          if (msg.header.id) {
            var header = {
              to: msg.header.from,
              id: msg.header.id,
              type: "ServiceResponse"
            };
            send(Object.assign({}, res.header, header), res.payload);
          }
        })
        .catch(function(err) {
          if (msg.header.id) {
            send({
              to: msg.header.from,
              id: msg.header.id,
              type: "ServiceResponse",
              error: err.message
            })
          }
          else logger.error(err.message, msg.header);
        })
    }
    else logger.error("No handler for service " + msg.header.service.name);
  }

  function request(service, req) {
    return requestTo(null, service, req);
  }

  function requestTo(endpointId, service, req) {
    var id = ++pendingIdGen;
    var promise = new Promise(function(fulfill, reject) {
      pending[id] = {fulfill: fulfill, reject: reject};
    })
    var header = {
      id: id,
      type: "ServiceRequest",
      service: service
    };
    if (endpointId) header.to = endpointId;
    send(Object.assign({}, req.header, header), req.payload);
    return promise;
  }

  function send(header, payload) {
    return ready.then(function() {
      logger.trace(">", header);
      ws.send(JSON.stringify(header) + (payload ? "\n"+payload : ""));
    })
  }

  function setHandler(serviceName, handler) {
    if (handlers[serviceName]) throw new Error("Handler already exists");
    handlers[serviceName] = handler;
  }

  function getStatus() {
    var id = ++pendingIdGen;
    var promise = new Promise(function(fulfill, reject) {
      pending[id] = {fulfill: fulfill, reject: reject};
    })
    send({id: id, type: "SbStatusRequest"});
    return promise;
  }

  return {
    request: request,
    requestTo: requestTo,
    setHandler: setHandler,
    getStatus: getStatus,
  }
}

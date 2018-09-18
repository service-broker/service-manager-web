var sb;
state = {
  page: "Login",
  error: null,
  progress: 0,
  serviceList: {},
  commandOutput: null,
  serviceOutput: null,
  serviceTester: null,
  topicHistory: null,
  serverTimeOffset: 0,
};

loadComponents();


function request(method, args, callback) {
  state.error = null;
  state.commandOutput = null;
  state.progress++;
  return sb.request({name: "service-manager"}, {header: {method: method, args: args}})
    .then(callback)
    .catch(function(err) {state.error = err})
    .finally(function() {state.progress--})
}

function loadComponents() {
  $("<div>").load("components.html", function() {
    $(this).children().each(function() {
      var className = $(this).data("class");
      if (!className || !window[className]) throw new Error("Missing class " + className);
      dataBinder.views[className] = {template: this, controller: window[className]};
    })
  })
}

function loadServiceList() {
  state.progress++;
  sb.getStatus()
    .then(function(res) {
      var result = JSON.parse(res.payload);
      result.providerRegistry.sort(function(a, b) {return a.service.localeCompare(b.service)});
      state.serviceList.services = result.providerRegistry
        .filter(function(entry) {return !entry.service.startsWith("#")})
        .map(function(entry) {
          return {
            serviceName: entry.service,
            providers: entry.providers
          }
        })
      state.serviceList.topics = result.providerRegistry
        .filter(function(entry) {return entry.service.startsWith("#")})
        .map(function(entry) {
          return {
            topicName: entry.service.slice(1),
            subscribers: entry.providers
          }
        })
    })
    .catch(function(err) {state.error = err})
    .finally(function() {state.progress--})
}

function login(params) {
  sb = new ServiceBroker(params.serviceBrokerUrl, logger);
  request("clientLogin", {password: params.password}, onLogin);
  sb.setHandler("service-manager-client", onServerRequest);
}

function onLogin(res) {
  state.serverTimeOffset = res.header.serverTime - Date.now();
  Object.assign(state, JSON.parse(res.payload));
  updateEnums();
  state.page = "ServiceList";
}

function updateEnums() {
  state.siteNames = Object.entries(state.sites)
    .filter(function(entry) {return entry[1]})
    .map(function(entry) {return entry[0]})
    .sort()
  state.siteNames.forEach(function(siteName) {
    var site = state.sites[siteName];
    site.serviceNames = Object.entries(site.services)
      .filter(function(entry) {return entry[1]})
      .map(function(entry) {return entry[0]})
      .sort()
  })
  state.topicNames = Object.entries(state.topics)
    .filter(function(entry) {return entry[1]})
    .map(function(entry) {return entry[0]})
    .sort()
}

function onServerRequest(req) {
  if (req.header.method == "onStateUpdate") onStateUpdate(JSON.parse(req.payload));
  else if (req.header.method == "onTopicMessage") onTopicMessage(req.payload);
  else if (req.header.method == "ping");
  else logger.error("Unknown method", req.header);
}

function onStateUpdate(patches) {
  for (var i=0; i<patches.length; i++) {
    //instead of removing properties, set to null
    //this is because the dataBinder makes properties non-configurable
    //and keep them around for change detection
    if (patches[i].op == "remove") patches[i].op = "replace";
  }
  jsonpatch.applyPatch(state, patches);
  updateEnums();
}

function onTopicMessage(payload) {
  state.topicHistory.push(payload);
}




function addSite(siteInfo) {
  request("addSite", siteInfo, function(res) {
    state.page = "SiteList";
  })
}

function removeSite() {
  request("removeSite", {siteName: state.siteName}, function() {
    state.page = "SiteList";
  })
}

function deployService(serviceInfo) {
  request("deployService", Object.assign({siteName: state.siteName}, serviceInfo), function(res) {
    state.commandOutput = JSON.parse(res.payload);
    state.page = "SiteDetails";
  })
}

function undeployService() {
  request("undeployService", {siteName: state.siteName, serviceName: state.serviceName}, function() {
    state.page = "SiteDetails";
  })
}

function startService() {
  request("startService", {siteName: state.siteName, serviceName: state.serviceName}, function() {
  })
}

function stopService() {
  request("stopService", {siteName: state.siteName, serviceName: state.serviceName}, function() {
  })
}

function killService() {
  request("killService", {siteName: state.siteName, serviceName: state.serviceName}, function() {
  })
}

function changeServiceStatus() {
  var newStatus = prompt("Change service status to");
  if (newStatus != null) {
    request("setServiceStatus", {
      siteName: state.siteName,
      serviceName: state.serviceName,
      newStatus: newStatus
    })
  }
}

function updateService() {
  request("updateService", {siteName: state.siteName, serviceName: state.serviceName}, function(res) {
    state.commandOutput = JSON.parse(res.payload);
  })
}

function editServiceConf() {
  state.page = "EditServiceConf";
  request("getServiceConf", {siteName: state.siteName, serviceName: state.serviceName}, function(res) {
    state.serviceConf = Object.entries(res.header.serviceConf);
  })
}

function updateServiceConf(serviceConf) {
  request("updateServiceConf", {
    siteName: state.siteName,
    serviceName: state.serviceName,
    serviceConf: serviceConf.groupBy(function(e) {return e[0]}, function(_, e) {return e[1]})
  },
  function(res) {
    state.page = "ServiceDetails";
  })
}

function viewServiceLogs() {
  request("viewServiceLogs", {
    siteName: state.siteName,
    serviceName: state.serviceName,
    lines: 50
  },
  function(res) {
    state.serviceOutput = JSON.parse(res.payload);
  })
}

function openServiceTester(params) {
  state.serviceTester = {
    serviceName: params.serviceName,
    endpointId: params.endpointId
  };
  state.page = 'ServiceTester';
}

function serviceTest(params) {
  state.serviceTester.response = null;
  state.error = null;
  state.progress++;
  sb.requestTo(params.endpointId, params.service, params.message)
    .then(function(res) {state.serviceTester.response = res})
    .catch(function(err) {state.error = err})
    .finally(function() {state.progress--})
}

function addTopic(topicInfo) {
  request("addTopic", topicInfo, function(res) {
    state.page = "TopicSubscriptions";
  })
}

function removeTopic(topicName) {
  request("removeTopic", {topicName: topicName});
}

function subscribeTopic(enable) {
  if (enable) {
    state.topicHistory = [];
    request("subscribeTopic", {topicName: state.topicName}, function(res) {
      state.topicHistory = JSON.parse(res.payload);
    })
  }
  else if (state.topicHistory) {
    request("unsubscribeTopic", null, function() {
      state.topicHistory = null;
    })
  }
}

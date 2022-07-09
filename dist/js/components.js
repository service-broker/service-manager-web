
function Breadcrumb() {
  var parentOf = {
    Login: "ServiceList",
    ServiceListDetails: "ServiceList",
    SiteList: "ServiceList",
    SiteDetails: "SiteList",
    AddSite: "SiteList",
    ServiceDetails: "SiteDetails",
    DeployService: "SiteDetails",
    EditServiceConf: "ServiceDetails",
    ServiceTester: "ServiceList",
    TopicSubscriptions: "ServiceList",
    AddTopic: "TopicSubscriptions",
    ViewTopic: "TopicSubscriptions",
  };
  this.show = function(elem, targetPage, currentPage) {
    var tmp = currentPage;
    while (tmp && tmp != targetPage) tmp = parentOf[tmp];
    $(elem).toggle(tmp == targetPage);
    $(elem).toggleClass('active', currentPage == targetPage);
  };
}


function Login(viewRoot) {
  this.submit = function(form) {
    try {
      $(viewRoot).triggerHandler('submit', {
        serviceBrokerUrl: form.elements.serviceBrokerUrl.value.trim(),
        password: form.elements.password.value.trim()
      })
    }
    catch (err) {
      $(viewRoot).triggerHandler('error', err);
    }
  }
}


function ServiceList() {
}


function ServiceListDetails() {
}


function SiteList() {
}


function SiteDetails() {
}


function ServiceDetails() {
  this.printDuration = function(duration) {
    var millis = Math.max(duration, 0);
    var days = Math.floor(millis / 86400000);
    var hours = Math.floor(millis % 86400000 / 3600000);
    var minutes = Math.floor(millis % 3600000 / 60000);
    var seconds = Math.floor(millis % 60000 / 1000);
    if (days) return "over " + days + " days ago";
    else if (hours) return hours + " hours " + minutes + " minutes ago";
    else if (minutes) return "over " + minutes + " minutes ago";
    else return seconds + " seconds ago";
  }
}


function AddSite(viewRoot) {
  this.submit = function(form) {
    try {
      $(viewRoot).triggerHandler('submit', {
        siteName: form.elements.siteName.value.trim(),
        hostName: form.elements.hostName.value.trim(),
        deployFolder: form.elements.deployFolder.value.trim(),
        serviceBrokerUrl: form.elements.serviceBrokerUrl.value.trim(),
      })
    }
    catch (err) {
      $(viewRoot).triggerHandler('error', err);
    }
  };
  this.cancel = function() {
    $(viewRoot).triggerHandler('cancel');
  };
}


function DeployService(viewRoot) {
  this.submit = function(form) {
    try {
      $(viewRoot).triggerHandler('submit', {
        serviceName: form.elements.serviceName.value.trim(),
        repoUrl: form.elements.repoUrl.value.trim(),
        repoTag: form.elements.repoTag.value.trim() || undefined,
      })
    }
    catch (err) {
      $(viewRoot).triggerHandler('error', err);
    }
  };
  this.cancel = function() {
    $(viewRoot).triggerHandler('cancel');
  };
}


function EditServiceConf(viewRoot) {
  this.submit = function(form) {
    try {
      var isValid = this.serviceConf.every(function(entry) {return entry[0] && entry[1]});
      if (!isValid) throw new Error("Some fields are blank, please correct and try again.");
      $(viewRoot).triggerHandler('submit', this.serviceConf);
    }
    catch (err) {
      $(viewRoot).triggerHandler('error', err);
    }
  }
  this.cancel = function() {
    $(viewRoot).triggerHandler('cancel');
  }
}


function ServiceTester(viewRoot) {
  this.submit = function(form) {
    try {
      $(viewRoot).triggerHandler('submit', {
        endpointId: form.elements.endpointId.value.trim(),
        service: {
          name: form.elements.serviceName.value.trim(),
          capabilities: JSON.parse(form.elements.capabilities.value.trim() || "null")
        },
        message: {
          header: JSON.parse(form.elements.header.value.trim() || "null"),
          payload: form.elements.payload.value.trim() || null
        }
      })
    }
    catch (err) {
      $(viewRoot).triggerHandler('error', err);
    }
  }
  this.cancel = function() {
    $(viewRoot).triggerHandler('cancel');
  }
}


function TopicSubscriptions() {
}


function AddTopic(viewRoot) {
  this.submit = function(form) {
    try {
      $(viewRoot).triggerHandler('submit', {
        topicName: form.elements.topicName.value.trim(),
        historySize: Number(form.elements.historySize.value),
      })
    }
    catch (err) {
      $(viewRoot).triggerHandler('error', err);
    }
  }
  this.cancel = function() {
    $(viewRoot).triggerHandler('cancel');
  }
}


function ViewTopic() {
}


function ModalSpinner() {
}


function CommandOutput() {
  this.theme = null;
}

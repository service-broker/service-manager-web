
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
    Tunnels: "SiteDetails",
    AddTunnel: "Tunnels",
  };
  this.show = function(elem, targetPage, currentPage) {
    var tmp = currentPage;
    while (tmp && tmp != targetPage) tmp = parentOf[tmp];
    $(elem).toggle(tmp == targetPage);
    $(elem).toggleClass('active', currentPage == targetPage);
  };
}


function Login(viewRoot) {
  this.history = {
    items: JSON.parse(localStorage.getItem("login.history") || "[]"),
    visible: false,
    add: function(url) {
      if (!this.items.some(function(item) {return item.url == url})) {
        this.items.push({url: url})
        this.save()
      }
    },
    select: function(index) {
      var form = $(viewRoot).find("form").get(0)
      form.serviceBrokerUrl.value = this.items[index].url
      setTimeout(function() {
        $(form.password).focus()
      }, 100)
      this.visible = false
    },
    save: function() {
      localStorage.setItem("login.history", JSON.stringify(this.items))
    }
  }
  this.submit = function(form) {
    try {
      var url = form.elements.serviceBrokerUrl.value.trim()
      $(viewRoot).triggerHandler('submit', {
        serviceBrokerUrl: url,
        password: form.elements.password.value.trim()
      })
      this.history.add(url)
    }
    catch (err) {
      $(viewRoot).triggerHandler('error', err);
    }
  }
}


function LoginHistoryDialog() {
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


function Tunnels() {
}


function AddTunnel(viewRoot) {
  this.submit = function(form) {
    try {
      const fromPort = Number(form.fromPort.value)
      $(viewRoot).triggerHandler('submit', {
        fromPort: form.tunnelType.value == "reverse" ? -fromPort : fromPort,
        toHost: form.toHost.value,
        toPort: Number(form.toPort.value)
      })
    }
    catch (err) {
      $(viewRoot).triggerHandler('error', err)
    }
  }
  this.cancel = function() {
    $(viewRoot).triggerHandler('cancel')
  }
}

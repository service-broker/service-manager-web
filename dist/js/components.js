
function SiteList() {
  var self = this;
  this.sites = [];

  sb.ready.then(function() {
    request("listSites").then(function(res) {
      self.sites = objectToArray(res.header.sites, function(site, name) {
        site.name = name;
        site.services = objectToArray(site.services, function(service, name) {
          service.name = name;
          return service;
        })
        return site;
      })
    })
  });

  this.addSite = function() {

  };
}


function SiteDetails() {
  this.deployService = function() {

  };

  this.undeployService = function() {

  };
}

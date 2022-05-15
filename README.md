# service-manager-web
Provides a web interface for deploying services to host sites, configuring, and managing their lifecycles, and testing them by sending mock requests.


### How it works
This webapp opens a websocket connection to the specified service broker where a service manager is active.  It then invokes the service-manager API to perform all operations and report the results to the browser.

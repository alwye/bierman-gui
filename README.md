# BIER Topology Manager
This is a web application built on top of [Angular](http://github.com/angular/angular.js) + [NeXt UI](http://github.com/CiscoDevNet/next-ui).

# Description


# Configuration
## REST Proxy Server
We use proxy to let 


## Controller Settings
Open a file /app/bierman.controller.js and find an object '$scope.appConfig'.

Modify its properties 'ctrlHost', 'ctrlPort', 'ctrlUsername' and 'ctrlPassword' so that they are your actual data.
- **ctrlHost** points to controller's IP address
- **ctrlPort** points to controller's port
- **ctrlUsername** and **ctrlPassword** are credentials to authorize on the server

# Credits
* Alexei Zverev (alzverev@cisco.com) - frontend developer
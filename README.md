# BIER Topology Manager
This is a web application built on top of [Angular](http://github.com/angular/angular.js) + [NeXt UI](http://github.com/CiscoDevNet/next-ui).

# Configuration
## REST Proxy Server
We use [ODL REST Proxy](https://github.com/zverevalexei/odl-rest-proxy) to avoid CORS restrictions. Proxy enhances possibilities of REST API, since we can make even 'unsafe' requests.

Open the file /web/app/bierman.controller.js and find the object '$scope.appConfig'.

Modify its properties 'proxyHost' and 'proxyPort' so that they are your actual data. You may want to leave the data as is if you don't locate proxy on a remote computer or you didn't change the port number.
- **proxyHost** points to proxy's IP address (or a host name)
- **proxyPort** points to proxy's port


## Controller Settings
Open a file rest_proxy.js and find an object 'appConfig'.

Modify its properties 'ctrlHost', 'ctrlPort', 'ctrlUsername' and 'ctrlPassword' so that they are your actual data.
- **ctrlHost** points to controller's IP address (or a host name)
- **ctrlPort** points to controller's port
- **ctrlUsername** and **ctrlPassword** are credentials to authorize on the server

## Running GUI (easy as pie)
0. Have NodeJS installed on your computer
1.  Go to the folder run the command in terminal:

  ```
  node rest_proxy.js
  ```
2. Point your browser to /web/app/index.html and enjoy

# Credits
* Alexei Zverev (alzverev@cisco.com) - frontend developer

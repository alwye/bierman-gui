// This code uses ODL Rest Proxy: http://github.com/zverevalexei/odl-rest-proxy

const fs = require('fs');
const http = require('http');
var connect = require('connect');
var serveStatic = require('serve-static');

// app configuration
var appConfig = {
	// Controller settings
	//'ctrlHost': '10.124.19.145', // Gaofeng
	'ctrlHost': '10.195.70.198', // Sergey
	'ctrlPort': '8181', // 8181 by default
	'ctrlUsername': 'admin',
	'ctrlPassword': 'admin',
	// Proxy settings
	'proxyPort': 5555, // proxy's port
	'webServerPort': 8080 // BIERMAN's port
};

var reqCounter = 0;

// create a server
var proxy = http.createServer();
if(proxy)
	console.log('BIERMAN connected to controller: ' + appConfig.ctrlHost);
else
	console.error('BIERMAN could not connect to controller: ' + appConfig.ctrlHost);

// Server API
proxy.on('request',function(userReq,userRes){
	var reqId = reqCounter;
	function fReqId(){
		return '[#' + reqId + '] ';
	}
	var resBody = '';
	var reqBody = '';

	console.log(fReqId() + 'Received ' + userReq.method + ' request from client.');
	userRes.writeHead(200,
		{	'Access-Control-Allow-Origin': userReq.headers.origin,
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Credentials': 'true',
			'Access-Control-Allow-Headers': 'Authorization, Content-Type',
			'Access-Control-Max-Age': '86400'
		});

	userReq.on('data', function(chunk){
		reqBody += chunk;
	});

	userReq.on('end', function(){
		// request to controller
		var proxyReq =  http.request({
			'host': appConfig.ctrlHost,
			'port': appConfig.ctrlPort,
			'auth': appConfig.ctrlUsername + ':' + appConfig.ctrlPassword,
			'method': userReq.method,
			'path': userReq.url,
			'headers': {
				'content-type': 'application/json',
				'authorization': 'Basic YWRtaW46YWRtaW4=',
				'cache-control': 'no-cache'
			}
		});

		proxyReq.write(reqBody);

		// response
		proxyReq.on('response', function(proxyRes){
			proxyRes.setEncoding('utf8');
			proxyRes.on('data', function(chunk){
				resBody += chunk;
			});
		});
		// error
		proxyReq.on('error', function(e){
			var errMsg = 'Problem with request: ' + e.message;
			console.error(fReqId() + errMsg);
			// response for a user
			userRes.write(JSON.stringify({
				'status': 'error',
				'data': errMsg
			}));
			userRes.end();
		});
		proxyReq.on('close', function(){
			if(!userRes.finished){
				console.log(fReqId() + 'Read data from server.');
				try {
					userRes.write(JSON.stringify({
						'status': 'ok',
						'data': JSON.parse(resBody)
					}));
				}
				catch(e){
					try{
						userRes.write(JSON.stringify({
							'status': 'ok',
							'data': '{}'
						}));
					}
					catch(e){}
				}
				userRes.end();
				console.log(fReqId() + 'Connection closed');
			}
		});
		proxyReq.end();
	});

	reqCounter++;
});

// start listening to income connections
proxy.listen(appConfig.proxyPort);
connect().use(serveStatic(__dirname + '/web')).listen(appConfig.webServerPort);
/*
Copyright (c) 2016 by Cisco Systems, Inc.
All rights reserved.

ODL REST Proxy
Simple HTTP-proxy for ODL apps (v0.1)

Author: Alexei Zverev (alzverev@cisco.com)
Check out http://github.com/zverevalexei/odl-rest-proxy

v0.1 - 01/12/2016 - Basic functionality
 */

const http = require('http');

// app configuration
var appConfig = {
	// Controller settings
	'ctrlHost': '10.124.19.145',
	'ctrlPort': '8181', // 8181 by default
	'ctrlUsername': 'admin',
	'ctrlPassword': 'admin',
	// Proxy settings
	'proxyPort': 5555
};

var reqCounter = 0;

// create a server
var proxy = http.createServer();
if(proxy)
	console.log('REST Proxy started');
else
	console.error('REST Proxy has not started');

// Server API
proxy.on('request',function(userReq,userRes){
	var reqId = reqCounter;
	function fReqId(){
		return '[#' + reqId + '] ';
	}
	var resBody = '';
	console.log(fReqId() + 'Received ' + userReq.method + ' request from client.');

	userRes.writeHead(200,
		{	'Access-Control-Allow-Origin': userReq.headers.origin,
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Credentials': 'true',
			'Access-Control-Allow-Headers': 'Authorization, Content-Type',
			'Access-Control-Max-Age': '86400'
		});


	// request to controller
	var proxyReq =  http.request({
		'host': appConfig.ctrlHost,
		'port': appConfig.ctrlPort,
		'auth': appConfig.ctrlUsername + ':' + appConfig.ctrlPassword,
		'method': userReq.method,
		'path': userReq.url,
		'headers': {
			'accept': 'application/json',
			'user-agent': 'ODL REST Proxy v0.1'
		}
	});
	proxyReq.setTimeout(1);
	// response
	proxyReq.on('response', function(proxyRes){
		proxyRes.setEncoding('utf8');
		proxyRes.on('data', function(data){
			resBody += data;
		});
	});
	// error
	proxyReq.on('error', function(e){
		var errMsg = 'Problem with request: ' + e.message;
		console.error(fReqId() + errMsg);
		// response for a user
		userRes.write(JSON.stringify({
			'status': 'error',
			'data': JSON.parse(errMsg)
		}));
		userRes.end();
	});
	proxyReq.on('close', function(){
		userRes.write(JSON.stringify({
			'status': 'ok',
			'data': JSON.parse(resBody)
		}));
		userRes.end();
		console.log(fReqId() + 'Connection closed');
	});
	proxyReq.end();

	reqCounter++;
});

// start listening to income connections
proxy.listen(appConfig.proxyPort);
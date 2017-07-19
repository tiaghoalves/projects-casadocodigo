var redis = require('redis');
var redisStore = require('connect-redis');
var express = require('express');
var socketio = require('socket.io');

exports.getClient = function(){
	return redis.createClient();
}

exports.getExpressStore = function(){
	return redisStore(express);
}

exports.getSocketStore = function(){
	return socketio.RedisStore;
}

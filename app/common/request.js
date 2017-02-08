'use strict';

/*-------------导入第三方组件------------------*/
//对参数进行拼接
var queryString = require('query-string');
//对象的clone、替换、继承
var _ = require('lodash');
import Mock from 'mockjs';


var request = {};
import config from './config';

request.get= function(url, params){
    if(params){
        url += '?' +queryString.stringify(params)
    }
    return fetch(url)
        .then((response) => response.json())
        .then((responseJson) =>Mock.mock(responseJson))
};

request.post= function(url, body){
    var options = _.extend(config.header, {
        body: JSON.stringify(body)
    });
    return fetch(url, options)
        .then((response) => response.json())
        .then((responseJson) =>Mock.mock(responseJson))
};

module.exports = request;

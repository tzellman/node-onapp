var http = require('http'),
    url = require('url'),
    request = require('request'),
    onapp = require('../onapp'),
    utils = require('./utils');

var serverUrl = '';

exports.createClient = function (options) {
  return new Client(options);
}

var Client = exports.Client = function (options) {
  ['username','apiKey','serverUrl'].forEach(function (required){
    if (!options[required]) throw new Error('options.' + required + ' ia a required argument.');
  });

  this.config = options;
  this.authorized = false;
}

Client.prototype.createVirtualMachine = function (options, callback) {
  var templateId, self = this;

  ['memory','cpus','hostname','label','primary_disk_size','swap_disk_size','template_id'].forEach(function (required){
    if(!options[required]) throw new Error('options ' + required + ' is a required argument.');
  });

  options.required_ip_address_assignment = typeof options.required_ip_address_assignment !== 'undefined' ? options.required_ip_address_assignment : '1';
  options.required_virtual_machine_build = typeof options.required_virtual_machine_build !== 'undefined' ? options.required_virtual_machine_build : '1';

  var container  = new Object();
  container.virtual_machine = options;

  var createOptions = {
    method: 'POST',
    uri: 'virtual_machines.json',
    client: this,
    body: container
  };

  utils.modem(createOptions, callback, function(body, response) {
    var vm = new (onapp.VirtualMachine)(self, JSON.parse(body).virtual_machine);
    callback(null, vm);
  }); 
};

Client.prototype.getVersion = function (callback) {
  utils.modem(['version.json'], this, callback, function (body) {
    callback(null, JSON.parse(body).version);
  });
};

Client.prototype.getTemplateGroups = function (callback) {
  utils.modem(['settings/image_template_groups.json'], this, callback, function (body) {
    callback(null, JSON.parse(body));
  });
};

Client.prototype.getSystemTemplates = function (callback) {
  utils.modem(['templates.json'], this, callback, function (body) {
    var results = [], data = JSON.parse(body);
  
    data.forEach(function (info) {
      results.push(new (onapp.Template)(info));
    });
    
    callback(null, results);
  });
};

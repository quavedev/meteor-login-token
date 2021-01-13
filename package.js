Package.describe({
  name: 'quave:login-token',
  version: '1.0.3',
  summary: 'Log the user in if they have the correct single-use token ' +
    'in the URL',
  git: 'https://github.com/quavedev/meteor-login-token',
});

Npm.depends({
  'hat': '0.0.3',
});

Package.onUse(function(api) {
  api.versionsFrom('1.2');

  api.use([
    'tracker',
    'check',
    'accounts-base',
    'ecmascript',
    'mongo',
    'underscore',
    'http',
    'raix:eventemitter@1.0.0',
  ], ['client', 'server']);


  api.addFiles('namespace.js', ['client', 'server']);
  api.addFiles('client.js', 'client');
  api.addFiles('server.js', 'server');

  api.export('LoginToken', ['client', 'server']);
});

Package.onTest(function(api) {
  api.use('sanjo:jasmine');

  api.use('http', 'client');

  api.use([
    'accounts-base',
    'quave:login-token',
    'ecmascript',
  ], ['client', 'server']);

  api.addFiles('test.js');
});

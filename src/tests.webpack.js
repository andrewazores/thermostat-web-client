import 'angular';
import 'angular-mocks/angular-mocks';
import 'babel-polyfill';

const context = require.context('./app', true, /\.js$/);

context.keys().forEach(context);

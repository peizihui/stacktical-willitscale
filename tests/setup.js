var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

chai.use(chaiAsPromised);
chai.use(sinonChai);
global.expect = chai.expect;
global.sinon = sinon;

/* eslint-disable */
global.__base = __dirname + '/../src/';
/* eslint-enable */

global.app = require(__base + 'stacktical.js');

/**
 * Copyright 2012-2017 Red Hat, Inc.
 *
 * Thermostat is distributed under the GNU General Public License,
 * version 2 or any later version (with a special exception described
 * below, commonly known as the "Classpath Exception").
 *
 * A copy of GNU General Public License (GPL) is included in this
 * distribution, in the file COPYING.
 *
 * Linking Thermostat code with other modules is making a combined work
 * based on Thermostat.  Thus, the terms and conditions of the GPL
 * cover the whole combination.
 *
 * As a special exception, the copyright holders of Thermostat give you
 * permission to link this code with independent modules to produce an
 * executable, regardless of the license terms of these independent
 * modules, and to copy and distribute the resulting executable under
 * terms of your choice, provided that you also meet, for each linked
 * independent module, the terms and conditions of the license of that
 * module.  An independent module is a module which is not derived from
 * or based on Thermostat code.  If you modify Thermostat, you may
 * extend this exception to your version of the software, but you are
 * not obligated to do so.  If you do not wish to do so, delete this
 * exception statement from your version.
 */

import servicesModule from './services.module.js';
import urlJoin from 'url-join';

const CLIENT_REQUEST_TYPE = 2;

class CommandChannelService {
  constructor ($q, webSocketFactory, $translate, commandChannelUrl) {
    'ngInject';
    this._sequence = 1;
    this.q = $q;
    this.socketFactory = webSocketFactory;
    this.translate = $translate;
    this._commandChannelUrl = commandChannelUrl;

    this.setCredentials('bar-client-user', 'client-pwd');

    this._responseMessages = {};
    $translate([
      'services.commandChannel.responseCodes.OK',
      'services.commandChannel.responseCodes.ERROR',
      'services.commandChannel.responseCodes.AUTH_FAIL',
      'services.commandChannel.responseCodes.UNKNOWN'
    ]).then(translations => {
      this._responseMessages.OK = translations['services.commandChannel.responseCodes.OK'];
      this._responseMessages.ERROR = translations['services.commandChannel.responseCodes.ERROR'];
      this._responseMessages.AUTH_FAIL = translations['services.commandChannel.responseCodes.AUTH_FAIL'];
      this._responseMessages.UNKNOWN = translations['services.commandChannel.responseCodes.UNKNOWN'];
      this._responseMessages = Object.freeze(this._responseMessages);
    });
  }

  get responseCodes () {
    let responseCodes = [];
    responseCodes.OK = Object.freeze({ value: 'OK', message: this._responseMessages.OK});
    responseCodes.ERROR = Object.freeze({ value: 'ERROR', message: this._responseMessages.ERROR});
    responseCodes.AUTH_FAIL = Object.freeze({ value: 'AUTH_FAIL', message: this._responseMessages.AUTH_FAIL});
    responseCodes.UNKNOWN = Object.freeze({ value: 'UNKNOWN', message: this._responseMessages.UNKNOWN});
    return Object.freeze(responseCodes);
  }

  setCredentials (username, password) {
    this.username = username;
    this.password = password;
  }

  get commandChannelUrl () {
    if (!angular.isDefined(this.username) || this.username === '') {
      return this._commandChannelUrl;
    }
    let protocolDelimiterIndex = this._commandChannelUrl.indexOf('://');
    let protocol = this._commandChannelUrl.substring(0, protocolDelimiterIndex + 3);
    let url = this._commandChannelUrl.substring(protocol.length);

    let credentials;
    if (angular.isDefined(this.password) && this.password !== '') {
      credentials = this.username + ':' + this.password;
    } else {
      credentials = this.username;
    }

    return protocol + credentials + '@' + url;
  }

  get sequence () {
    let val = this._sequence;
    if (val === Number.MAX_SAFE_INTEGER) {
      this._sequence = 1;
    } else {
      this._sequence++;
    }
    return val;
  }

  sendMessage (connectPath, payload = {}) {
    let defer = this.q.defer();
    let socket = this.socketFactory.createSocket(urlJoin(this.commandChannelUrl, connectPath));
    if (!socket) {
      this.translate('services.commandChannel.WEBSOCKETS_NOT_SUPPORTED').then(s => defer.reject(s));
      return defer.promise;
    }

    socket.addEventListener('open', open => {
      socket.send(JSON.stringify({
        type: CLIENT_REQUEST_TYPE,
        payload: payload
      }));
    });

    let closeFn = close => {
      if (!angular.isDefined(close.reason) || close.reason === '') {
        this.translate('services.commandChannel.NO_RESPONSE_RECEIVED').then(s => defer.reject(s));
      } else {
        defer.reject(close.reason);
      }
    };
    socket.addEventListener('close', closeFn);

    socket.addEventListener('error', err => {
      socket.close();
      defer.reject(err);
    });

    socket.addEventListener('message', message => {
      socket.removeEventListener('close', closeFn);
      socket.close();
      let data = JSON.parse(message.data);
      if (this.responseCodes.hasOwnProperty(data.payload.respType)) {
        data.payload.respType = this.responseCodes[data.payload.respType];
      } else {
        data.payload.respType = this.responseCodes.UNKNOWN;
      }
      defer.resolve(data);
    });
    return defer.promise;
  }
}

angular
  .module(servicesModule)
  .service('commandChannelService', CommandChannelService);

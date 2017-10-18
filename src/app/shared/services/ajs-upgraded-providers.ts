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

import { CommandChannelService } from "./command-channel.service.js";
export const commandChannelServiceProvider = {
  deps: ["$injector"],
  provide: CommandChannelService,
  useClass: CommandChannelService,
};

import { ExtractClassService } from "./extract-class.service.js";
export const extractClassServiceProvider = {
  deps: ["$injector"],
  provide: ExtractClassService,
  useClass: ExtractClassService,
};

import { LocalStorageService } from "./local-storage.service.js";
export const localStorageServiceProvider = {
  deps: ["$injector"],
  provide: LocalStorageService,
  useClass: LocalStorageService,
};

import { MetricToBigIntService } from "./metric-to-big-int.service.js";
export const metricToBigIntServiceProvider = {
  deps: ["$injector"],
  provide: MetricToBigIntService,
  useClass: MetricToBigIntService,
};

import { MultichartService } from "./multichart.service.js";
export const multichartServiceProvider = {
  deps: ["$injector"],
  provide: MultichartService,
  useClass: MultichartService,
};

import { SanitizeService } from "./sanitize.service.js";
export const sanitizeServiceProvider = {
  deps: ["$injector"],
  provide: SanitizeService,
  useClass: SanitizeService,
};

import { ScaleBytesService } from "./scale-bytes.service.js";
export const scaleBytesServiceProvider = {
  deps: ["$injector"],
  provide: ScaleBytesService,
  useClass: ScaleBytesService,
};

import { WebSocketFactory } from "./websocket-factory.service.js";
export const webSocketFactoryProvider = {
  deps: ["$injector"],
  provide: WebSocketFactory,
  useClass: WebSocketFactory,
};

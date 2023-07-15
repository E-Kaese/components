// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/*eslint-env worker*/
import { ServiceManager } from 'ace-linters/build/service-manager';

const manager = new ServiceManager(self);

manager.registerService('javascript', {
  features: {
    completion: false,
    completionResolve: false,
    diagnostics: true,
    format: false,
    hover: false,
    documentHighlight: false,
    signatureHelp: false,
  },
  module: () => import('ace-linters/build/javascript-service'),
  className: 'JavascriptService',
  modes: 'javascript',
});

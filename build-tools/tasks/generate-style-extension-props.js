// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const path = require('path');
const { writeFile, listPublicItems } = require('../utils/files');
const { getHashDigest } = require('loader-utils');
const { existsSync } = require('fs');
// const { camelCase } = require('change-case');

module.exports = function generateStyleExtensionProps() {
  listPublicItems('src').map(componentDir => {
    const outputBasePath = path.join(__dirname, `../../src/${componentDir}/__style-extension-props__`);
    if (existsSync(outputBasePath)) {
      const styleExtensionPropsList = require(`${outputBasePath}/list`);

      const hash = getHashDigest(Buffer.from(JSON.stringify(styleExtensionPropsList)), 'md5', 'base36', 6);

      const getHashedProperty = property => {
        return `--awsui-${property.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}-${hash}`;
      };

      // Write JS file
      const jsFilePath = path.join(outputBasePath, 'index.ts');
      writeFile(
        jsFilePath,
        `
      const styleExtensionProps: Record<string,string> = {
        ${styleExtensionPropsList.map(property => `"${property}": "${getHashedProperty(property)}",`).join('\n')}
      };
      export default styleExtensionProps;
    `
      );

      // Write Sass file
      const sassFilePath = path.join(outputBasePath, 'index.scss');
      writeFile(
        sassFilePath,
        `
    ${styleExtensionPropsList.map(property => `$${property}: ${getHashedProperty(property)};`).join('\n')}
    `
      );
    } else {
      console.log(`Folder does not exist for ${componentDir}`);
    }
    return Promise.resolve();
  });
};

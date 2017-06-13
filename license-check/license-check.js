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

const fs = require('fs');
const glob = require('glob');

const FILE_GLOB = '**/*.js';
const NO_SUCH_YEAR_INDEX = -1;
const YEAR_LINE_REGEX = /\* .+2\d{3}-2\d{3}.+/;

/**
 * Checks if the line provided from the license is the year line, and checks
 * if it does not match the expected format.
 *
 * @param {String} line: The line of the license.
 * @param {int} lineIndex: The index in the file.
 * @param {int} expectedYearLineNumber: The expected line index for the year.
 * @return {bool} True if the 'line' is the year line but is malformed.
 */
function isYearLineAndDoesNotMatch (line, lineIndex, expectedYearLineNumber) {
  return lineIndex === expectedYearLineNumber && !YEAR_LINE_REGEX.test(line);
}

/**
 * Reads the license file and populates a simple object to be returned that is
 * to be used when checking source files for proper licenses. The reading of
 * the license file is synchronous.
 *
 * @param {String} licenseFilePath: Path to the license.
 * @param {int} expectedYearLineNumber: The expected line index for the year.
 * @return {Object} Returns a object with the following fields:
 * 'licenseData': An array of lines (without \n's at the end) from the license.
 * 'yearLineNumber': The line at which the year is found.
 * 'error': A string with the reason of the error, or null if no error occurs.
 * 'success': A boolean whether the license was read properly or not.
 * This object is designed to be passed onto the other license reading functions
 * so they can perform the appropriate source file checks.
 */
function readLicenseFile (licenseFilePath) {
  let licenseData = {
    text: [],
    yearLineNumber: NO_SUCH_YEAR_INDEX,
    error: null,
    success: false
  };

  let data = null;
  try {
    data = fs.readFileSync(licenseFilePath, 'utf8');
  } catch (err) {
    licenseData.error = 'License could not be read from: ' + licenseFilePath;
    return licenseData;
  }

  licenseData.text = data.split(/\r?\n/).map((line) => (' * ' + line).replace(/\s*$/, ''));

  for (let lineIndex = 0; lineIndex < licenseData.text.length; lineIndex++) {
    if (YEAR_LINE_REGEX.test(licenseData.text[lineIndex])) {
      // We shift a line to the front of the array later, so correct the off-by-one.
      licenseData.yearLineNumber = lineIndex + 1;
      break;
    }
  }

  if (licenseData.yearLineNumber === NO_SUCH_YEAR_INDEX) {
    licenseData.error = 'Unable to find year line in license';
    return licenseData;
  }

  if (licenseData.text[licenseData.text.length - 1] === ' *') {
    licenseData.text.pop();
  }
  licenseData.text.unshift('/**');
  licenseData.text.push(' */');

  licenseData.success = true;
  return licenseData;
}

/**
 * Reads the file at the path provided and compares against the license object
 * to see if the license at the top of the file is correct. Otherwise if not,
 * then the errorHandlerCallback is invoked. Checking the file is a synchronous
 * operation.
 *
 * @param {String} licenseFilePath: Path to the license.
 * @param {Object} licenseData: The object obtained from invoking the
 * readLicenseFile() function.
 * @return {Object} Returns an object with the following fields:
 * 'success': A boolean that is never null; if it is false then 'error' is set
 * to a string which contains the error message.
 * 'error': The reason for any error, or null if success is true. The string
 * returned here is a human-readable string and can be directly printed.
 */
function checkFileForLicense (fullPath, licenseData) {
  let lines = fs.readFileSync(fullPath, 'utf-8').split('\n');
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    let line = lines[lineIndex];
    if (lineIndex < licenseData.text.length) {
      if (isYearLineAndDoesNotMatch(line, lineIndex, licenseData.yearLineNumber)) {
        return {
          success: false,
          error: 'Error checking license at ' + fullPath + '\n' +
                 'Line ' + lineIndex + ':\n' +
                 '    Expected ' + line + ' to match regex ' + YEAR_LINE_REGEX
        };
      } else if (line !== licenseData.text[lineIndex]) {
        return {
          success: false,
          error: 'Error checking license at ' + fullPath + '\n' +
                 'Line ' + lineIndex + ':\n' +
                 '    Expected: ' + licenseData.text[lineIndex] + '\n' +
                 '         Got: ' + line
        };
      }
    }
  }

  return { success: true, error: null };
}

/**
 * Walks the directory for the path provided and checks that all the files
 * that match the glob constant. Walking directories and reading the license
 * for each file is synchronous.
 *
 * @param {String} licenseFilePath: Path to the license, should end with a
 * forward slash.
 * @param {Object} licenseData: The object obtained from invoking the
 * readLicenseFile() function.
 * @return {Object} Returns an object with the following fields:
 * 'improperLicensePaths': An array of all the files that had license issues.
 * This will always be an array (even on error).
 * 'error': A string of the latest error message (so if 5 failed, then the last
 * message will be set in this field).
 * 'success': True if all the files are valid when recursively checking for the
 * licenses being correct, or false on failure.
 * To check for errors, you must examine the error field since it is possible
 * for a bad file path argument to cause it to exit early and set the error
 * field with a reason.
 */
function walkDirectoryAndCheckLicenses (directoryRootPath, licenseData) {
  let fileGlob = directoryRootPath + FILE_GLOB;
  let files = glob.sync(fileGlob);
  let returnResult = {
    improperLicensePaths: [],
    error: null,
    success: true
  };

  if (files === null) {
    returnResult.error = 'Error when traversing for source files to analyze: ' + directoryRootPath;
    returnResult.success = false;
    return returnResult;
  }

  files.forEach((filePath) => {
    let checkResult = checkFileForLicense(filePath, licenseData);
    if (!checkResult.success) {
      returnResult.improperLicensePaths.push(filePath);
      returnResult.error = checkResult.error;
      returnResult.success = false;
    }
  });

  return returnResult;
}


exports.readLicenseFile = readLicenseFile;
exports.checkFileForLicense = checkFileForLicense;
exports.walkDirectoryAndCheckLicenses = walkDirectoryAndCheckLicenses;

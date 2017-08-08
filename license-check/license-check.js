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

const RECURSIVE_FILE_GLOB = '**/*.js';
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
function walkDirectoryAndCheckLicenses (directoryRootPath, licenseData, fileGlob = RECURSIVE_FILE_GLOB) {
  let files = glob.sync(directoryRootPath + fileGlob);
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

/**
 * Reads the file at the path provided to an array. If there are any errors
 * reading the file, null is returned. Note that the lines do not contain
 * any line endings, so [\r]\n's are trimmed away.
 * @param {string} filePath The path of the file
 * @return An array of lines (with no \n's or \r\n's), or null on error.
 */
function readFileLinesToArray (filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  } catch (err) {
    return null;
  }
}

/**
 * A helper function to edit the license range object based on information of
 * the javadoc starting at the provided line offset.
 * @param {number} lineOffset The offset in the fileLineArray parameter.
 * @param {string[]} fileLineArray A list of all the lines
 * @return The updated licenseRange for the javadoc comment range.
 */
function findRangeFromJavadocComments (lineOffset, fileLineArray) {
  let startLine = lineOffset;
  lineOffset++;

  while (lineOffset < fileLineArray.length) {
    if (fileLineArray[lineOffset].startsWith(' */')) {
      break;
    }
    lineOffset++;
  }

  let licenseRange = { start: startLine, end: lineOffset, foundMatch: true };

  // In the corner case where it's a malformed header and runs off the end
  // due to a lack of terminating */ then we want to correct the line ending
  // since it's one ahead due to how it exited the while loop.
  if (lineOffset >= fileLineArray.length) {
    licenseRange.end--;
  }

  return licenseRange;
}

/**
 * A helper function to edit the license range object based on information of
 * the double slash comments starting at the provided line offset.
 * @param {number} lineOffset The offset in the fileLineArray parameter.
 * @param {string[]} fileLineArray A list of all the lines
 * @return The updated licenseRange for the double slash comment range.
 */
function findRangeFromDoubleSlashComments (lineOffset, fileLineArray) {
  let startLine = lineOffset;
  lineOffset++;

  while (lineOffset < fileLineArray.length && fileLineArray[lineOffset].startsWith('//')) {
    lineOffset++;
  }

  return { start: startLine, end: lineOffset - 1, foundMatch: true };
}

/**
 * Checks if the license is at the top of the file, if so then the range of the
 * license lines are provided in the file in the returned object. If any error
 * occurs, the 'error' field is set with a reason (as a string).
 * @param {string[]} fileLineArray A list of all the lines, generated by
 * the readFileLinesToArray() function.
 * @return An object that contains three fields, 'start' and 'end' which are
 * indices of the file lines from where the license starts and ends. The 'end'
 * field will always be inclusive, so lines[end] will never go out of bounds.
 * If there is an issue, 'foundMatch' is set to false (otherwise its true).
 */
function determineLicenseLineRangesAtTopOfFile (fileLineArray) {
  let licenseRange = { start: 0, end: 0, foundMatch: false };
  let lineOffset = 0;

  // Skip empty lines at the top if any.
  while (lineOffset < fileLineArray.length) {
    let currentLine = fileLineArray[lineOffset].replace(/^\s+$/, '');
    if (currentLine !== '') {
      break;
    }
    lineOffset++;
  }

  if (lineOffset === fileLineArray.length) {
    return licenseRange;
  }

  if (fileLineArray[lineOffset].startsWith('/**')) {
    return findRangeFromJavadocComments(lineOffset, fileLineArray);
  }

  if (fileLineArray[lineOffset].startsWith('//')) {
    return findRangeFromDoubleSlashComments(lineOffset, fileLineArray);
  }

  return licenseRange;
}

/**
 * Checks if the range provided for the file is in need of fixing.
 * @param {string[]} fileLines The lines returned from readFileLinesToArray().
 * @param {Object} licenseLineRange The license file comment range determined
 * from determineLicenseLineRangesAtTopOfFile(). This should not have an error
 * set or the function will return true early.
 * @param {Object} licenseData The license data object for the
 * target file from the readLicenseFile() function.
 * @return A 'updateStatus' object which has two fields 'needsUpdate' (bool)
 * and 'updateReason' (string). If no updates are needed, then updateReason is
 * an empty string.
 */
function licenseRangeNeedsUpdating (fileLines, licenseLineRange, licenseData) {
  // We do not want to update empty files.
  if (fileLines.length === 1 && fileLines[0] === '') {
    return { needsUpdate: false, updateReason: '' };
  }

  if (!licenseLineRange.foundMatch ||
      licenseLineRange.start > 0 ||
      !fileLines[licenseLineRange.start].startsWith('/**') ||
      !fileLines[licenseLineRange.end].startsWith(' */')) {
    return { needsUpdate: true, updateReason: 'Missing license header' };
  }

  let licenseDataIndex = 0;
  for (let index = licenseLineRange.start; index <= licenseLineRange.end; index++) {
    if (fileLines[index] !== licenseData.text[licenseDataIndex]) {
      return { needsUpdate: true, updateReason: 'Line ' + (index + 1) + ' is different to the license' };
    }
    licenseDataIndex++;
  }

  return { needsUpdate: false, updateReason: '' };
}

/**
 * Generates the text output from the provided data that should be written into
 * the target file.
 * @param {string[]} fileLines The lines of the file at the file path,
 * which should be what was retrieved from readFileLinesToArray(filePath).
 * @param {Object} licenseLineRange The object with license range
 * information from the determineLicenseLineRangesAtTopOfFile() function.
 * @param {Object} licenseData The license data object for the
 * target file from the readLicenseFile() function.
 * @return The text that can be written to a file.
 */
function generateFileOutputText (fileLines, licenseLineRange, licenseData) {
  let textToWriteAsLicenseHeader = licenseData.text.join('\n') + '\n';
  let fileBodyText = '';

  if (licenseLineRange.foundMatch) {
    // Since we want to replace it, we will want to remove lines 0 -> end, as any
    // extra \n's in there should be removed along with the license. This will
    // also handle the case of just replacing the license at the top.
    // We made sure that there isn't source code or anything important before the
    // starting line, so it is okay to toss that out since it must be empty space
    // instead of something important.
    fileBodyText = fileLines.slice(licenseLineRange.end + 1).join('\n');
  } else {
    // Because we're adding it to the top, we want to put an extra line between
    // the new license and the source code, so we add a '\n' at the beginning.
    fileBodyText = '\n' + fileLines.join('\n');
  }

  return textToWriteAsLicenseHeader + fileBodyText;
}

/**
 * Gets the current year from the arguments provided. If it is not in the args
 * then it will return whatever the current year is.
 * @param {string[]} args The runtime arguments (such as: process.argv.slice(2))
 * of which the year will be extracted from.
 * @return The year as an integer.
 * @throws {string} If the year provided on the command line is not between the
 * year 2000 and 3000. The thrown object is a string, which is the reason.
 */
function getCurrentYearFromArgs (args) {
  if (args.length === 0) {
    return new Date().getFullYear();
  } else if (args.length > 1) {
    throw new Error('Currently only support at most one argument, which should be the year');
  }

  let yearArg = args[0];
  if (/^\d{4}$/.test(yearArg)) {
    let year = parseInt(yearArg);
    if (isNaN(year)) {
      throw new Error('Year argument is not a number: ' + yearArg);
    } else if (year < 2000 || year >= 3000) {
      throw new Error('Year argument is out of range (should be a year in the 2000\'s)');
    }
    return year;
  }

  throw new Error('Expected argument to be a four digit year');
}


exports.readLicenseFile = readLicenseFile;
exports.checkFileForLicense = checkFileForLicense;
exports.walkDirectoryAndCheckLicenses = walkDirectoryAndCheckLicenses;
exports.readFileLinesToArray = readFileLinesToArray;
exports.determineLicenseLineRangesAtTopOfFile = determineLicenseLineRangesAtTopOfFile;
exports.licenseRangeNeedsUpdating = licenseRangeNeedsUpdating;
exports.generateFileOutputText = generateFileOutputText;
exports.getCurrentYearFromArgs = getCurrentYearFromArgs;

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
const licenseChecker = require('./license-check.js');
const SCRIPT_TERMINATION_EXIT_STATUS = 1;
const LICENSE_FILE_PATH = 'LICENSE';
const CURRENT_YEAR = licenseChecker.getCurrentYearFromArgs(process.argv.slice(2));

function exitWithErrorMessage (msg) {
  console.error(msg);
  process.exit(SCRIPT_TERMINATION_EXIT_STATUS);
}

function writeTextToFile (filePath, outputText) {
  try {
    fs.truncateSync(filePath);
    fs.writeFileSync(filePath, outputText);
    return true;
  } catch (ex) {
    return false;
  }
}

function updateLicenseYearIfOutOfDate (licenseText, licenseStartYear, licenseEndYear) {
  if (CURRENT_YEAR.toString() === licenseEndYear.toString()) {
    return;
  }

  console.info('Updating license header to year ' + CURRENT_YEAR);

  let licenseYearStr = licenseStartYear + '-' + licenseEndYear;
  let newYearStr = licenseStartYear + '-' + CURRENT_YEAR.toString();
  licenseText = licenseText.replace(licenseYearStr, newYearStr);

  try {
    writeTextToFile(LICENSE_FILE_PATH, licenseText);
  } catch (err) {
    exitWithErrorMessage('Unable to update project license file to latest year: ' + err);
  }
}

// Make sure the license is at the current year.
(() => {
  let yearRegex = /(2\d{3})-(2\d{3})/;

  // Note that this can throw on linux/mac/windows, but won't on BSD. We let
  // the exception be uncaught and have the script invoker read the stack trace
  // to figure out what they did wrong (ex: bad file path, bad permissions).
  let licenseText = fs.readFileSync(LICENSE_FILE_PATH, 'utf-8');
  if (licenseText === null) {
    exitWithErrorMessage('Error trying to read license file');
  }

  let matches = yearRegex.exec(licenseText);
  if (matches === null) {
    exitWithErrorMessage('Cannot find year line in the license');
  }
  let licenseStartYear = matches[1];
  let licenseEndYear = matches[2];

  updateLicenseYearIfOutOfDate(licenseText, licenseStartYear, licenseEndYear);
})();

// Scan and update the files.
(() => {
  let licensesInNeedOfFixing = 0;
  let licensesFixed = 0;

  let licenseData = licenseChecker.readLicenseFile(LICENSE_FILE_PATH);
  if (!licenseData.success) {
    exitWithErrorMessage(licenseData.error);
  }

  ['*.js', 'src/**/*.js', 'license-check/**/*.js', 'integration-test/specs/license-check/*.js'].forEach((folderPath) => {
    glob.sync(folderPath).forEach(filePath => {
      let fileLines = licenseChecker.readFileLinesToArray(filePath);
      let licenseLineRange = licenseChecker.determineLicenseLineRangesAtTopOfFile(fileLines);

      let updateStatus = licenseChecker.licenseRangeNeedsUpdating(fileLines, licenseLineRange, licenseData);
      if (updateStatus.needsUpdate) {
        licensesInNeedOfFixing++;
        console.info('Fixing license (' + updateStatus.updateReason + ') at: ' + filePath);

        let outputLines = licenseChecker.generateFileOutputText(fileLines, licenseLineRange, licenseData);
        let writeResult = writeTextToFile(filePath, outputLines);
        if (writeResult) {
          licensesFixed++;
        } else {
          console.error('Unable to write changes to fix license at: ' + filePath);
        }
      }
    });
  });

  if (licensesInNeedOfFixing === 0) {
    console.info('All licenses are up-to-date');
  } else if (licensesInNeedOfFixing === licensesFixed) {
    console.info('Fixed ' + licensesFixed + ' license' + (licensesFixed !== 1 ? 's' : ''));
  } else {
    let licensesNotFixed = licensesInNeedOfFixing - licensesFixed;
    exitWithErrorMessage('Unable to fix ' + licensesNotFixed + '/' + licensesInNeedOfFixing + ' licenses');
  }
})();

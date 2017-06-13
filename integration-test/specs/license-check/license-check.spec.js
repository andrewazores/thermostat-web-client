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

describe('LicenseTest', () => {
  const TEST_LICENSE_LOCATION = './integration-test/specs/license-check/resources/licenses/';
  const VALID_SOURCE_FILES_LOCATION = './integration-test/specs/license-check/resources/source-files/valid-files/';
  const INVALID_SOURCE_FILES_LOCATION = './integration-test/specs/license-check/resources/source-files/invalid-files/';
  const GOOD_LICENSE_PATH = TEST_LICENSE_LOCATION + 'GOOD_LICENSE';
  const CURRENT_LICENSE = 'LICENSE';
  const licenseCheck = require('../../../license-check/license-check.js');
  const glob = require('glob');

  it('should have found the license check module', () => {
    (licenseCheck === null).should.be.false();
  });

  it('should read the current license', () => {
    let licenseData = licenseCheck.readLicenseFile(CURRENT_LICENSE);
    let expectedText = [
      '/**',
      ' * Copyright 2012-2017 Red Hat, Inc.',
      ' *',
      ' * Thermostat is distributed under the GNU General Public License,',
      ' * version 2 or any later version (with a special exception described',
      ' * below, commonly known as the "Classpath Exception").',
      ' *',
      ' * A copy of GNU General Public License (GPL) is included in this',
      ' * distribution, in the file COPYING.',
      ' *',
      ' * Linking Thermostat code with other modules is making a combined work',
      ' * based on Thermostat.  Thus, the terms and conditions of the GPL',
      ' * cover the whole combination.',
      ' *',
      ' * As a special exception, the copyright holders of Thermostat give you',
      ' * permission to link this code with independent modules to produce an',
      ' * executable, regardless of the license terms of these independent',
      ' * modules, and to copy and distribute the resulting executable under',
      ' * terms of your choice, provided that you also meet, for each linked',
      ' * independent module, the terms and conditions of the license of that',
      ' * module.  An independent module is a module which is not derived from',
      ' * or based on Thermostat code.  If you modify Thermostat, you may',
      ' * extend this exception to your version of the software, but you are',
      ' * not obligated to do so.  If you do not wish to do so, delete this',
      ' * exception statement from your version.',
      ' */'
    ];
    let expectedYearNumber = 1;
    licenseData.text.should.eql(expectedText);
    licenseData.yearLineNumber.should.equal(expectedYearNumber);
  });

  it('should succeed on an valid license', () => {
    var licenseData = licenseCheck.readLicenseFile(GOOD_LICENSE_PATH);
    licenseData.success.should.be.true(licenseData.error);
  });

  it('should fail on a license without a year', () => {
    let licenseLocation = TEST_LICENSE_LOCATION + 'NO_YEAR_LICENSE';
    var licenseData = licenseCheck.readLicenseFile(licenseLocation);
    licenseData.success.should.be.false();
    licenseData.error.should.equal('Unable to find year line in license');
  });

  it('should fail on an empty license', () => {
    let licenseLocation = TEST_LICENSE_LOCATION + 'EMPTY_LICENSE';
    var licenseData = licenseCheck.readLicenseFile(licenseLocation);
    licenseData.success.should.be.false();
    licenseData.error.should.equal('Unable to find year line in license');
  });

  it('should walk the valid directory without errors', () => {
    let licenseData = licenseCheck.readLicenseFile(CURRENT_LICENSE);
    licenseData.success.should.be.true(licenseData.error);

    let result = licenseCheck.walkDirectoryAndCheckLicenses(VALID_SOURCE_FILES_LOCATION, licenseData);
    result.success.should.be.true(result.error);
    result.improperLicensePaths.should.deepEqual([]);
  });

  it('should walk the invalid directory and find all 5 bad licenses', () => {
    let licenseData = licenseCheck.readLicenseFile(CURRENT_LICENSE);
    licenseData.success.should.be.true(licenseData.error);

    let result = licenseCheck.walkDirectoryAndCheckLicenses(INVALID_SOURCE_FILES_LOCATION, licenseData);
    result.success.should.be.false('There are no licenses, or they all are correct when they should not be');

    let files = glob.sync(INVALID_SOURCE_FILES_LOCATION + '**/*.js');
    // In case glob.sync() is not deterministic with file traversal, this forces ordering.
    files.sort();
    result.improperLicensePaths.sort();
    result.improperLicensePaths.should.deepEqual(files);
  });

  it('should test its own file for the license', () => {
    let licenseData = licenseCheck.readLicenseFile(CURRENT_LICENSE);
    licenseData.success.should.be.true(licenseData.error);
  });
});

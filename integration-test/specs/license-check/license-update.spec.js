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

describe('License updating', () => {
  const licenseCheck = require('../../../license-check/license-check.js');

  it('should have found the license check module', () => {
    (licenseCheck === null).should.be.false();
  });

  describe('file to array reading', () => {
    const SIMPLE_SOURCE_FILE = './integration-test/specs/license-check/resources/source-files/invalid-files/invalid-misc/no-license.js';
    const EMPTY_FILE = './integration-test/specs/license-check/resources/licenses/EMPTY_LICENSE';

    it('should read a file to lines with no \\r\\n\'s', () => {
      let lines = licenseCheck.readFileLinesToArray(SIMPLE_SOURCE_FILE);
      const EXPECTED_LINES = [
        'var x = 5;',
        '',
        'function test (val) {',
        '    return val;',
        '}',
        ''
      ];
      lines.should.eql(EXPECTED_LINES);
    });

    it('should read an empty file and be an array of one empty string', () => {
      let lines = licenseCheck.readFileLinesToArray(EMPTY_FILE);
      lines.should.eql(['']);
    });
  });

  describe('license range', () => {
    it('should not find anything in an empty list', () => {
      let licenseRange = licenseCheck.determineLicenseLineRangesAtTopOfFile(['']);
      licenseRange.foundMatch.should.be.false();
    });

    it('should find it normally at the top', () => {
      const LICENSE_LINES = [
        '/**',
        ' * Some license',
        ' * here',
        ' */'
      ];
      let licenseRange = licenseCheck.determineLicenseLineRangesAtTopOfFile(LICENSE_LINES);
      licenseRange.foundMatch.should.be.true();
      licenseRange.start.should.equal(0);
      licenseRange.end.should.equal(3);
    });

    it('should find it normally at the top with source code', () => {
      const LICENSE_LINES = [
        '/**',
        ' * Some license',
        ' * here',
        ' */',
        '',
        'var sourceCode = "here"',
        ''
      ];
      let licenseRange = licenseCheck.determineLicenseLineRangesAtTopOfFile(LICENSE_LINES);
      licenseRange.foundMatch.should.be.true();
      licenseRange.start.should.equal(0);
      licenseRange.end.should.equal(3);
    });

    it('should find it at the middle due to multiple \\n\'s', () => {
      const LICENSE_LINES = [
        '',
        '',
        '',
        '/**',
        ' * Some license',
        ' * here',
        ' */',
        '',
        'var sourceCode = "here"',
        ''
      ];
      let licenseRange = licenseCheck.determineLicenseLineRangesAtTopOfFile(LICENSE_LINES);
      licenseRange.foundMatch.should.be.true();
      licenseRange.start.should.equal(3);
      licenseRange.end.should.equal(6);
    });

    it('should not find it because of source code above it', () => {
      const LICENSE_LINES = [
        '',
        'var x = 5;',
        '',
        '/**',
        ' * Some license',
        ' * here',
        ' */',
        '',
        'var sourceCode = "here"',
        ''
      ];
      let licenseRange = licenseCheck.determineLicenseLineRangesAtTopOfFile(LICENSE_LINES);
      licenseRange.foundMatch.should.be.false();
    });

    it('should find //\'s and at the middle due to multiple \\n\'s', () => {
      const LICENSE_LINES = [
        '',
        '',
        '// Some license',
        '// here',
        '',
        'var sourceCode = "here"',
        ''
      ];
      let licenseRange = licenseCheck.determineLicenseLineRangesAtTopOfFile(LICENSE_LINES);
      licenseRange.foundMatch.should.be.true();
      licenseRange.start.should.equal(2);
      licenseRange.end.should.equal(3);
    });

    it('should report a non-terminated comment document', () => {
      const LICENSE_LINES = [
        '/**',
        ' * Something 2012-2012',
        ' * no terminal star/slash',
        'var sourceCode = "here"',
        ''
      ];
      let licenseRange = licenseCheck.determineLicenseLineRangesAtTopOfFile(LICENSE_LINES);
      licenseRange.foundMatch.should.be.true();
      licenseRange.start.should.equal(0);
      licenseRange.end.should.equal(4);
    });
  });

  describe('license range updating', () => {
    it('should not find a difference between identical licenses', () => {
      const FILE_LINES = [
        '/**',
        ' * Some license 2015-2017',
        ' */'
      ];
      const LICENSE_DATA = {
        text: [
          '/**',
          ' * Some license 2015-2017',
          ' */'
        ],
        yearLineNumber: 1,
        error: null,
        success: true
      };
      const LICENSE_LINE_RANGE = { start: 0, end: 2, foundMatch: true };
      let updateStatus = licenseCheck.licenseRangeNeedsUpdating(FILE_LINES, LICENSE_LINE_RANGE, LICENSE_DATA);
      updateStatus.needsUpdate.should.be.false();
    });

    it('should find a difference between non-identical licenses (different year)', () => {
      const FILE_LINES = [
        '/**',
        ' * Some license 2015-2016',
        ' */'
      ];
      const LICENSE_DATA = {
        text: [
          '/**',
          ' * Some license 2015-2017',
          ' */'
        ],
        yearLineNumber: 1,
        error: null,
        success: true
      };
      const LICENSE_LINE_RANGE = { start: 0, end: 2, foundMatch: true };
      let updateStatus = licenseCheck.licenseRangeNeedsUpdating(FILE_LINES, LICENSE_DATA, LICENSE_LINE_RANGE);
      updateStatus.needsUpdate.should.be.true();
    });

    it('should find a difference between non-identical licenses (different text)', () => {
      const FILE_LINES = [
        '/**',
        ' * Some license 2015-2016',
        ' *',
        ' * This is a simple test',
        ' * of mutated text.',
        ' */'
      ];
      const LICENSE_DATA = {
        text: [
          '/**',
          ' * Some license 2015-2017',
          ' *',
          ' * This is a simple test',
          ' * of unmutated text.',
          ' */'
        ],
        yearLineNumber: 1,
        error: null,
        success: true
      };
      const LICENSE_LINE_RANGE = { start: 0, end: 5, foundMatch: true };
      let updateStatus = licenseCheck.licenseRangeNeedsUpdating(FILE_LINES, LICENSE_DATA, LICENSE_LINE_RANGE);
      updateStatus.needsUpdate.should.be.true();
    });

    it('should find a difference between non-identical licenses (missing lines)', () => {
      const FILE_LINES = [
        '/**',
        ' * Some license 2015-2017',
        ' *',
        ' * This is a simple test',
        ' */'
      ];
      const LICENSE_DATA = {
        text: [
          '/**',
          ' * Some license 2015-2017',
          ' *',
          ' * This is a simple test',
          ' * of unmutated text.',
          ' */'
        ],
        yearLineNumber: 1,
        error: null,
        success: true
      };
      const LICENSE_LINE_RANGE = { start: 0, end: 4, foundMatch: true };
      let updateStatus = licenseCheck.licenseRangeNeedsUpdating(FILE_LINES, LICENSE_DATA, LICENSE_LINE_RANGE);
      updateStatus.needsUpdate.should.be.true();
    });

    it('should detect an update is needed for double slash comments', () => {
      const FILE_LINES = [
        '// Some license 2015-2016'
      ];
      const LICENSE_LINE_RANGE = { start: 0, end: 2, foundMatch: true };
      const LICENSE_DATA = {
        text: [
          '/**',
          ' * Some license 2015-2017',
          ' */'
        ],
        yearLineNumber: 1,
        error: null,
        success: true
      };
      let updateStatus = licenseCheck.licenseRangeNeedsUpdating(FILE_LINES, LICENSE_DATA, LICENSE_LINE_RANGE);
      updateStatus.needsUpdate.should.be.true();
    });

    it('should detect an update is needed for leaky multiline comments', () => {
      const FILE_LINES = [
        '/**',
        ' * Some license 2015-2016',
        ' */'
      ];
      const LICENSE_LINE_RANGE = { start: 0, end: 2, foundMatch: true };
      const LICENSE_DATA = {
        text: [
          '/**',
          ' * Some license 2015-2017',
          ' *'
        ],
        yearLineNumber: 1,
        error: null,
        success: true
      };
      let updateStatus = licenseCheck.licenseRangeNeedsUpdating(FILE_LINES, LICENSE_DATA, LICENSE_LINE_RANGE);
      updateStatus.needsUpdate.should.be.true();
    });

    it('should not want to update an empty file', () => {
      const FILE_LINES = [''];
      const LICENSE_LINE_RANGE = { start: 0, end: 0, foundMatch: true };
      const LICENSE_DATA = { text: [''], yearLineNumber: 0, error: null, success: true };
      let updateStatus = licenseCheck.licenseRangeNeedsUpdating(FILE_LINES, LICENSE_DATA, LICENSE_LINE_RANGE);
      updateStatus.needsUpdate.should.be.false();
    });
  });

  describe('integration test', () => {
    const fs = require('fs');
    const glob = require('glob');
    const BROKEN_IDENTIFIER = '-broken.js';
    const EXPECTED_FIXED_IDENTIFIER = '-fixed.js';
    const UPDATABLE_FOLDER = './integration-test/specs/license-check/resources/source-files/updatable-files/';
    const LICENSE_PATH = './integration-test/specs/license-check/resources/licenses/GOOD_LICENSE';
    const LICENSE_DATA = licenseCheck.readLicenseFile(LICENSE_PATH);

    let files = glob.sync(UPDATABLE_FOLDER + '*' + BROKEN_IDENTIFIER);
    files.forEach((filePath) => {
      it('should properly fix "' + filePath + '"', () => {
        let tmpFileLines = licenseCheck.readFileLinesToArray(filePath);
        let tmpLicenseLineRange = licenseCheck.determineLicenseLineRangesAtTopOfFile(tmpFileLines);
        let updateStatus = licenseCheck.licenseRangeNeedsUpdating(tmpFileLines, tmpLicenseLineRange, LICENSE_DATA);
        updateStatus.needsUpdate.should.be.true();

        let outputText = licenseCheck.generateFileOutputText(tmpFileLines, tmpLicenseLineRange, LICENSE_DATA);

        let fixedPath = filePath.slice(0, filePath.length - BROKEN_IDENTIFIER.length) + EXPECTED_FIXED_IDENTIFIER;
        let expectedText = fs.readFileSync(fixedPath, 'utf8');
        outputText.should.be.eql(expectedText);
      });
    });
  });
});

const fs = require("fs");
const { parse } = require("csv-parse");

const data = [];

const message =
  `// ==========================================
*** GENERATED FILE. DO NOT EDIT ***
All local changes will be overwritten.
Last updated: ${Date.now().toString()}
// ==========================================
`;

const declaration = "export const Phrases = new Map<string, Phrase>("

function parseMasterCSV() {
  fs.createReadStream('./ac-strings-text.csv')
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    // for each csv row, add the data to data array if web=TRUE
    .on('data', (row) => {
      if (row[3] == 'TRUE') {
        // shape the data for the phrase.ts file
        data.push([
          row[0],
          {
            en: row[4],
            fr: row[5],
            es: row[6],
          },
        ]);
      } else {
        return;
      }
    })
    .on('end', () => {
      const tsCode = `
      ${JSON.stringify(message)}\n
      export interface Phrase {
        en: string;
        fr: string;
        es: string;
      }\n
      ${declaration}${JSON.stringify(data, null, 2)})`;
      fs.writeFile('output.ts', tsCode, (err) => {
        if (err) {
          console.error('Error writing ts file');
        } else {
          console.log('CSV data written into output.ts');
        }
      })
    })
}

parseMasterCSV();
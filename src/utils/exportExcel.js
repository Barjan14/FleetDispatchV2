import { strToU8, zipSync } from 'fflate';
import { saveAs } from 'file-saver';

const escXml = s =>
  String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c])
  );

const colName = n => {
  let s = '';
  for (let i = n + 1; i > 0; i = Math.floor((i - 1) / 26))
    s = String.fromCharCode(65 + ((i - 1) % 26)) + s;
  return s;
};

export const exportToXlsx = (rows, sheetName, fileName) => {
  if (!rows || rows.length === 0) return;

  const strs = [];
  const strMap = new Map();
  const addStr = v => {
    const s = String(v ?? '');
    if (!strMap.has(s)) { strMap.set(s, strs.length); strs.push(s); }
    return strMap.get(s);
  };

  const grid = rows.map(row =>
    (Array.isArray(row) ? row : Object.values(row)).map(v => addStr(v))
  );

  const sharedStringsXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/sheet" count="${strs.length}" uniqueCount="${strs.length}">` +
    strs.map(s => `<si><t xml:space="preserve">${escXml(s)}</t></si>`).join('') +
    `</sst>`;

  const sheetXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/sheet"><sheetData>` +
    grid.map((row, ri) =>
      `<row r="${ri + 1}">` +
      row.map((n, ci) => `<c r="${colName(ci)}${ri + 1}" t="s"><v>${n}</v></c>`).join('') +
      `</row>`
    ).join('') +
    `</sheetData></worksheet>`;

  const workbookXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/sheet" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheets><sheet name="${escXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets>` +
    `</workbook>`;

  const stylesXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/sheet">` +
    `<fonts><font><sz val="11"/><name val="Calibri"/></font></fonts>` +
    `<fills><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>` +
    `<borders><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
    `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
    `<cellXfs><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>` +
    `</styleSheet>`;

  const contentTypesXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>` +
    `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
    `</Types>`;

  const relsXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `</Relationships>`;

  const workbookRelsXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>` +
    `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    `</Relationships>`;

  const enc = s => strToU8(s);

  const zip = zipSync({
    '[Content_Types].xml': enc(contentTypesXml),
    '_rels/.rels': enc(relsXml),
    'xl/workbook.xml': enc(workbookXml),
    'xl/_rels/workbook.xml.rels': enc(workbookRelsXml),
    'xl/worksheets/sheet1.xml': enc(sheetXml),
    'xl/sharedStrings.xml': enc(sharedStringsXml),
    'xl/styles.xml': enc(stylesXml),
  });

  saveAs(
    new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    fileName
  );
};

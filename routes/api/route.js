const route = require("express").Router();

// This is not related to the QR code project
// This is spreadsheet information for the calendar and route projects

const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const info = {
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCsIks4odowOWwZ\nT3oX7AWiGDPbtx9UrK4pSstOwblzjWr7v22Hn4kvBOK+EHlZl0YSsiT0pPerP3mJ\nbKWSLvgT+XrEXHwrEvKEfehMlUPDxHdC/yKqwdvJ2mOXtWL30SzKOmvAXUPfHaiE\nMGnyGGy9GiDasPOpITePu83ZOjcaPJ72kRPKmJ2X+avREqGte+wRRHkFizinpWy2\nwKTFf4/+V/4WpUuUJU/lYxi4f76zyCyt3/FMI/siUyYg3yAwiLJoEArEoraesgeG\n0sx9xqwcui9SL7zQEvWDXMpc3zXG9BHtlL94xPShvHUkxmBLhRrWfixhJuBuTYGp\npiagTCeLAgMBAAECggEATbGS6yZesYqRiKEPVjHRXxb2fTLb4N+qInggaNVWy9mm\nUqfWG7N9+2uEnk4YP8BgP/sJZCT7pt9ZD5aq6t7pWTavW2b1IooETZn42mw68GdC\nf0piTtl+R08bybN0zq8qvMJ+tQ5Dnranw7aIc13j4ryi3KKm8A1Oo0EcyfIVQfEh\nPh/LV0BURA0oSc0IoPU359Xm1C3gHC5aiq7niWcgm22WjdlR1bNZ9ahTnhMO/QJL\ncSAPIP2wtfLn6IbZHxTgxP84pChCSGyhM0HOdtJQQfqi3awI2LpsmaPpTrEbxqgy\n+/ncYfBOTNpSOVZ5aur80zkph3R7kGSSDXl2MlbY+QKBgQDokLqMWO0K6i7lcmdU\neZB4tVjpjE7ZU33mPfn1NJizbMC61MrpQ3DDOScD7zJcM9lBCB75+ZXH/fwkTYwg\nvSwRMy1Yj9vKYup4M9mHDoBF6T0iqZlnyuEvz11j3RJcmXHBX0FuguXKFvvgmK86\nrKIl7cerc2+2O9Umlh+J+HyPOQKBgQC9eqxL0K42X2N/5LoAaJQU8aeyKNXMa6+W\nSHANyaAU9/hbJM9ma+vtY6/ngNi3BZjmqLAF5EL8xizaYA4BDEemBhiK01n/6XOS\nmLBTfPxD7586ELRJ+rmCMtlD9FlbOFX6Kq48WhH3E9letz5dwyl96gqc8i5X/iLY\n0J+NYvpo4wKBgDh8nrLkDn8uLkHQrcRY2nxXH8dqKuSiYNwBharHIafC7HT0pmxN\n0x+3zAAqowK+HTCsdkmlE3pF+G4g37479G4hDgyKtInNyMF1ZoplPUa9xfmbVAVf\nw55HMZnF4mXXZ0feiRf8dy/EsVz1+Om5cJDh1jOQkDulALqkj/iFAEwRAoGAaLoo\nBxOFZtocRbEnOViUGGtk0+0MFpuihj7taEF78HsKU14qICMgWKpTrHIj1i0K0NqF\nyAvdFpd2bRDQTLX72ADgicK9qNvgnDM2qj6Xs/j6mf5nl8gzxonSWmPxC6E8rDPw\n77yc12KqL1a66toW0diNGygkg1Ac9JeCyIPfgh8CgYAi+5f21TETnOka5Cc+zslP\nj+TVGmDwK7K0mV4lg0jEx5e/drxsGKb61spOXT1/9rP+3N4NFLKJN39UyLfz5BzQ\nNDbtluhyFNXj+gcCq2/2LrP44+hQaRzbR9Cki9dBobiwhIVCMYpULYXeIe1g1lke\nrcgKRzevd7qg9vnQwjy7Ng==\n-----END PRIVATE KEY-----\n",
  client_email:
    "route-calc-sheet@route-calculator-sheet.iam.gserviceaccount.com",
};

route.get("/route/costData", async (req, res) => {
  const serviceAccountAuth = new JWT({
    email: info.client_email,
    key: info.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    "1FBv2LwTw8M4X7xURkFNZVV6S0qwyjFHLKDb_gaMmrRY",
    serviceAccountAuth
  );

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[1];
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  let individualData = {};

  rows.forEach((row) => {
    individualData[row.get("NICKNAME")] = {
      travelCost: parseInt(row.get("TRAVEL COST (Per Day)")),
      cost: parseInt(row.get("ACTIVATION COST (Per Day)")),
    };
  });

  res.send(individualData);
});

route.get("/route/vectorCostData", async (req, res) => {
  const serviceAccountAuth = new JWT({
    email: info.client_email,
    key: info.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    "1FBv2LwTw8M4X7xURkFNZVV6S0qwyjFHLKDb_gaMmrRY",
    serviceAccountAuth
  );

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[1];
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  let individualData = {};

  rows.forEach((row) => {
    individualData[row.get("NICKNAME")] = {
      travelCost: parseInt(row.get("TRAVEL COST (Per Day)")),
      cost: parseInt(row.get("ACTIVATION COST (Per Day)")),
    };
  });

  res.send(individualData);
});

route.get("/route/agencyCostData", async (req, res) => {
  const serviceAccountAuth = new JWT({
    email: info.client_email,
    key: info.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    "1FBv2LwTw8M4X7xURkFNZVV6S0qwyjFHLKDb_gaMmrRY",
    serviceAccountAuth
  );

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[2];
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  let individualData = {};

  rows.forEach((row) => {
    individualData[row.get("NICKNAME")] = {
      travelCost: parseInt(row.get("TRAVEL COST (Per Day)")),
      cost: parseInt(row.get("ACTIVATION COST (Per Day)")),
    };
  });

  res.send(individualData);
});

route.get("/route/directCostData", async (req, res) => {
  const serviceAccountAuth = new JWT({
    email: info.client_email,
    key: info.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    "1FBv2LwTw8M4X7xURkFNZVV6S0qwyjFHLKDb_gaMmrRY",
    serviceAccountAuth
  );

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[3];
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  let individualData = {};

  rows.forEach((row) => {
    individualData[row.get("NICKNAME")] = {
      travelCost: parseInt(row.get("TRAVEL COST (Per Day)")),
      cost: parseInt(row.get("ACTIVATION COST (Per Day)")),
    };
  });

  res.send(individualData);
});

route.get("/route/holdData", async (req, res) => {
  const serviceAccountAuth = new JWT({
    email: info.client_email,
    key: info.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    "1FBv2LwTw8M4X7xURkFNZVV6S0qwyjFHLKDb_gaMmrRY",
    serviceAccountAuth
  );

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  await sheet.loadHeaderRow();
  const rows = await sheet.getRows();
  const busesData = [];

  rows.forEach((row) => {
    // Access cell values based on column names
    // console.log(row);
    const busData = {};

    busData["nickname"] = row.get("NICKNAME");
    busData["bus"] = row.get("BUS");
    busData["type"] = row.get("TYPE");
    // busData["jobStatus"] = row.get("JOB STATUS");
    // busData["vehicleStatus"] = row.get("VEHICLE STATUS");
    // busData["begin"] = row.get("CONTRACTED BEGIN");
    // busData["end"] = row.get("CONTRACTED END");
    // busData["title"] = row.get("JOB TITLE");
    busData["id"] = row.get("JOB ID");

    busesData.push(busData);
  });

  res.send(busesData);
});

module.exports = route;

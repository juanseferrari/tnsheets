const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return new OAuth2Client({
      clientId: credentials.client_id,
      clientSecret: credentials.client_secret,
      redirectUri: credentials.redirect_uris[0],
      credentials: credentials,
    });
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @param {string} state
 * @return {Promise<void>}
 */
async function saveCredentials(client, state) {
  const payload = JSON.stringify({
    client_id: client.clientId,
    client_secret: client.clientSecret,
    redirect_uris: [client.redirectUri],
    refresh_token: client.credentials.refresh_token,
    user_id: client.credentials.id_token ? client.credentials.id_token.sub : null, // Extract user ID from ID token
    state: state,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }

  const state = "12344"; // Your custom state identifier

  const credentialsContent = await fs.readFile(CREDENTIALS_PATH);
  const credentials = JSON.parse(credentialsContent);

  const oAuth2Client = new OAuth2Client({
    clientId: credentials.installed.client_id,
    clientSecret: credentials.installed.client_secret,
    redirectUri: credentials.installed.redirect_uris[0],
  });

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: state,
  });

  console.log('Authorize this app by visiting this URL:', authUrl);

  const code = 'YOUR_AUTHORIZATION_CODE'; // Replace with the actual authorization code obtained from the user

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);

  await saveCredentials(oAuth2Client, state);

  return oAuth2Client;
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
async function listFiles(authClient) {
  const drive = google.drive({ version: 'v3', auth: authClient });
  const res = await drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  });
  const files = res.data.files;
  if (files.length === 0) {
    console.log('No files found.');
    return;
  }

  console.log('Files:');
  files.map((file) => {
    console.log(`${file.name} (${file.id})`);
  });
}

authorize().then(listFiles).catch(console.error);

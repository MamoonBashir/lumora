/* Lumora — Cosmos DB client (singleton) */
const { CosmosClient } = require('@azure/cosmos');

let _client, _db;

function getDb() {
  if (!_client) {
    _client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key:      process.env.COSMOS_KEY,
    });
    _db = _client.database(process.env.COSMOS_DATABASE);
  }
  return _db;
}

const containers = {
  photos:   () => getDb().container('photos'),
  users:    () => getDb().container('users'),
  comments: () => getDb().container('comments'),
  stories:  () => getDb().container('stories'),
};

module.exports = { getDb, containers };

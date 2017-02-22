import { Migrations } from 'meteor/percolate:migrations';
import { Mongo } from 'meteor/mongo';

import Apis from '/apis/collection';
import Proxies from '/proxies/collection';
import ProxyBackends from '/proxy_backends/collection';

Migrations.add({
  version: 2,
  name: 'Migrate all apiBackends to new structure',
  up () {
    // Update all apiBackends

    // Init connection to old apiBackends
    const ApiBackends = new Mongo.Collection('apiBackends');

    // Iterate through apiBackends collection
    ApiBackends.find().forEach((apiBackend) => {
      // Construct apiUrl
      const apiUrl = `${apiBackend.backend_protocol}://${apiBackend.backend_host}`;
      // New api object
      const api = {
        name: apiBackend.name,
        description: apiBackend.description,
        url: apiUrl,
        documentationFileId: apiBackend.documentationFileId,
        apiLogoFileId: apiBackend.apiLogoFileId,
        documentation_link: apiBackend.documentation_link,
        created_at: apiBackend.created_at,
        created_by: apiBackend.created_by,
        updated_at: apiBackend.updated_at,
        updated_by: apiBackend.updated_by,
        version: apiBackend.version,
        managerIds: apiBackend.managerIds,
        bookmarkCount: apiBackend.bookmarkCount,
        isPublic: apiBackend.isPublic,
        submit_methods: [],
        averageRating: 0,
        latestMonitoringStatusCode: '-1',
      };

      // Insert migrated api, get Id
      const apiId = Apis.insert(api);

      // Get proxyId
      const proxyId = Proxies.findOne()._id;

      // umbrellaObject
      const umbrellaObject = {
        id: apiBackend.id,
        name: apiBackend.name,
        frontend_host: apiBackend.frontend_host,
        backend_host: apiBackend.backend_host,
        backend_protocol: apiBackend.backend_protocol,
        balance_algorithm: apiBackend.balance_algorithm,
        url_matches: apiBackend.url_matches,
        servers: apiBackend.servers,
        settings: apiBackend.settings,
      };

      // new proxyBackend
      const proxyBackend = {
        proxyId,
        apiId,
        apiUmbrella: umbrellaObject,
      };

      // Insert migrated proxyBackend
      ProxyBackends.insert(proxyBackend, { validate: false });
    });
  },
});

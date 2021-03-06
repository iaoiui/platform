/* Copyright 2017 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

// Collection imports
import ApiBacklogItems from '/apinf_packages/backlog/collection';
import ApiDocs from '/apinf_packages/api_docs/collection';
import ApiMetadata from '/apinf_packages/metadata/collection';
import Apis from '/apinf_packages/apis/collection';
import DocumentationFiles from '/apinf_packages/api_docs/files/collection';
import Feedback from '/apinf_packages/feedback/collection';
import OrganizationApis from '/apinf_packages/organization_apis/collection';
import ProxyBackends from '/apinf_packages/proxy_backends/collection';
import { MonitoringSettings, MonitoringData } from '/apinf_packages/monitoring/collection';
import Organizations from '/apinf_packages/organizations/collection';

Meteor.methods({
  // Remove API backend and related items
  removeApi (apiId) {
    // Make sure apiId is a string
    check(apiId, String);

    // Remove API doc
    Meteor.call('removeApiDoc', apiId);

    // Stop the api monitoring if it's enabled
    Meteor.call('stopCron', apiId);

    // Get monitoring Settings
    const monitoring = MonitoringSettings.findOne({ apiId });

    // Check if API has monitoring
    if (monitoring) {
      // Remove Monitoring Settings and Monitoring Data
      Meteor.call('removeMonitoring', apiId);
    }

    // TODO: migrate to use 'apiId' instead of 'apiBackendId'
    // Remove backlog items
    ApiBacklogItems.remove({ apiBackendId: apiId });

    // TODO: migrate to use 'apiId' instead of 'apiBackendId'
    // Remove feedbacks
    Feedback.remove({ apiBackendId: apiId });

    // Remove metadata
    ApiMetadata.remove({ apiId });

    // Get proxyBackend
    const proxyBackend = ProxyBackends.findOne({ apiId });

    // Check if API has proxyBackend
    if (proxyBackend) {
      // Delete proxyBackend
      Meteor.call('deleteProxyBackend', proxyBackend);
    }

    // Remove linked document between APIs and connected organization
    Meteor.call('removeOrganizationApiLink', apiId);

    // Get organization where API is featured
    const organization = Organizations.findOne({ featuredApiIds: apiId });
    // Remove API from featured APIs list, if it exists there
    if (organization) {
      const organizationId = organization._id;
      Meteor.call('removeApiFromFeaturedList', organizationId, apiId);
    }

    // Finally remove the API
    Apis.remove(apiId);
  },
  // Remove API documentation file
  removeApiDoc (apiId) {
    // Make sure apiId is a string
    check(apiId, String);

    // Go through all related ApiDocs instances
    ApiDocs.find({ apiId }).forEach(apiDoc => {
      // If file exists
      if (apiDoc.fileId) {
        // Convert to Mongo ObjectID
        const objectId = new Mongo.Collection.ObjectID(apiDoc.fileId);

        // Remove documentation object
        DocumentationFiles.remove(objectId);
      }
    });

    ApiDocs.remove({ apiId });
  },
  removeMonitoring (apiId) {
    // Make sure apiId is a string
    check(apiId, String);

    // Remove monitoring data collection
    MonitoringData.remove({ apiId });

    // Remove monitoring settings collection
    MonitoringSettings.remove({ apiId });
  },
  removeOrganizationApiLink (apiId) {
    // Make sure apiId is a string
    check(apiId, String);

    // Get related organizationApis document
    const organizationApiLink = OrganizationApis.findOne({ apiId });

    // Make sure document exists
    if (organizationApiLink) {
      // Delete document
      OrganizationApis.remove({ _id: organizationApiLink._id });
    }
  },
});

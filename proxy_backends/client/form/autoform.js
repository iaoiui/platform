import { TAPi18n } from 'meteor/tap:i18n';
import { Meteor } from 'meteor/meteor';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { AutoForm } from 'meteor/aldeed:autoform';

AutoForm.hooks({
  proxyBackendForm: {
    before: {
      insert (proxyBackend) {
        // Get reference to autoform instance, for form submission callback
        const form = this;

        // Get API Umbrella configuration
        Meteor.call('createApiBackendOnApiUmbrella',
          proxyBackend.apiUmbrella,
          (error, response) => {
            if (error) {
              // Throw a Meteor error
              Meteor.error(500, error);
            } else {
              // If success, attach API Umbrella backend ID to current document
              if (
                response.result &&
                response.result.data &&
                response.result.data.api
              ) {
                // Get the API Umbrella ID for newly created backend
                const umbrellaBackendId = response.result.data.api.id;

                // Attach the API Umbrella backend ID to backend document
                proxyBackend.apiUmbrella.id = umbrellaBackendId;

                // Publish the API Backend on API Umbrella
                Meteor.call(
                  'publishApiBackendOnApiUmbrella',
                  umbrellaBackendId,
                  (error, result) => {
                    if (error) {
                      Meteor.throw(500, error);
                    } else {
                      // Insert the API document, asynchronous
                      form.result(proxyBackend);
                    }
                  }
                );
              }
            }
          });
      },
      update (apiModifier) {
        // Get reference to form instance to use inside the callback function
        const form = this;

        // Get ID of API Umbrella backend (not the Apinf document ID)
        const apiUmbrellaBackendId = form.currentDoc.apiUmbrella.id;

        // Get update API document
        const apiUmbrellaBackendUpdate = form.updateDoc.$set.apiUmbrella;

        // Update API on API Umbrella
        Meteor.call(
          'updateApiBackendOnApiUmbrella',
          apiUmbrellaBackendId,
          apiUmbrellaBackendUpdate,
          (error) => {
            // Check for error
            if (error) {
              // Throw error for debugging
              Meteor.throw(500, error);
            } else {
              // Publish the API on API Umbrella
              Meteor.call(
                'publishApiBackendOnApiUmbrella',
                apiUmbrellaBackendId,
                (error) => {
                  // Check for error
                  if (error) {
                    // Throw error for debugging
                    Meteor.throw(500, error);
                  } else {
                    // Get success message translation
                    const message = TAPi18n.__('proxyBackendForm_update_successMessage');
                    // Alert user of success
                    sAlert.success(message);

                    // Continue with form submission
                    form.result(apiModifier);
                  }
                }
              );
            }
          });
      },
    },
    onSuccess () {
      // Get success message translation
      const message = TAPi18n.__('proxyBackendForm_successMessage');

      // Alert the user of success
      sAlert.success(message);
    },
    onError (formType, error) {
      console.log(formType);
      console.log(error);
    },
  },
});

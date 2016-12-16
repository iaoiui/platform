import { Template } from 'meteor/templating';

Template.apiLifecycleStatus.onCreated(function () {
  // Get reference to template instance
  const templateInstance = Template.instance();

  // Track edit mode with reactive variable (initially false)
  templateInstance.editMode = new ReactiveVar(false);
});

Template.apiLifecycleStatus.helpers({
  lifecycleStatus () {
    // Get reference to template instahce
    const templateInstance = Template.instance();

    let statusText;

    if (templateInstance.api && templateInstance.api.lifecycleStatus) {
      statusText = templateInstance.api.lifecycleStatus;
    } else {
      statusText = 'Unknown';
    }

    return statusText;
  },
});

Template.apiLifecycleStatus.events({
  'click #edit-api-lifecycle-status' (event, templateInstance) {
    console.log(templateInstance);
  }
});

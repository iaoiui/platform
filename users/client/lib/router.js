import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Accounts } from 'meteor/accounts-base';
import { sAlert } from 'meteor/juliancwirko:s-alert';
import { TAPi18n } from 'meteor/tap:i18n';

Router.route('/users', {
  name: 'accountsAdmin',
  layout: 'masterLayout',
  template: 'accountsAdmin',
});

Router.route('/verify-email/:token', {
  name: 'verify-email',
  action () {
    // Get token from Router params
    const token = Router.current().params.token;
    Accounts.verifyEmail(token, (error) => {
      if (error) {
        // Eg. token invalid or already used
        sAlert.error(error.reason);
      } else {
        // Email successfully verified
        sAlert.success(TAPi18n.__('emailVerification_successMessage'));
      }
    });
    // Go to front page
    Router.go('/');
  },
});

Router.route('/settings/account', {
  name: 'account',
  layout: 'masterLayout',
  template: 'account',
});

Router.route('/settings/profile', {
  name: 'profile',
  layout: 'masterLayout',
  template: 'profile',
});

// Redirect to profile page if user doesn't have username
// Eg. logged in with Github & username already taken
const redirectToProfile = function () {
  // Get logged in user
  const loggedInUser = Meteor.user();
  // If user exists but does not have username defined, redirect to profile
  if (loggedInUser && !loggedInUser.username) {
    this.redirect('/settings/profile');
  }
  this.next();
};
// Don't redirect on profile page
Router.onBeforeAction(redirectToProfile, { except: ['profile'] });

Router.route('/sign-out', {
  name: 'signOut',
  layout: 'masterLayout',
  template: 'signOut',
});

const signOut = function () {
  Meteor.logout();
  this.redirect('/');
  return this.next();
};

Router.onBeforeAction(signOut, { only: ['signOut'] });

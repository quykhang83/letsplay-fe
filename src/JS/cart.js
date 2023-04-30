import { keycloak, authenticateLogin } from './keycloakauth.js';
import * as common from './common.js';

$(async function () {
  await authenticateLogin();
  if (keycloak.authenticated) {
    const loginBtn = document.getElementById('login_btn');
    if (keycloak.authenticated) {
      console.log('User is authenticated');
      // Display profile button
      document.getElementById('profile-page-btn').style.display = 'flex';
      // Display library button
      document.getElementById('library-page-btn').style.display = 'flex';
      // Display user info button
      document.getElementById('user-info-btn').style.display = 'flex';
      await common.loadUserInfoBar();

      if (keycloak.hasRealmRole('manager')) {
      } else {
      }
    }
  } else {
  }
  await initialized();
  setTimeout(function () {
    $('#spinner-container').fadeOut();
  }, 500);
});

async function initialized(){

}


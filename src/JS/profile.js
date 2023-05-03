import { keycloak, authenticateLogin } from './keycloakauth.js';
import * as common from './common.js';

$(async function () {
  await authenticateLogin();
  if (keycloak.authenticated) {
    console.log('User is authenticated');
    // Display the design page button if user is manager
    if (keycloak.hasRealmRole('manager')) {
      document.getElementById('manage-btn').style.display = 'flex';
    } else {
      document.getElementById('cart-btn').style.display = 'flex';
      common.loadCartNumber();
      // Display library button
      document.getElementById('library-page-btn').style.display = 'flex';
    }
    common.loadUserInfoBar();
  } else {
    console.log('User is not authenticated! Calling authenticate function');
    console.log('Authentication status: ', keycloak.authenticated);
  }
  await initialize();
  setTimeout(function () {
    $('#spinner-container').fadeOut();
  }, 500);
});

async function initialize() {
  await Promise.all([loadUserInfoUI()]);
  addClickListeners();
}
function addClickListeners() {
  // Tab panel
  const tabs = document.querySelectorAll('.btn-outline-secondary');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // remove active class from all tabs and panels
      tabs.forEach((tab) => tab.classList.remove('active'));
      panels.forEach((panel) => panel.classList.remove('active'));

      // add active class to the clicked tab and panel
      const target = tab.dataset.tab;
      const panel = document.querySelector(`.tab-panel[data-tab="${target}"]`);
      tab.classList.add('active');
      panel.classList.add('active');
    });
  });
  // Profile submit button
  const submit_btn = document.getElementById('profile-submit-btn');
  submit_btn.addEventListener('click', async () => {
    var user = await $.ajax({
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/jsons',
        Authorization: 'Bearer ' + keycloak.token,
      },
      url: '/info',
      method: 'GET',
    });

    const updatedUser = {};

    const profile_name = document.getElementById('profile-name-input-box');
    const phone = document.getElementById('phone-input-box');
    const bio = document.getElementById('bio-input-box');

    // Check if the name input has changed
    if (profile_name.value !== user.userDisplayname) {
      updatedUser.userDisplayname = profile_name.value;
    }

    // Check if the phone input has changed
    if (phone.value !== user.userPhone) {
      updatedUser.userPhone = phone.value;
    }

    // Check if the bio input has changed
    if (bio.value !== user.Bio) {
      updatedUser.userBio = bio.value;
    }

    var update = await $.ajax({
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + keycloak.token,
      },
      url: '/users',
      method: 'PATCH',
      dataType: 'json',
      data: JSON.stringify(updatedUser),
    });
    location.reload();
  });
}
async function loadUserInfoUI() {
  var user = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + keycloak.token,
    },
    url: '/info',
    method: 'GET',
  });

  const profile_name = document.getElementById('profile-name-input-box');
  const phone = document.getElementById('phone-input-box');
  const bio = document.getElementById('bio-input-box');

  if (user.userDisplayname == null) {
    profile_name.value = '';
  } else {
    profile_name.value = user.userDisplayname;
  }

  if (user.userPhone == null) {
    phone.value = '';
  } else {
    phone.value = user.userPhone;
  }

  if (user.userBio == null) {
    bio.value = '';
  } else {
    bio.value = user.userBio;
  }
}

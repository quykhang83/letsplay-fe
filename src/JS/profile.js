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
      // Display receipt button
      document.getElementById('receipt_btn').style.display = 'flex';
      // Display cart button
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
  await Promise.all([showView(), loadUserInfoUI()]);
  addClickListeners();
}
async function showView() {
  var current_user = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
      Authorization: 'Bearer ' + keycloak.token,
    },
    url: '/get-user-info',
    method: 'GET',
  });

  // Get the user id from the query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user-id');
  const path = window.location.href;

  console.log(path);
  if (userId) {
    // Display profile view
    document.getElementById('profile-container').style.display = 'flex';
    document.getElementById('edit-profile-container').style.display = 'none';
    await loadProfileView(userId);
  } else {
    // Check if the user is logged in
    if (path.endsWith('/profile.html?edit')) {
      console.log("edit view")
      if (keycloak.authenticated) {
        // Display edit view
        document.getElementById('edit-profile-container').style.display = 'flex';
        document.getElementById('profile-container').style.display = 'none';
      } else {
        // Call login function
        await authenticateLogin();
      }
    } else if (path.endsWith('/profile.html') || path.endsWith('/profile.html?')) {
      console.log("current user view")
      // Display profile view of the current user
      document.getElementById('profile-container').style.display = 'flex';
      document.getElementById('edit-profile-container').style.display = 'none';
      await loadProfileView(current_user.userId);
    } else {
      // Redirect to not-found page
      window.location.href = '/user-not-found.html';
    }
  }
}

async function loadProfileView(userId) {
  var current_user = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
      Authorization: 'Bearer ' + keycloak.token,
    },
    url: '/get-user-info',
    method: 'GET',
  });

  if (userId != current_user.userId) {
    document.getElementById('profile-edit-btn').remove();
  }

  var user = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    url: '/users/' + userId,
    method: 'GET',
  });

  document.getElementById('user-profile-avt').src = user.userAvt;
  document.getElementById('profile-info-username').textContent = user.userDisplayname;
  document.getElementById('profile-info-bio').textContent = user.userBio;

  var products = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    url: '/users/library/' + userId,
    method: 'GET',
  });

  $('#profile-activity-container').html('');
  var activity_html = '';

  if (products.length == 0) {
    document.getElementById('profile-activity-header').remove();
    document.getElementById('profile-activity-container').remove();
    const profile_ctn = document.getElementById('profile-info-container');
    profile_ctn.style.borderBottomRightRadius = '10px';
    profile_ctn.style.borderBottomLeftRadius = '10px';
  }

  for (let i = 0; i < products.length; i++) {
    const headerIdx = products[i].productDemos.findIndex((demo) => demo.productDemoTitle === 'header');
    const headerDemoUrl = products[i].productDemos[headerIdx].productDemoUrl;

    activity_html +=
      "<div class='activity-item'>" +
      "<img class='activity-product-image' src='" +
      headerDemoUrl +
      "' />" +
      "<div class='activity-product-name-container'>" +
      "<h3 class='activity-product-name'>" +
      products[i].productName +
      '</h3>' +
      '</div>' +
      "<div class='activity-product-right-col'>" +
      "<h3 class='activity-product-play-time'>0 hours on record</h3>" +
      "<h3 class='activity-product-last-play'>last played on 1 April</h3>" +
      '</div>' +
      '</div>';
  }
  $('#profile-activity-container').append(activity_html);
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

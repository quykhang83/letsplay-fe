import { keycloak, authenticateLogin } from './keycloakauth.js';
$(async function () {
  await authenticateLogin();
  if (keycloak.authenticated) {
    console.log('User is authenticated');
  } else {
    console.log('User is not authenticated! Calling authenticate function');
    console.log('Authentication status: ', keycloak.authenticated);
  }
  await initialized();
});
async function initialized() {
  await loadGameList();
}

async function loadGameList() {
  console.log("Loading game list");
  $('#game-list-result').html('');

  var product = $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + keycloak.token,
    },
    url: '/users' + '/library',
    method: 'GET',
  });

  product
    .then((data) => {
      console.log(data);
      var out = '';
      for (let i = 0; i < data.length; i++) {
        out +=
          "<div class='game-container'>" +
          "<div class='game-inlist-img'></div>" +
          "<div class='game-inlist-title'>" +
          '<h3>' +
          data[i].productName +
          '</h3>' +
          '</div> </div>';
      }
      $('#game-list-result').append(out);
    })
    .catch((err) => {
      console.log(err);
    });
}

import { keycloak, authenticateLogin } from './keycloakauth.js';

async function loadCartNumber() {
  const data = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
      Authorization: 'Bearer ' + keycloak.token,
    },
    url: '/users/' + 'cart',
    method: 'GET',
  });
  document.getElementById('cart-num-product').innerHTML = data.cartTotal;
}

async function loadUserInfoBar() {
  var user_info = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
      Authorization: 'Bearer ' + keycloak.token,
    },
    url: '/get-user-info',
    method: 'GET',
  });
  document.getElementById('user-name').textContent = user_info.username;
  document.getElementById('user-avatar').src = user_info.userAvt;
}

export { loadCartNumber, loadUserInfoBar};

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

async function initialized() {
  await Promise.all([loadAllCartItems()]);
  addClickListeners();
}

function addClickListeners() {
  // Remove product from cart button
  const elements = document.querySelectorAll('.cart-remove-product-btn');
  elements.forEach((element) => {
    element.addEventListener('click', async function () {
      const cartItem = this.closest('.cart-item');
      const cartItemId = cartItem.getAttribute('data-id');
      console.log(cartItemId);
      cartItem.remove();
      // Call API to remove product from cart
      await $.ajax({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/jsons',
          Authorization: 'Bearer ' + keycloak.token,
        },
        url: '/users/' + 'cart/product/' + cartItemId + '/remove',
        method: 'POST',
      });
      // Reload the total payment price
      const data = await $.ajax({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/jsons',
          Authorization: 'Bearer ' + keycloak.token,
        },
        url: '/users/' + 'cart',
        method: 'GET',
      });
      const formattedtotalPrice = data.cartPrice.toLocaleString('vi-VN');
      document.getElementById('total-price').textContent = formattedtotalPrice + 'đ';
      // Update UI if the number of product is cart is 0
      if (data.cartTotal == 0) {
        $('#cart-item-result').html('');
        var html = '';
        html +=
          "<div class='cart-item'>" +
          "<div class='cart-no-item-container'>" +
          "<h3 class='cart-no-item-header'>Visit store page to pick your favourite game</h3>" +
          '</div> </div>';
        $('#cart-item-result').append(html);
      }
    });
  });
}

async function loadAllCartItems() {
  $('#cart-item-result').html('');
  try {
    const data = await $.ajax({
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/jsons',
        Authorization: 'Bearer ' + keycloak.token,
      },
      url: '/users/' + 'cart',
      method: 'GET',
    });
    var html = '';
    if (data.cartTotal == 0) {
      html +=
        "<div class='cart-item'>" +
        "<div class='cart-no-item-container'>" +
        "<h3 class='cart-no-item-header'>Visit store page to pick your favourite game</h3>" +
        '</div> </div>';
    } else {
      for (let i = 0; i < data.cartDetails.length; i++) {
        const formattedproductPrice = data.cartDetails[i].productPrice.toLocaleString('vi-VN');

        html +=
          "<div class='cart-item' data-id='" +
          data.cartDetails[i].productId +
          "'>" +
          "<img class='cart-product-image' src='" +
          data.cartDetails[i].productDemo.productDemoUrl +
          "'/>" +
          "<div class='cart-product-name-container'>" +
          "<h3 class='cart-product-name'>" +
          data.cartDetails[i].productName +
          '</h3>' +
          '</div>' +
          "<div class='cart-product-right-col'>" +
          "<h3 class='cart-product-old-price'>9.999.999đ</h3>" +
          "<h3 class='cart-product-price'>" +
          formattedproductPrice +
          'đ</h3>' +
          "<button class='cart-remove-product-btn'>Remove</button>" +
          '</div> </div>';
      }
    }
    $('#cart-item-result').append(html);
    const formattedtotalPrice = data.cartPrice.toLocaleString('vi-VN');
    document.getElementById('total-price').textContent = formattedtotalPrice + 'đ';
  } catch (error) {
    console.error(error);
  }
}

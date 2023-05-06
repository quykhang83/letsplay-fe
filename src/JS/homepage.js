import { keycloak, authenticateLogin } from './keycloakauth.js';
import * as common from './common.js';

$(async function () {
  await keycloak
    .init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
    })
    .then((authenticated) => {
      console.log('Authentication status: ' + keycloak.authenticated);
      const loginBtn = document.getElementById('login_btn');
      if (keycloak.authenticated == true) {
        // Display profile button
        document.getElementById('profile-page-btn').style.display = 'flex';
        // Display user info button
        document.getElementById('user-info-btn').style.display = 'flex';

        // Display the design page button if user is manager
        if (keycloak.hasRealmRole('manager')) {
          document.getElementById('manage-btn').style.display = 'flex';
        } else {
          // Display library button
          document.getElementById('library-page-btn').style.display = 'flex';
          // Display go-to-cart icon
          document.getElementById('cart-btn').style.display = 'flex';
          common.loadCartNumber();
        }
        common.loadUserInfoBar();
        getUserProfile();
      } else {
        // Display login button
        loginBtn.style.display = 'flex';
      }
    })
    .catch((err) => {
      console.log(err);
    });
  await initialize();
  setTimeout(function () {
    $('#spinner-container').fadeOut();
  }, 500);
});

async function getUserProfile() {
  try {
    const profile = await keycloak.loadUserProfile();
  } catch (error) {
    console.log('Error loading user profile:', error);
  }
}

function addClickListeners() {}

async function initialize() {
  await Promise.all([loadAllProducts()]);
  addClickListeners();
  loadProductDiscountPrice();
}

async function loadAllProducts() {
  $('#product-result').html('');
  const types = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    url: '/product-types',
    method: 'GET',
  });
  // Sort types by alphabet
  types.sort((a, b) => a.productTypeName.localeCompare(b.productTypeName));

  var products;
  var out = '';
  for (let i = 0; i < types.length; i++) {
    if (types[i].productTypeName != '#') {
      const encodedProductTypeName = encodeURIComponent(types[i].productTypeName);

      products = await $.ajax({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        url: '/products?type=' + encodedProductTypeName,
        method: 'GET',
      });
      // Creating html data
      out += "<div class='item_set_container noselect'>";
      out += "<h3 class='set_label'>" + types[i].productTypeName + '</h3>' + "<div class='set_item'>";
      for (let j = 0; j < products.length; j++) {
        const header = products[j].productDemo;

        var headerUrl;
        if (header) {
          headerUrl = header.productDemoUrl;
        } else {
          headerUrl = '';
        }

        //Format product price to have dot according to VND
        const formattedproductPrice = products[j].productPrice.toLocaleString('vi-VN');
        out +=
          "<div class='item_ctn'><a href='product.html?product-id=" +
          products[j].productId +
          "' " +
          "style='text-decoration: none'>" +
          "<div class='item'>" +
          "<img src='" +
          headerUrl +
          "' alt='' />" +
          '</div>' +
          "<div class='item_name'>" +
          '<h3>' +
          products[j].productName +
          '</h3>' +
          '</div>' +
          "<div class='item_price'>" +
          "<h3 class='item_original_price'>" +
          formattedproductPrice +
          'đ</h3>';
        if (products[j].productPriceDiscount == null) {
          out += "<h3 class='item_discount_price'>0đ</h3>" + '</div>' + '</a></div>';
        } else {
          const formattedProductPriceDiscount = products[j].productPriceDiscount.toLocaleString('vi-VN');
          out += "<h3 class='item_discount_price'>" + formattedProductPriceDiscount + 'đ</h3>' + '</div>' + '</a></div>';
        }
      }
      // Close set-item
      out += '</div>';
      // Close item-set-container
      out += '</div>';
    }
  }
  $('#product-result').append(out);
}

function loadProductDiscountPrice() {
  const originalPrices = document.querySelectorAll('.item_original_price');
  const discountPrices = document.querySelectorAll('.item_discount_price');

  for (let i = 0; i < originalPrices.length; i++) {
    if (discountPrices[i].innerText !== '0đ') {
      originalPrices[i].classList.add('discount');
      discountPrices[i].classList.add('has_discount_price');
    }
  }
}

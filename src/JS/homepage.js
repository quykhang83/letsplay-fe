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
          document.getElementById('design-page-btn').style.display = 'flex';
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
  try {
    const data = await $.ajax({
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/jsons',
      },
      url: '/product-types',
      method: 'GET',
    });
    data.sort((a, b) => a.productTypeName.localeCompare(b.productTypeName));

    // Define an array to hold all the promises for each product type
    const promises = [];
    // Loop through the sorted data and add each $.ajax call to promises array
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      if (element.productTypeName != '#') {
        const encodedProductTypeName = encodeURIComponent(element.productTypeName);
        const promise = new Promise((resolve, reject) => {
          var out = '';
          out += "<div class='item_set_container'>";
          out += "<h3 class='set_label'>" + element.productTypeName + '</h3>' + "<div class='set_item'>";
          // Call to get products by type api
          $.ajax({
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/jsons',
            },
            url: '/products?type=' + encodedProductTypeName,
            method: 'GET',
            success: function (product_data) {
              product_data.forEach((product_element) => {
                const demo = product_element.productDemo;

                var demoUrl;
                if (demo) {
                  demoUrl = demo.productDemoUrl;
                } else {
                  demoUrl = '';
                }

                var product_out = '';

                //Format product price to have dot according to VND
                const formattedproductPrice = product_element.productPrice.toLocaleString('vi-VN');

                product_out +=
                  "<div class='item_ctn'><a href='product.html?product-id=" +
                  product_element.productId +
                  "' " +
                  "style='text-decoration: none'>" +
                  "<div class='item'>" +
                  "<img src='" +
                  demoUrl +
                  "' alt='' />" +
                  '</div>' +
                  "<div class='item_name'>" +
                  '<h3>' +
                  product_element.productName +
                  '</h3>' +
                  '</div>' +
                  "<div class='item_price'>" +
                  "<h3 class='item_original_price'>" +
                  formattedproductPrice +
                  'đ</h3>' +
                  "<h3 class='item_discount_price'>150.000đ</h3>" +
                  '</div>' +
                  '</a></div>';

                out += product_out;
              });

              // Close set-item
              out += '</div>';
              // Close item-set-container
              out += '</div>';
              resolve(out);
            },
            error: function (jqXHR, textStatus, errorThrown) {
              console.log('Error: ' + textStatus + ' - ' + errorThrown);
              reject(errorThrown);
            },
          });
        });
        promises.push(promise);
      }
    }
    // Wait for all promises to resolve before running these functions
    const htmlStrings = await Promise.all(promises);

    // Loop through the htmlStrings array and append each html string to the product-result element
    for (let i = 0; i < htmlStrings.length; i++) {
      const htmlString = htmlStrings[i];
      $('#product-result').append(htmlString);
    }
  } catch (error) {
    console.error(error);
  }
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

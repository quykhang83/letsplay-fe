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
          // Display receipt button
          document.getElementById('receipt_btn').style.display = 'flex';
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

async function initialize() {
  await Promise.all([loadAllDiscounts(), loadAllProducts()]);
  addClickListeners();
  loadProductDiscountPrice();
}

async function loadAllDiscounts() {
  $('#product-discount-result').html('');
  $('#product-discount-nav-result').html('');
  const discounts = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    url: '/discounts',
    method: 'GET',
  });

  var discount_html = '';
  var discount_nav_html = '';

  for (let i = 0; i < discounts.length; i++) {
    const discount = await $.ajax({
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      url: '/discounts/' + discounts[i].discountId,
      method: 'GET',
    });

    if (i == 0) {
      discount_html += "<div id='ctn-discount-" + discount.discountId + "' class='product-discount-container active'>";

      discount_nav_html +=
        "<button class='discount-nav-btn active' id='discount-nav-" +
        discount.discountId +
        "' data-target='#ctn-discount-" +
        discount.discountId +
        "'></button>";
    } else {
      discount_html += "<div id='ctn-discount-" + discount.discountId + "' class='product-discount-container'>";

      discount_nav_html +=
        "<button class='discount-nav-btn' id='discount-nav-" +
        discount.discountId +
        "' data-target='#ctn-discount-" +
        discount.discountId +
        "'></button>";
    }

    discount_html +=
      "<img class='product-discount-bg' src='" +
      discount.discountDescription +
      "' />" +
      "<div class='discount-header-right-ctn'>" +
      "<h3 class='discount-header-left discount-header'>" +
      discount.discountName +
      '</h3>' +
      '</div>' +
      "<div id='carousel-discount-" +
      discount.discountId +
      "' discount-id='" +
      discount.discountId +
      "' class='carousel slide' data-bs-ride='carousel'>" +
      "<div class='carousel-inner'>";

    for (let j = 0; j < discount.products.length; j++) {
      if (j == 0) {
        discount_html += "<div class='carousel-item active'>";
      } else {
        discount_html += "<div class='carousel-item'>";
      }

      discount_html +=
        "<a href='/product.html?product-id=" +
        discount.products[j].productId +
        "'>" +
        "<img src='" +
        discount.products[j].productDemo.productDemoUrl +
        "' class='d-block w-100' />" +
        '</a>' +
        '</div>';
    }

    discount_html +=
      '</div>' +
      "<button class='carousel-control-prev' type='button' data-bs-target='#carousel-discount-" +
      discount.discountId +
      "' data-bs-slide='prev'>" +
      "<span class='carousel-control-prev-icon' aria-hidden='true'></span>" +
      '</button>' +
      "<button class='carousel-control-next' type='button' data-bs-target='#carousel-discount-" +
      discount.discountId +
      "' data-bs-slide='next'>" +
      "<span class='carousel-control-next-icon' aria-hidden='true'></span>" +
      '</button>' +
      '</div>' +
      "<div class='discount-header-left-ctn'>" +
      "<h3 class='discount-header-right discount-header'>UP TO " +
      Math.floor(discount.discountPercent * 100) +
      '%</h3>' +
      '</div>' +
      '</div>';
  }

  $('#product-discount-result').append(discount_html);
  $('#product-discount-nav-result').append(discount_nav_html);
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

function addClickListeners() {
  // Get the navigation buttons and the carousel items
  const navButtons = document.querySelectorAll('#product-discount-nav-result button');
  const carouselItems = document.querySelectorAll('.product-discount-container');

  // Add a click listener to each navigation button
  navButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      navButtons.forEach((btn) => {
        btn.disabled = true;
      });

      var nextCarousel;
      var currentCarousel = document.querySelector('.product-discount-container.active');

      // The clicked item become the next item
      carouselItems.forEach((item, itemIndex) => {
        if (itemIndex === index) {
          nextCarousel = item;
        }
      });

      setTimeout(() => {
        currentCarousel.style.opacity = 0;
      }, 100);

      setTimeout(() => {
        currentCarousel.classList.remove('active');
        nextCarousel.style.opacity = 0;
        nextCarousel.classList.add('active');

        setTimeout(() => {
          nextCarousel.style.opacity = 1;
          navButtons.forEach((btn) => {
            btn.disabled = false;
          });
        }, 100);
      }, 500);

      // Make the clicked button active
      navButtons.forEach((btn, btnIndex) => {
        if (btnIndex === index) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    });
  });
}

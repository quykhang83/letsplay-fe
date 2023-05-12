import { keycloak, authenticateLogin } from './keycloakauth.js';
import * as common from './common.js';

$(async function () {
  await authenticateLogin();
  if (keycloak.authenticated) {
    console.log('Authentication status: ' + keycloak.authenticated);
    const loginBtn = document.getElementById('login_btn');
    if (keycloak.authenticated == true) {
      common.loadCartNumber();
      common.loadUserInfoBar();
    } else {
    }
  }
  await initialize();
  setTimeout(function () {
    $('#spinner-container').fadeOut();
  }, 500);
});

async function initialize() {
  await Promise.all([loadAllReceipts()]);
  addClickListeners();
}
async function loadAllReceipts() {
  const receipts = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
      Authorization: 'Bearer ' + keycloak.token,
    },
    url: '/receipts',
    method: 'GET',
  });
  $('#receipt-list').html('');
  var receipt_html = '';
  console.log(receipts);
  console.log('receipt length: ' + receipts.length);
  for (let i = 0; i < receipts.length; i++) {
    var receipt = receipts[i];

    const date = new Date(receipt.receiptDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const formattedDate = `${day}/${month}/${year}`;

    const formattedTotal = parseInt(receipt.receiptTotal).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    receipt_html +=
      "<div class='receipt'>" +
      "<div class='receipt-info'>" +
      "<h3 class='receipt-id'>Receipt code: #" +
      receipt.receiptId +
      '</h3>' +
      "<h3 class='receipt-date'>Purchase date: " +
      formattedDate +
      '</h3>' +
      "<h3 class='receipt-price'>Total price: " +
      formattedTotal +
      '</h3>' +
      '</div>' +
      "<div class='receipt-products'>";

    console.log('product length: ' + receipt.products.length);
    for (let j = 0; j < receipt.products.length; j++) {
      var product = receipt.products[j];
      console.log(product);

      const formattedPrice = parseInt(product.productPriceDiscount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
      receipt_html +=
        "<div class='product'>" +
        "<h3 class='product-name'>" +
        product.productName +
        '</h3>' +
        "<h3 class='product-price'>" +
        formattedPrice +
        '</h3>' +
        '</div>';
    }
    receipt_html += '</div> </div>';
  }
  $('#receipt-list').append(receipt_html);
}
function addClickListeners() {
  const receiptList = document.querySelector('#receipt-list');
  const receipts = receiptList.querySelectorAll('.receipt');

  receipts.forEach((receipt) => {
    receipt.addEventListener('click', (event) => {
      // Remove .expanded class from all receipts
      receipts.forEach((r) => {
        if (r !== receipt) {
          r.style.height = '50px';
          setTimeout(() => {
            r.classList.remove('expanded');
          }, 500);
        }
      });

      if (receipt.classList.contains('expanded')) {
        receipt.style.height = '50px';
        setTimeout(() => {
          receipt.classList.remove('expanded');
        }, 500);
      } else {
        const product_num = receipt.querySelectorAll('.product');
        const fit_content_length = 55 * product_num.length + 60;

        setTimeout(() => {
          receipt.style.height = `${fit_content_length}px`;
        }, 100);
        receipt.classList.add('expanded');
      }
    });
  });
}

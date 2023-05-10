import { keycloak, authenticateLogin } from './keycloakauth.js';

$(async function () {
  await authenticateLogin();
  if (keycloak.authenticated) {
    console.log('User is authenticated');

    if (keycloak.hasRealmRole('manager')) {
    } else {
    }
  } else {
    console.log('Authentication status: ', keycloak.authenticated);
  }
  await initialize();
  setTimeout(function () {
    $('#spinner-container').fadeOut();
  }, 500);
});

async function initialize() {
  await Promise.all([loadAllDiscounts()]);
  addClickListeners();
}

async function loadAllDiscounts() {
  $('#discount-container').html('');
  const discounts = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    url: '/discounts',
    method: 'GET',
  });

  var discount_html = '';

  for (let i = 0; i < discounts.length; i++) {
    const fromDate = new Date(discounts[i].fromDate);
    const toDate = new Date(discounts[i].toDate);

    const fromDayString = fromDate.getUTCDate().toString().padStart(2, '0');
    const fromMonthString = (fromDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const FromYearString = fromDate.getUTCFullYear().toString();

    const toDayString = toDate.getUTCDate().toString().padStart(2, '0');
    const toMonthString = (toDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const toYearString = toDate.getUTCFullYear().toString();

    const fromDateFinal = `${fromDayString}/${fromMonthString}/${FromYearString}`;
    const toDateFinal = `${toDayString}/${toMonthString}/${toYearString}`;

    discount_html +=
      "<div class='discount-program' discount-id='" +
      discounts[i].discountId +
      "'>" +
      "<img class='dp-bg-img' src='" +
      discounts[i].discountDescription +
      "' />" +
      "<div class='discount-header-container'>" +
      "<h3 class='discount-header'>" +
      discounts[i].discountName.toUpperCase() +
      '</h3>' +
      '</div>' +
      "<div class='discount-info'>" +
      "<h3 class='discount-percent'>Precent: " +
      discounts[i].discountPercent * 100 +
      '%</h3>' +
      "<h3 class='discount-from'>From: " +
      fromDateFinal +
      '</h3>' +
      "<h3 class='discount-to'>To: " +
      toDateFinal +
      '</h3>' +
      '</div>' +
      "<div class='discount-option-container'>" +
      "<i class='fas fa-trash-alt'></i>" +
      '</div> </div>';
  }

  discount_html += "<div id='add-discount'><i class='fas fa-plus'></i></div>";
  $('#discount-container').append(discount_html);
  discountProgramClickListeners();
  deleteDiscountClickListener();
}

async function loadEditDiscountView(discountId) {
  const discount = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    url: '/discounts/' + discountId,
    method: 'GET',
  });

  document.getElementById('discount-name').value = discount.discountName;
  document.getElementById('discount-percent').value = discount.discountPercent * 100;
  document.getElementById('discount-background').value = discount.discountDescription;
  const fromDateValue = new Date(Date.parse(discount.fromDate));
  const toDateValue = new Date(Date.parse(discount.toDate));
  document.getElementById('from-date-input').valueAsDate = fromDateValue;
  document.getElementById('to-date-input').valueAsDate = toDateValue;

  document.getElementById('edit-discount-save-btn').setAttribute('discount-id', discountId);

  // Current discount product list
  $('#edit-discount-product').html('');
  var product_html = "<h3 id='none-product-warning'>*At least 1 product must be selected</h3>";

  for (let i = 0; i < discount.products.length; i++) {
    var product = discount.products[i];
    product_html +=
      "<div class='product'>" +
      "<h3 class='product-name'>" +
      product.productName +
      '</h3>' +
      "<input type='checkbox' class='product-checkbox' data-product-id='" +
      product.productId +
      "' checked />" +
      '</div>';
  }

  // No discounnt product list
  const products = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    url: '/products',
    method: 'GET',
  });

  for (let i = 0; i < products.length; i++) {
    if (products[i].productPriceDiscount == null) {
      product_html +=
        "<div class='product'>" +
        "<h3 class='product-name'>" +
        products[i].productName +
        '</h3>' +
        "<input type='checkbox' class='product-checkbox' data-product-id='" +
        products[i].productId +
        "'/>" +
        '</div>';
    }
  }
  $('#edit-discount-product').append(product_html);
}
async function loaddAddDiscountView() {
  document.getElementById('discount-name').value = '';
  document.getElementById('discount-percent').value = '';
  document.getElementById('discount-background').value = '';
  document.getElementById('from-date-input').value = '';
  document.getElementById('to-date-input').value = '';

  // Product with no discount list
  $('#edit-discount-product').html('');
  var product_html = "<h3 id='none-product-warning'>*At least 1 product must be selected</h3>";
  const products = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    url: '/products',
    method: 'GET',
  });

  for (let i = 0; i < products.length; i++) {
    if (products[i].productPriceDiscount == null) {
      product_html +=
        "<div class='product'>" +
        "<h3 class='product-name'>" +
        products[i].productName +
        '</h3>' +
        "<input type='checkbox' class='product-checkbox' data-product-id='" +
        products[i].productId +
        "'/>" +
        '</div>';
    }
  }
  $('#edit-discount-product').append(product_html);
}

function addClickListeners() {
  const program_edit_view = document.getElementById('edit-discount-container');
  // Discount program close button
  const edit_close_btn = document.getElementById('edit-discount-close-btn');
  edit_close_btn.addEventListener('click', () => {
    program_edit_view.style.display = 'none';
    document.getElementById('none-product-warning').style.display = 'none';
  });
  // Add a new discount program btn
  const add_discout_btn = document.getElementById('add-discount');
  add_discout_btn.addEventListener('click', async () => {
    await loaddAddDiscountView();
    document.getElementById('edit-discount-save-btn').style.display = 'none';
    document.getElementById('add-discount-save-btn').style.display = 'flex';
    program_edit_view.style.display = 'flex';
  });
  // Edit discount save button
  editDiscountSaveBtnClickListener();
  editDiscountAddBtnClickListener();
}
function discountProgramClickListeners() {
  // Discount program
  const programs = document.querySelectorAll('.discount-program');
  const program_edit_view = document.getElementById('edit-discount-container');
  programs.forEach((program) => {
    program.addEventListener('click', async () => {
      await loadEditDiscountView(program.getAttribute('discount-id'));
      document.getElementById('edit-discount-save-btn').style.display = 'flex';
      document.getElementById('add-discount-save-btn').style.display = 'none';
      program_edit_view.style.display = 'flex';
    });
  });
}
function editDiscountSaveBtnClickListener() {
  const program_edit_view = document.getElementById('edit-discount-container');
  const save_btn = document.getElementById('edit-discount-save-btn');
  save_btn.addEventListener('click', async (event) => {
    const discount_id = save_btn.getAttribute('discount-id');
    const updatedDiscount = {};

    // Define arrays to hold checked and unchecked product IDs
    let checkedProducts = [];
    let uncheckedProducts = [];

    const products = document.querySelectorAll('.product');
    // Loop through each product
    products.forEach((product) => {
      // Get the checkbox element within the product
      const checkbox = product.querySelector('input[type="checkbox"]');
      // Get the value of the data-product-id attribute
      const productId = checkbox.getAttribute('data-product-id');
      // Check if the checkbox is checked and push the productId into the appropriate array
      if (checkbox.checked) {
        checkedProducts.push(productId);
      } else {
        uncheckedProducts.push(productId);
      }
    });

    if (checkedProducts.length > 0) {
      const discount = await $.ajax({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        url: '/discounts/' + discount_id,
        method: 'GET',
      });
      let currentProducts = [];
      for (let i = 0; i < discount.products.length; i++) {
        currentProducts.push(discount.products[i].productId.toString());
      }

      const discountName = document.getElementById('discount-name').value;
      const discountPercent = document.getElementById('discount-percent').value;
      const discountDescription = document.getElementById('discount-background').value;
      const fromDate = document.getElementById('from-date-input').value;
      const toDate = document.getElementById('to-date-input').value;

      // Check name
      if (discountName != discount.discountName) {
        updatedDiscount.discountName = discountName;
      }
      // Check percent
      if (discountPercent != discount.discountPercent * 100) {
        updatedDiscount.discountPercent = discountPercent / 100;
      }
      // Check background
      if (discountDescription != discount.discountDescription) {
        updatedDiscount.discountDescription = discountDescription;
      }
      const fromDateObject = new Date(fromDate);
      var day = fromDateObject.getDate().toString().padStart(2, '0');
      var month = (fromDateObject.getMonth() + 1).toString().padStart(2, '0');
      var year = fromDateObject.getFullYear().toString();
      const formattedFromDateString = `${year}-${month}-${day}T12:00:00+0700`;
      updatedDiscount.fromDate = formattedFromDateString;

      const toDateObject = new Date(toDate);
      day = toDateObject.getDate().toString().padStart(2, '0');
      month = (toDateObject.getMonth() + 1).toString().padStart(2, '0');
      year = toDateObject.getFullYear().toString();
      const formattedToDateString = `${year}-${month}-${day}T12:00:00+0700`;
      updatedDiscount.toDate = formattedToDateString;

      console.log(updatedDiscount);

      await $.ajax({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + keycloak.token,
        },
        url: '/discounts/' + save_btn.getAttribute('discount-id'),
        method: 'PATCH',
        dataType: 'json',
        data: JSON.stringify(updatedDiscount),
      });

      // Update discount product list

      // Print the arrays to the console to check if they contain the correct values
      console.log('Current Products: ', currentProducts);
      console.log('Checked Products:', checkedProducts);
      console.log('Unchecked Products:', uncheckedProducts);

      const toBeAddedProducts = checkedProducts.filter((productId) => !currentProducts.includes(productId));
      const toBeRemovedProducts = [];
      currentProducts.forEach((productId) => {
        if (uncheckedProducts.includes(productId)) {
          toBeRemovedProducts.push(productId);
        }
      });

      console.log('To be added products: ', toBeAddedProducts);
      console.log('To be removed products: ', toBeRemovedProducts);

      if (toBeAddedProducts.length != 0) {
        for (let i = 0; i < toBeAddedProducts.length; i++) {
          await $.ajax({
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + keycloak.token,
            },
            url: '/discounts/' + discount_id + '/save/product/' + toBeAddedProducts[i],
            method: 'POST',
          });
        }
      }

      if (toBeRemovedProducts.length != 0) {
        for (let i = 0; i < toBeRemovedProducts.length; i++) {
          await $.ajax({
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + keycloak.token,
            },
            url: '/discounts/' + discount_id + '/remove/product/' + toBeRemovedProducts[i],
            method: 'POST',
          });
        }
      }

      program_edit_view.style.display = 'none';
      document.getElementById('none-product-warning').style.display = 'none';
      loadAllDiscounts();
    } else {
      document.getElementById('none-product-warning').style.display = 'flex';
    }
  });
}
function editDiscountAddBtnClickListener() {
  const program_edit_view = document.getElementById('edit-discount-container');
  const add_btn = document.getElementById('add-discount-save-btn');
  add_btn.addEventListener('click', async (event) => {
    const newDiscount = {};
    // Define arrays to hold checked product IDs
    let checkedProducts = [];
    const products = document.querySelectorAll('.product');
    // Loop through each product
    products.forEach(async (product) => {
      // Get the checkbox element within the product
      const checkbox = product.querySelector('input[type="checkbox"]');
      // Get the value of the data-product-id attribute
      const productId = checkbox.getAttribute('data-product-id');
      // Check if the checkbox is checked and push the productId into the appropriate array
      if (checkbox.checked) {
        checkedProducts.push(productId);
      }
    });

    if (checkedProducts.length > 0) {
      const discountName = document.getElementById('discount-name').value;
      const discountPercent = document.getElementById('discount-percent').value;
      const discountDescription = document.getElementById('discount-background').value;
      const fromDate = document.getElementById('from-date-input').value;
      const toDate = document.getElementById('to-date-input').value;

      newDiscount.discountName = discountName;
      newDiscount.discountPercent = discountPercent / 100;
      newDiscount.discountDescription = discountDescription;

      const fromDateObject = new Date(fromDate);
      var day = fromDateObject.getDate().toString().padStart(2, '0');
      var month = (fromDateObject.getMonth() + 1).toString().padStart(2, '0');
      var year = fromDateObject.getFullYear().toString();
      const formattedFromDateString = `${year}-${month}-${day}T12:00:00+0700`;
      newDiscount.fromDate = formattedFromDateString;

      const toDateObject = new Date(toDate);
      day = toDateObject.getDate().toString().padStart(2, '0');
      month = (toDateObject.getMonth() + 1).toString().padStart(2, '0');
      year = toDateObject.getFullYear().toString();
      const formattedToDateString = `${year}-${month}-${day}T12:00:00+0700`;
      newDiscount.toDate = formattedToDateString;

      console.log(newDiscount);

      var add_new_discount = await $.ajax({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + keycloak.token,
        },
        url: '/discounts',
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify(newDiscount),
      });

      if (checkedProducts.length != 0) {
        for (let i = 0; i < checkedProducts.length; i++) {
          await $.ajax({
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + keycloak.token,
            },
            url: '/discounts/' + add_new_discount.discountId + '/save/product/' + checkedProducts[i],
            method: 'POST',
          });
        }
      }

      program_edit_view.style.display = 'none';
      document.getElementById('none-product-warning').style.display = 'none';
      loadAllDiscounts();
    } else {
      document.getElementById('none-product-warning').style.display = 'flex';
    }
  });
}
function deleteDiscountClickListener() {
  // Delete a discount program button
  const removes = document.querySelectorAll('.discount-option-container');
  removes.forEach((remove) => {
    remove.addEventListener('click', async (event) => {
      event.stopPropagation();
      const discountProgram = event.target.closest('.discount-program');
      const discountId = discountProgram.getAttribute('discount-id');

      await $.ajax({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + keycloak.token,
        },
        url: '/discounts/' + discountId,
        method: 'DELETE',
      });
      loadAllDiscounts();
    });
  });
}

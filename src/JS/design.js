import { keycloak, authenticateLogin } from './keycloakauth.js';
import * as common from './common.js';

let isNewProductType = true;

$(async function () {
  await authenticateLogin();
  if (keycloak.authenticated) {
    console.log('User is authenticated');

    if (keycloak.hasRealmRole('manager')) {
    } else {
    }
    common.loadUserInfoBar();
  } else {
    console.log('Authentication status: ', keycloak.authenticated);
  }
  await initialize();
  setTimeout(function () {
    $('#spinner-container').fadeOut();
  }, 500);
});

async function initialize() {
  await Promise.all([loadAllProducts()]);
}

async function loadAllProducts() {
  $('#product-result').html('');
  const types = await $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
    },
    url: '/product-types',
    method: 'GET',
  });
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
      out +=
        "<div class='item-set-container noselect'>" +
        "<div class='new-item-ctn'>" +
        "<div class='new-item' data-product-type='" +
        types[i].productTypeName +
        "' data-product-type-id ='" +
        types[i].productTypeId +
        "'>" +
        "<img src='/images/materials/edit.png' alt='' draggable='false'/>" +
        '</div> </div>' +
        "<div class='item-scroll-ctn'>" +
        "<h3 class='set_label'>" +
        types[i].productTypeName +
        '</h3>' +
        "<div class='set_item'>";

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
          "' alt='' draggable='false'/>" +
          '</div>' +
          "<div class='item_name'>" +
          '<h3>' +
          products[j].productName +
          '</h3>' +
          '</div>' +
          "<div class='item_price noselect'>" +
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
    }
    // Close set-item
    out += '</div>';
    // Close item-scroll-container
    out += '</div>';
    // Close item-set-container
    out += '</div>';
  }

  $('#product-result').append(out);

  // Remove event listener to avoid duplicating when added again
  const submitButton = document.querySelector('#submit-button');
  submitButton.removeEventListener('click', submitButtonClickListener);

  const addProductTypeBtn = document.querySelector('.add-item-ctn');
  addProductTypeBtn.removeEventListener('click', createProductTypeClickListener);

  const confirmDeleteYes = document.querySelector('#confirm-delete-yes-button');
  confirmDeleteYes.removeEventListener('click', deleteProductTypeClickListener);

  addClickListeners();
  loadProductDiscountPrice();
}

function loadProductDiscountPrice() {
  const originalPrices = document.querySelectorAll('.item_original_price');
  const discountPrices = document.querySelectorAll('.item_discount_price');
  // console.log(originalPrices);

  for (let i = 0; i < originalPrices.length; i++) {
    if (discountPrices[i].innerText !== '0đ') {
      originalPrices[i].classList.add('discount');
      discountPrices[i].classList.add('has_discount_price');
    }
  }
}

function loadProductSelection(productTypeName, productTypeId) {
  $('#product-selection-result').html('');

  var out = '';
  var requests = [];

  document.querySelector('#delete-button').style.display = 'none';

  if (isNewProductType == false) {
    document.querySelector('#delete-button').style.display = 'flex';

    // Encode the input product type name to avoid special characters
    const encodedProductTypeName = encodeURIComponent(productTypeName);

    var request1 = $.ajax({
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      url: '/products?type=' + encodedProductTypeName,
      method: 'GET',
    });
    requests.push(request1);
  }

  var request2 = $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    url: '/products?type=%23',
    method: 'GET',
  });
  requests.push(request2);

  Promise.all(requests).then(function (results) {
    // results is an array of the resolved values of the input promises
    if (isNewProductType == false) {
      var data1 = results[0];

      // Load product that is already of this type with check mark
      out = '';
      data1.forEach((element) => {
        out += "<div class='product'>";
        out += "<h3 class='product-detail'>" + element.productName + '</h3>';
        out += "<input type='checkbox' class='product-checkbox' data-product-id=" + element.productId + ' checked/>';
        out += '</div>';
      });
      $('#product-selection-result').append(out);
    }
    // Lod product that is of no type with uncheck mark
    var data2 = results[results.length - 1];

    out = '';
    data2.forEach((element) => {
      out += "<div class='product'>";
      out += "<h3 class='product-detail'>" + element.productName + '</h3>';
      out += "<input type='checkbox' class='product-checkbox' data-product-id=" + element.productId + ' />';
      out += '</div>';
    });
    $('#product-selection-result').append(out);
    const submitButton = document.getElementById('submit-button');
    if (isNewProductType == false) {
      submitButton.setAttribute('data-product-type', productTypeName);
      submitButton.setAttribute('data-product-type-id', productTypeId);
    }
  });
}

function addClickListeners() {
  const editProductTypeButtons = document.querySelectorAll('.new-item');
  const productSelection = document.querySelector('.product-selection-view');
  const darkFilter = document.querySelector('.dark-filter');
  // Add logic to edit product type button
  editProductTypeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      isNewProductType = false;
      productSelection.style.display = 'flex';
      darkFilter.style.zIndex = 9990;
      darkFilter.style.display = 'block';
      document.getElementById('no-checked-product').style.display = 'none';
      document.getElementById('empty-type-name').style.display = 'none';

      const productTypeName = button.getAttribute('data-product-type');
      const productTypeId = button.getAttribute('data-product-type-id');
      document.getElementById('confirm-delete-product-type-name').textContent = productTypeName;
      document.getElementById('product-type-name-edit-box').placeholder = productTypeName;
      // console.log(product_type);
      loadProductSelection(productTypeName, productTypeId);
    });
  });
  // Add logic to close edit product type button
  const closeButton = productSelection.querySelector('.close-button');
  closeButton.addEventListener('click', () => {
    productSelection.style.display = 'none';
    darkFilter.style.display = 'none';
  });
  // Add logic to delete product type button
  const deleteButton = document.querySelector('#delete-button');
  const confirmDeleteView = document.querySelector('.confirm-delete-type');
  deleteButton.addEventListener('click', () => {
    // Move dark filter to cover product selection view
    darkFilter.style.zIndex = 9992;
    confirmDeleteView.style.display = 'flex';
  });
  // Add logic to cancel delete product type button
  const confirmDeleteNo = document.querySelector('#confirm-delete-no-button');
  confirmDeleteNo.addEventListener('click', () => {
    darkFilter.style.zIndex = 9990;
    confirmDeleteView.style.display = 'none';
  });
  // Add logic to confirm delete product type button
  const confirmDeleteYes = document.querySelector('#confirm-delete-yes-button');
  confirmDeleteYes.addEventListener('click', deleteProductTypeClickListener);
  // Add logic to save product type edit button
  const submitButton = productSelection.querySelector('#submit-button');
  submitButton.addEventListener('click', submitButtonClickListener);

  // Add logic to create new product type button
  const addProductTypeBtn = document.querySelector('.add-item-ctn');
  addProductTypeBtn.addEventListener('click', createProductTypeClickListener);
}

async function deleteProductTypeClickListener() {
  const darkFilter = document.querySelector('.dark-filter');
  const confirmDeleteView = document.querySelector('.confirm-delete-type');
  const productSelection = document.querySelector('.product-selection-view');

  const submitButton = document.querySelector('#submit-button');
  const productTypeId = submitButton.getAttribute('data-product-type-id');

  var request = $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + keycloak.token,
    },
    url: '/product-types/' + productTypeId,
    method: 'DELETE',
    dataType: 'json',
  });

  await request;

  productSelection.style.display = 'none';
  darkFilter.style.display = 'none';
  confirmDeleteView.style.display = 'none';
  initialize();
}
function createProductTypeClickListener() {
  const productSelection = document.querySelector('.product-selection-view');
  const darkFilter = document.querySelector('.dark-filter');
  isNewProductType = true;
  productSelection.style.display = 'flex';
  darkFilter.style.zIndex = 9990;
  darkFilter.style.display = 'block';
  document.getElementById('no-checked-product').style.display = 'none';
  document.getElementById('empty-type-name').style.display = 'none';

  document.getElementById('product-type-name-edit-box').placeholder = '';
  loadProductSelection(null, null);
}
async function submitButtonClickListener(event) {
  const productSelection = document.querySelector('.product-selection-view');
  const darkFilter = document.querySelector('.dark-filter');
  const submitButton = productSelection.querySelector('#submit-button');
  // Get all checkboxes elements
  const checkboxes = document.querySelectorAll('.product-checkbox');

  let checkedProducts = [];
  let uncheckedProducts = [];
  if (isNewProductType == false) {
    // Append productID of checked and unchecked boxes to corresponding arrays
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        const productId = checkboxes[i].getAttribute('data-product-id');
        checkedProducts.push(productId);
      } else {
        const productId = checkboxes[i].getAttribute('data-product-id');
        uncheckedProducts.push(productId);
      }
    }
    // If no box is check then display warning and do nothing
    if (checkedProducts.length == 0) {
      document.getElementById('no-checked-product').style.display = 'block';
    } else {
      // Turn off product selection view
      productSelection.style.display = 'none';
      darkFilter.style.display = 'none';
      // Get the product type name previously stored in the submit button element
      const productTypeName = submitButton.getAttribute('data-product-type');
      const productTypeId = submitButton.getAttribute('data-product-type-id');
      // Ajax request to change type of all checked products to current type
      const checkedRequests = checkedProducts.map((productId) => {
        const data = {
          productTypeName: productTypeName,
        };
        return $.ajax({
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + keycloak.token,
          },
          url: '/products/' + productId,
          method: 'PATCH',
          dataType: 'json',
          data: JSON.stringify(data),
        });
      });
      // Ajax request to change type of all unchecked products to # type
      const uncheckedRequests = uncheckedProducts.map((productId) => {
        return $.ajax({
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + keycloak.token,
          },
          url: '/products/' + productId,
          method: 'PATCH',
          dataType: 'json',
          data: JSON.stringify({ productTypeName: '#' }),
        });
      });
      // Ajax request to change product type name if new product type name is detected
      const new_product_type_name = document.getElementById('product-type-name-edit-box').value;
      if ( (new_product_type_name != productTypeName) && (new_product_type_name != '')) {
        //Encode the new product type name
        // const encodedNewProductTypeName = encodeURIComponent(new_product_type_name);
        // const
        const data = {
          productTypeName: new_product_type_name,
          productTypeDescription: 'Nothing',
        };
        var changeProductTypeName = await $.ajax({
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + keycloak.token,
          },
          url: '/product-types/' + productTypeId,
          method: 'PATCH',
          dataType: 'json',
          data: JSON.stringify(data),
        });
      }

      try {
        await Promise.all(checkedRequests,uncheckedRequests);
        if (changeProductTypeName) {
          await changeProductTypeName;
        }
        await loadAllProducts();
      } catch (error) {
        console.error(error);
      }
    }
  } else {
    // Get the new product type name that is going to be created
    const newProductTypeName = document.getElementById('product-type-name-edit-box').value;
    // Loop through all checkboxes and stored productID of checked box
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        const productId = checkboxes[i].getAttribute('data-product-id');
        checkedProducts.push(productId);
      }
    }

    if (checkedProducts.length == 0 || newProductTypeName == '') {
      if (checkedProducts.length == 0) document.getElementById('no-checked-product').style.display = 'block';
      if (newProductTypeName == '') document.getElementById('empty-type-name').style.display = 'block';
    } else {
      // Turn off product selection view
      productSelection.style.display = 'none';
      darkFilter.style.display = 'none';
      // Create json body for create product type api
      let data = {
        productTypeName: newProductTypeName,
        productTypeDescription: 'Bah',
      };
      // Create a promise object to create new product type
      const createProductType = await $.ajax({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + keycloak.token,
        },
        url: '/product-types/',
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify(data),
      });
      // Create a promise object to add all checked product to the new type
      // const encodedNewProductTypeName = encodeURIComponent(newProductTypeName);
      const checkedRequests = checkedProducts.map(async (productId) => {
        console.log(newProductTypeName);
        const data = {
          productTypeName: newProductTypeName,
        };
        return await $.ajax({
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + keycloak.token,
          },
          url: '/products/' + productId,
          method: 'PATCH',
          dataType: 'json',
          data: JSON.stringify(data),
        });
      });

      try {
        await createProductType;
        await Promise.all(checkedRequests);
        await initialize();
      } catch (error) {
        console.error('An error occurred:', error);
      }

      // createProductType
      //   .then(() => {
      //     return Promise.all(checkedRequests);
      //   })
      //   .then(async () => {
      //     await initialize();
      //   })
      //   .catch((error) => {
      //     console.error('An error occurred:', error);
      //   });
    }
  }
}

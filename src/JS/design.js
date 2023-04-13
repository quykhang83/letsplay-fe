keycloak
  .init({
    onLoad: 'login-required',
    checkLoginIframe: false,
    promiseType: 'native',
  })
  .then(() => {
    localStorage.setItem('isLoggedIn', true);
  })
  .catch((error) => {
    alert('Something went wrong due to \n' + error);
  });

let isNewProductType = true;

$(function () {
  initialize();
});

function isLoggedIn() {
  return keycloak.authenticated;
}

function isTokenValid() {
  const expired = keycloak.isTokenExpired();
  return isLoggedIn() && !expired;
}

async function initialize() {
  $('#product-result').html('');
  try {
    const data = await loadAllProducts();
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
          out += "<div class='item-set-container noselect'>";

          out += "<div class='new-item-ctn'>";
          out += "<div class='new-item' data-product-type='" + element.productTypeName + "' data-product-type-id ='" + element.productTypeId + "'>";
          out += "<img src='/images/materials/edit.png' alt='' draggable='false'/>";
          out += '</div> </div>';

          out += "<div class='item-scroll-ctn'>";
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
                var product_out = '';

                //Format product price to have dot according to VND
                const formattedproductPrice = product_element.productPrice.toLocaleString('vi-VN');

                product_out +=
                  "<div class='item_ctn'><a href='product.html' style='text-decoration: none'>" +
                  "<div class='item'>" +
                  "<img src='/images/god_of_war_rng.jpg' alt='' draggable='false'/>" +
                  '</div>' +
                  "<div class='item_name'>" +
                  '<h3>' +
                  product_element.productName +
                  '</h3>' +
                  '</div>' +
                  "<div class='item_price noselect'>" +
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
              // Close item-scroll-container
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

    const submitButton = document.querySelector('#submit-button');
    submitButton.removeEventListener('click', submitButtonClickListener);

    addClickListeners();
    loadProductDiscountPrice();
  } catch (error) {
    console.error(error);
  }
}

function loadAllProducts() {
  return $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
    },
    url: '/product-types',
    method: 'GET',
  });
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

    var request1 = $.ajax({
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/jsons',
      },
      url: '/products?type=' + productTypeName,
      method: 'GET',
    });
    requests.push(request1);
  }

  var request2 = $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
    },
    url: '/products?type=%23',
    method: 'GET',
  });
  requests.push(request2);

  Promise.all(requests).then(function (results) {
    // results is an array of the resolved values of the input promises
    if (isNewProductType == false) {
      var data1 = results[0];

      // Do something with data1, data2, and data3
      out = '';
      data1.forEach((element) => {
        out += "<div class='product'>";
        out += "<h3 class='product-detail'>" + element.productName + '</h3>';
        out += "<input type='checkbox' class='product-checkbox' data-product-id=" + element.productId + ' checked/>';
        out += '</div>';
      });
      $('#product-selection-result').append(out);
    }

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
      darkFilter.style.display = 'block';

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
  const confirmDeleteNo = confirmDeleteView.querySelector('#confirm-delete-no-button');
  confirmDeleteNo.addEventListener('click', () => {
    darkFilter.style.zIndex = 9990;
    confirmDeleteView.style.display = 'none';
  });
  // Add logic to save product type edit button
  const submitButton = productSelection.querySelector('#submit-button');
  submitButton.addEventListener('click', submitButtonClickListener);

  // Add logic to create new product type button
  const addProductTypeBtn = document.querySelector('.add-item-ctn');
  addProductTypeBtn.addEventListener('click', () => {
    isNewProductType = true;
    productSelection.style.display = 'flex';
    darkFilter.style.display = 'block';

    document.getElementById('product-type-name-edit-box').placeholder = '';
    loadProductSelection(null, null);
  });
}

async function submitButtonClickListener(event) {
  const productSelection = document.querySelector('.product-selection-view');
  const darkFilter = document.querySelector('.dark-filter');
  const submitButton = productSelection.querySelector('#submit-button');
  // Turn off product selection view
  productSelection.style.display = 'none';
  darkFilter.style.display = 'none';
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
    // Get the product type name previously stored in the submit button elements

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
    let changeProductTypeName = null;
    const new_product_type_name = document.getElementById('product-type-name-edit-box').value;
    if (new_product_type_name != productTypeName && new_product_type_name != '') {
      //Encode the new product type name
      const encodedNewProductTypeName = encodeURIComponent(new_product_type_name);
      // const
      const data = {
        productTypeName: encodedNewProductTypeName,
        productTypeDescription: 'Nothing',
      };
      changeProductTypeName = $.ajax({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          // Authorization: "Bearer " + keycloak.token,
        },
        url: '/product-types/' + productTypeId,
        method: 'PATCH',
        dataType: 'json',
        data: JSON.stringify(data),
      });
    }

    try {
      await Promise.all(checkedRequests);
      await Promise.all(uncheckedRequests);
      if (changeProductTypeName) {
        await changeProductTypeName;
      }
      await initialize();
    } catch (error) {
      console.error(error);
    }
  } else {
    if (isTokenValid == false) {
      authenticateLogin();
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
      // Create json body for create product type api
      let data = {
        productTypeName: newProductTypeName,
        productTypeDescription: 'Bah',
      };
      // Create a promise object to create new product type
      const createProductType = $.ajax({
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
      const checkedRequests = checkedProducts.map((productId) => {
        console.log(productId);
        const data = {
          productTypeName: newProductTypeName,
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

      createProductType
        .then(() => {
          return Promise.all(checkedRequests);
        })
        .then(async () => {
          console.log('Both promises have completed.');
          await initialize();
        })
        .catch((error) => {
          console.error('An error occurred:', error);
        });
    }
  }
}

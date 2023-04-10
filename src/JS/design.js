// Item dynamic price
$(function () {
  loadAllProducts(afterLoadAllProducts);
});

// const keycloak = new Keycloak('http://localhost/keycloak.json');
keycloak
  .init({
    onLoad: 'login-required',
    // redirectUri: window.location.origin + "/index.html",
    checkLoginIframe: false,
    promiseType: 'native',
  })
  .then(() => {
    console.log(keycloak.token);
    localStorage.setItem("isLoggedIn",true);
  })
  .catch((error) => {
    alert('Something went wrong due to \n' + error);
  });

function loadAllProducts(callback) {
  $('#product-result').html('');

  // Make a ajax request call
  var request = $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
    },
    url: '/product-types',
    method: 'GET',
  });

  request.done((data) => {
    // Sort the data by productTypeName
    data.sort((a, b) => a.productTypeName.localeCompare(b.productTypeName));

    const promises = [];

    // Loop through the sorted data and add each $.ajax call to promises array
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      const encodedProductTypeName = encodeURIComponent(element.productTypeName);
      // console.log(element.productTypeName);
      if (element.productTypeName != '#') {
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

    // Use Promise.all() to ensure that the promises are executed in the correct order
    Promise.all(promises)
      .then((results) => {
        results.forEach((result) => {
          $('#product-result').append(result);
        });
        callback();
      })
      .catch((error) => {
        console.log('Error: ' + error);
      });
  });
}

function getAllProducts() {
  var request = $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
    },
    url: '/products',
    method: 'GET',
  });
  request.done((data) => {
    console.log('Get products');
    data.forEach((element) => {
      console.log(element);
    });
  });
  request.fail((err) => {
    console.log(err);
  });
}

function afterLoadAllProducts() {
  const originalPrices = document.querySelectorAll('.item_original_price');
  const discountPrices = document.querySelectorAll('.item_discount_price');
  // console.log(originalPrices);

  for (let i = 0; i < originalPrices.length; i++) {
    if (discountPrices[i].innerText !== '0đ') {
      originalPrices[i].classList.add('discount');
      discountPrices[i].classList.add('has_discount_price');
    }
  }

  const addProductButtons = document.querySelectorAll('.new-item');
  const productSelection = document.querySelector('.product-selection-view');
  const darkFilter = document.querySelector('.dark-filter');
  // Add logic to edit product type button
  addProductButtons.forEach((button) => {
    button.addEventListener('click', () => {
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
  // Add logic to cancle delete product type button
  const submitButton = productSelection.querySelector('#submit-button');
  submitButton.addEventListener('click', async () => {
    // Turn off product selection view
    productSelection.style.display = 'none';
    darkFilter.style.display = 'none';
    // Get all checkboxes elements
    const checkboxes = document.querySelectorAll('.product-checkbox');

    let checkedProducts = [];
    let uncheckedProducts = [];
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
    // Get the submit button
    const submitButton = document.getElementById('submit-button');
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
          Authorization: "Bearer " + keycloak.token,
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
          Authorization: "Bearer " + keycloak.token,
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
      // execute code that depends on promise1
      await Promise.all(uncheckedRequests);
      // execute code that depends on promise2
      if (changeProductTypeName) {
        await changeProductTypeName;
      }
      // execute code that depends on promise3
    } catch (error) {
      console.error(error);
    }
    location.reload();
  });
}

function loadProductSelection(productTypeName, productTypeId) {
  $('#product-selection-result').html('');

  var out = '';

  // Make a ajax request call
  var request1 = $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
    },
    url: '/products?type=' + productTypeName,
    method: 'GET',
  });

  var request2 = $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
    },
    url: '/products?type=%23',
    method: 'GET',
  });

  Promise.all([request1, request2]).then(function (results) {
    // results is an array of the resolved values of the input promises
    var data1 = results[0];
    var data2 = results[1];

    // Do something with data1, data2, and data3
    out = '';
    data1.forEach((element) => {
      out += "<div class='product'>";
      out += "<h3 class='product-detail'>" + element.productName + '</h3>';
      out += "<input type='checkbox' class='product-checkbox' data-product-id=" + element.productId + ' checked/>';
      out += '</div>';
    });
    $('#product-selection-result').append(out);

    out = '';
    data2.forEach((element) => {
      out += "<div class='product'>";
      out += "<h3 class='product-detail'>" + element.productName + '</h3>';
      out += "<input type='checkbox' class='product-checkbox' data-product-id=" + element.productId + ' />';
      out += '</div>';
    });
    $('#product-selection-result').append(out);
    const submitButton = document.getElementById('submit-button');
    submitButton.setAttribute('data-product-type', productTypeName);
    submitButton.setAttribute('data-product-type-id', productTypeId);
  });
}

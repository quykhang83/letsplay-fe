// Item dynamic price
$(function () {
  loadAllProducts(afterLoadAllProducts);
  console.log(keycloak.token);
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
          out += "<div class='new-item' data-product-type=" + element.productTypeName + '>';
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
  const closeButton = productSelection.querySelector('.close-button');
  const submitButton = productSelection.querySelector('.submit-button');
  const darkFilter = document.querySelector('.dark-filter');

  addProductButtons.forEach((button) => {
    button.addEventListener('click', () => {
      productSelection.style.display = 'flex';
      darkFilter.style.display = 'block';

      var product_type = button.getAttribute('data-product-type');
      // console.log(product_type);
      loadProductSelection(product_type);
    });
  });

  closeButton.addEventListener('click', () => {
    productSelection.style.display = 'none';
    darkFilter.style.display = 'none';
  });
  submitButton.addEventListener('click', () => {
    productSelection.style.display = 'none';
    darkFilter.style.display = 'none';
    // const token = keycloak.token;
    const checkboxes = document.querySelectorAll('.product-checkbox');

    let checkedProducts = [];
    let uncheckedProducts = [];

    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].checked) {
        const productId = checkboxes[i].getAttribute('data-product-id');
        checkedProducts.push(productId);
      }
      else{
        const productId = checkboxes[i].getAttribute('data-product-id');
        uncheckedProducts.push(productId);
      }
    }

    const submitButton = document.getElementById('submit-button');
    var productType = submitButton.getAttribute('data-product-type');
    console.log(productType);
    
    const checkedRequests = checkedProducts.map((productId) => {
      const data = {
        productTypeName: productType
      };
      return $.ajax({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: "Bearer " + keycloak.token,
        },
        url: '/products/' + productId,
        method: 'PATCH',
        dataType: "json",
        data: JSON.stringify(data),
      });
    });
    
    const uncheckedRequests = uncheckedProducts.map((productId) => {
      return $.ajax({
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: "Bearer " + keycloak.token,
        },
        url: '/products/' + productId,
        method: 'PATCH',
        dataType: "json",
        data: JSON.stringify({ productTypeName: "#"}),
      });
    });
    
    Promise.all([...checkedRequests, ...uncheckedRequests])
      .then(() => {
        location.reload(true);
      })
      .catch((error) => {
        console.error(error);
      });
    
  });
}

function loadProductSelection(productType) {
  $('#product-selection-result').html('');

  var out = '';

  // Make a ajax request call
  var request1 = $.ajax({
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/jsons',
    },
    url: '/products?type=' + productType,
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

  Promise.all([request1, request2]).then(function(results) {
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
    submitButton.setAttribute('data-product-type', productType);
  });
}

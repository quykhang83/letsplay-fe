const originalPrices = document.querySelectorAll('.item_original_price');
const discountPrices = document.querySelectorAll('.item_discount_price');
console.log(originalPrices);

for (let i = 0; i < originalPrices.length; i++) {
    if (discountPrices[i].innerText !== '0đ') {
        console.log('Discount price is not zero:', discountPrices[i].innerText);
        originalPrices[i].classList.add('discount');
        discountPrices[i].classList.add('has_discount_price');
    } else {
        console.log('Discount price is zero:', discountPrices[i].innerText);
    }
}
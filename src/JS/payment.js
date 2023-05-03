// Get the countdown-number h3 tag
const countdownEl = document.getElementById('countdown-number');
// Set the initial countdown value
let countdownValue = 10;
// Create a function to update the countdown value and redirect to another page when it reaches 0
function countdown() {
  // Update the countdown value
  countdownValue--;
  countdownEl.innerText = countdownValue;

  // Check if the countdown has reached 0
  if (countdownValue === 0) {
    // Redirect to another page
    window.location.href = '/index.html';
  }
}
// Start the countdown timer
setInterval(countdown, 1000);

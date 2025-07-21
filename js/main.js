const form = document.getElementById("registrationForm");
const message = document.getElementById("message");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  
  // Debug: Let's see what elements we're getting
  console.log("Form found:", form);
  console.log("Message found:", message);
  
  const cafeName = document.getElementById("cafeName").value.trim();
  const address = document.getElementById("address").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const website = document.getElementById("website").value.trim();
  const hours = document.getElementById("hours").value.trim();
  const seats = document.getElementById("seats").value.trim();
  const outlets = document.getElementById("outlets").value.trim();
  const noise = document.getElementById("noise").value;
  const ownerName = document.getElementById("ownerName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const description = document.getElementById("description").value.trim();
  const amenities = document.getElementById("amenities").value.trim();

  // Debug: Let's see what values we're getting
  console.log("Values:", {cafeName, address, phone, noise, ownerName});
  
  // Check required fields
  if (
    !cafeName || !address || !phone || !hours || !seats || !outlets || !noise ||
    !ownerName || !email || !password || !confirmPassword || !description || !amenities
  ) {
    message.textContent = "❗ Please complete all required fields.";
    message.className = "error";
    console.log("Showing error message");
    return;
  }
  
  if (password !== confirmPassword) {
    message.textContent = "❗ Passwords do not match.";
    message.className = "error";
    return;
  }
  
  // On success
  message.textContent = "✅ Cafe registered successfully!";
  message.className = "success";
  
  // Save data to localStorage
const cafes = JSON.parse(localStorage.getItem("cafes")) || [];
cafes.push({
  cafeName,
  address,
  phone,
  website,
  hours,
  seats,
  outlets,
  noise,
  ownerName,
  email,
  description,
  amenities,
});
localStorage.setItem("cafes", JSON.stringify(cafes));

// Redirect to fusettes.html after 1.5 seconds
setTimeout(() => {
  window.location.href = "fusettes.html";
}, 1500);

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


// Favorites
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('favorites-container');
  if (!container) return;

  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

  if (favorites.length === 0) {
    container.innerHTML = '<p style="font-size: 1.2rem; margin: 2rem auto;">No favorite cafes yet.</p>';
    return;
  }

  favorites.forEach(cafe => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="../../detail/images/${cafe.images[0].src}" alt="${cafe.images[0].alt}" />
      <div class="card-content">
        <h4>${cafe.name}</h4>
        <p><strong>Location:</strong> ${cafe.address}</p>
        <p><strong>Rating:</strong> ${cafe.rating || 'N/A'}</p>
        <p><strong>Tags:</strong> ${cafe.amenities}</p>
        <button class="remove-btn" onclick="removeFromFavorites('${cafe.id}')">Remove</button>
      </div>
    `;

    container.appendChild(card);
  });
});

function removeFromFavorites(cafeId) {
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  favorites = favorites.filter(f => f.id !== cafeId);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  window.location.reload();
}

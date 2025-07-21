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
  const favButtons = document.querySelectorAll('.fav-toggle');

  favButtons.forEach(btn => {
    const cafeId = btn.dataset.cafeId;
    if (isFavourited(cafeId)) {
      btn.textContent = '❤️';
      btn.setAttribute('aria-label', 'Remove from favourites');
    }

    btn.addEventListener('click', () => {
      if (!isLoggedIn()) {
        window.location.href = '../login.html';
        return;
      }

      if (isFavourited(cafeId)) {
        removeFavourite(cafeId);
        btn.textContent = '🤍';
        btn.setAttribute('aria-label', 'Add to favourites');
        showToast('Removed from favourites');
      } else {
        saveFavourite(cafeId);
        btn.textContent = '❤️';
        btn.setAttribute('aria-label', 'Remove from favourites');
        showToast('Added to favourites');
      }
    });
  });

  function isLoggedIn() {
    // Replace with actual auth check
    return localStorage.getItem('userLoggedIn') === 'true';
  }

  function isFavourited(id) {
    const favs = JSON.parse(localStorage.getItem('favourites') || '[]');
    return favs.includes(id);
  }

  function saveFavourite(id) {
    const favs = JSON.parse(localStorage.getItem('favourites') || '[]');
    if (!favs.includes(id)) {
      favs.push(id);
      localStorage.setItem('favourites', JSON.stringify(favs));
    }
  }

  function removeFavourite(id) {
    let favs = JSON.parse(localStorage.getItem('favourites') || '[]');
    favs = favs.filter(fid => fid !== id);
    localStorage.setItem('favourites', JSON.stringify(favs));
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = '#cd7f32';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '10px';
    toast.style.zIndex = '999';
    toast.style.fontWeight = '600';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
});

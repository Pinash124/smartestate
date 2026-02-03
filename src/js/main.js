// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Close mobile menu when clicking on links
  const mobileLinks = document.querySelectorAll('#mobile-menu a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.add('hidden');
    });
  });

  // Search functionality
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      const transactionType = document.getElementById('transaction-type').value;
      const propertyType = document.getElementById('property-type').value;
      const location = document.getElementById('location').value;
      
      console.log('Search:', {
        transactionType,
        propertyType,
        location
      });
      // Implement search logic here
    });
  }

  // Favorite button toggle
  const favoriteButtons = document.querySelectorAll('.favorite-btn');
  favoriteButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      this.querySelector('svg').classList.toggle('fill-red-500');
      this.querySelector('svg').classList.toggle('fill-none');
    });
  });
});

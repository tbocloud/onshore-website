
window.addEventListener("scroll", function(){
    var header = this.document.querySelector("nav");
    header.classList.toggle("header-scrolled", window.scrollY > 50)
})



/*=============== SHOW MENU ===============*/
const showMenu = (toggleId, navId) =>{
   const toggle = document.getElementById(toggleId),
         nav = document.getElementById(navId)

   // Check if elements exist before adding listeners
   if (toggle && nav) {
       toggle.addEventListener('click', () =>{
           // Add show-menu class to nav menu
           nav.classList.toggle('show-menu')
           // Add show-icon to show and hide menu icon
           toggle.classList.toggle('show-icon')
       })
   }
}

showMenu('nav-toggle','nav-menu')




/*=============== PRODUCT FILTER ===============*/
const filterButtons = document.querySelectorAll('.products .nav button');
const productItems = document.querySelectorAll('.products .product');

if (filterButtons.length > 0 && productItems.length > 0) {
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filterValue = button.textContent.trim().toLowerCase();

            productItems.forEach(item => {
                // Get the category from the span inside the product card
                const categoryElement = item.querySelector('.product_cat');
                if (categoryElement) {
                    const category = categoryElement.textContent.trim().toLowerCase();
                    
                    if (filterValue === 'all' || category === filterValue) {
                        item.style.display = ''; // Restore grid display
                    } else {
                        item.style.display = 'none'; // Hide element
                    }
                }
            });
        });
    });
}

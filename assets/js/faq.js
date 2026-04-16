document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq_item');

    faqItems.forEach(item => {
        const header = item.querySelector('.faq_header');
        
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq_body').style.maxHeight = '0';
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                item.querySelector('.faq_body').style.maxHeight = '0';
            } else {
                item.classList.add('active');
                const body = item.querySelector('.faq_body');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });
});

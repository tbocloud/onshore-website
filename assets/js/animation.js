
        // Basic setup
        ScrollReveal({
            reset: true,        // animations run only once
            distance: '60px',    // how far elements move
            duration: 500,      // animation speed
            easing: 'ease-in-out',
            delay: 200           // delay before animation starts
        });

        ScrollReveal().reveal('.hero_title', {
            origin: 'bottom'
        });
        ScrollReveal().reveal('.hero_desc', {
            origin: 'bottom',
            duration: 800
        });
        ScrollReveal().reveal('.hero_btn', {
            origin: 'bottom',
            duration: 1000
        });
        ScrollReveal().reveal('.bbox_1', {
            scale: 0.85 ,
            duration:600
        });
        ScrollReveal().reveal('.bbox_2', {
            scale: 0.85 ,
            duration:800
        });
        ScrollReveal().reveal('.bbox_3', {
            scale: 0.85 ,
            duration:1000
        });
/* 
==========================================================================
   VERDANT – GALLERY & LIGHTBOX
========================================================================== 
*/

document.addEventListener('DOMContentLoaded', () => {
    // Gallery Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Active State
            filterBtns.forEach(b => {
                b.classList.remove('btn-primary', 'active');
                b.classList.add('btn-outline');
            });
            btn.classList.add('btn-primary', 'active');
            btn.classList.remove('btn-outline');

            const filter = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    setTimeout(() => item.style.opacity = '1', 10);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => item.style.display = 'none', 300);
                }
            });
        });
    });

    // Lightbox
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            const title = item.querySelector('h3').textContent;
            
            lightboxImg.src = img.src;
            lightboxCaption.textContent = title;
            
            window.openModal('lightboxModal');
        });
    });

    // Before & After Slider
    const baSlider = document.querySelector('.ba-slider');
    if (baSlider) {
        const before = baSlider.querySelector('.ba-before');
        const handle = baSlider.querySelector('.ba-handle');

        const moveSlider = (e) => {
            let x;
            if (e.type === 'touchstart') {
                x = e.touches[0].clientX - baSlider.getBoundingClientRect().left;
            } else {
                x = e.clientX - baSlider.getBoundingClientRect().left;
            }
            
            const width = baSlider.offsetWidth;
            if (x < 0) x = 0;
            if (x > width) x = width;

            const percentage = (x / width) * 100;
            before.style.width = percentage + '%';
            handle.style.left = percentage + '%';
        };

        baSlider.addEventListener('mousemove', moveSlider);
        baSlider.addEventListener('touchmove', moveSlider);
    }
});

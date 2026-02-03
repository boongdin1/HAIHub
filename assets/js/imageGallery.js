class ImageModalGallery {
    static modal = null;
    static activeInstance = null;

    constructor(selector, options = {}) {
        this.container = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;

        if (!this.container) return;

        this.options = {
            showIndicator: true,
            loop: true,
            keyboard: true,
            closeOnBackdrop: true,
            onOpen: null,
            onClose: null,
            onChange: null,
            ...options
        };

        this.images = [];
        this.currentIndex = 0;

        this._init();
    }

    _init() {
        this.images = Array.from(this.container.querySelectorAll('li img'));
        if (this.images.length === 0) return;

        if (!ImageModalGallery.modal) {
            this._createModal();
            this._bindGlobalEvents();
        }

        this._bindImageEvents();
    }

    _createModal() {
        const modal = document.createElement('div');
        modal.className = 'img-modal';
        modal.id = 'imgModalGallery';
        modal.innerHTML = `
            <div class="img-modal__inner">
                <button type="button" class="img-modal__close" aria-label="닫기"></button>
                <button type="button" class="img-modal__nav img-modal__nav--prev" aria-label="이전"></button>
                <img class="img-modal__image" src="" alt="">
                <button type="button" class="img-modal__nav img-modal__nav--next" aria-label="다음"></button>
                <div class="img-modal__indicator">
                    <span class="current">1</span> / <span class="total">1</span>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        ImageModalGallery.modal = modal;
        this._cacheElements();
    }

    _cacheElements() {
        const modal = ImageModalGallery.modal;
        ImageModalGallery.elements = {
            image: modal.querySelector('.img-modal__image'),
            closeBtn: modal.querySelector('.img-modal__close'),
            prevBtn: modal.querySelector('.img-modal__nav--prev'),
            nextBtn: modal.querySelector('.img-modal__nav--next'),
            indicator: modal.querySelector('.img-modal__indicator'),
            current: modal.querySelector('.img-modal__indicator .current'),
            total: modal.querySelector('.img-modal__indicator .total')
        };
    }

    _bindGlobalEvents() {
        const modal = ImageModalGallery.modal;
        const { closeBtn, prevBtn, nextBtn } = ImageModalGallery.elements;

        closeBtn.addEventListener('click', () => this._closeFromStatic());
        prevBtn.addEventListener('click', () => this._navigateFromStatic('prev'));
        nextBtn.addEventListener('click', () => this._navigateFromStatic('next'));

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                const instance = ImageModalGallery.activeInstance;
                if (instance?.options.closeOnBackdrop) {
                    instance.close();
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            const instance = ImageModalGallery.activeInstance;
            if (!instance || !modal.classList.contains('active')) return;
            if (!instance.options.keyboard) return;

            switch (e.key) {
                case 'Escape':
                    instance.close();
                    break;
                case 'ArrowLeft':
                    instance.prev();
                    break;
                case 'ArrowRight':
                    instance.next();
                    break;
            }
        });
    }

    _closeFromStatic() {
        ImageModalGallery.activeInstance?.close();
    }

    _navigateFromStatic(direction) {
        const instance = ImageModalGallery.activeInstance;
        if (!instance) return;
        direction === 'prev' ? instance.prev() : instance.next();
    }

    _bindImageEvents() {
        this.images.forEach((img, index) => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => this.open(index));
        });
    }

    open(index = 0) {
        const modal = ImageModalGallery.modal;
        const { indicator, total } = ImageModalGallery.elements;

        ImageModalGallery.activeInstance = this;
        this.currentIndex = index;

        indicator.style.display = this.options.showIndicator ? 'block' : 'none';
        total.textContent = this.images.length;

        this._updateImage();

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        this.options.onOpen?.call(this, this.currentIndex);
        return this;
    }

    close() {
        const modal = ImageModalGallery.modal;

        modal.classList.remove('active');
        document.body.style.overflow = '';

        this.options.onClose?.call(this, this.currentIndex);
        ImageModalGallery.activeInstance = null;

        return this;
    }

    prev() {
        if (this.options.loop) {
            this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        } else if (this.currentIndex > 0) {
            this.currentIndex--;
        }
        this._updateImage();
        return this;
    }

    next() {
        if (this.options.loop) {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
        } else if (this.currentIndex < this.images.length - 1) {
            this.currentIndex++;
        }
        this._updateImage();
        return this;
    }

    goTo(index) {
        if (index >= 0 && index < this.images.length) {
            this.currentIndex = index;
            this._updateImage();
        }
        return this;
    }

    _updateImage() {
        const { image, current, prevBtn, nextBtn } = ImageModalGallery.elements;
        const img = this.images[this.currentIndex];

        image.src = img.src;
        image.alt = img.alt || '';
        current.textContent = this.currentIndex + 1;

        if (!this.options.loop) {
            prevBtn.style.opacity = this.currentIndex === 0 ? '0.3' : '1';
            prevBtn.style.pointerEvents = this.currentIndex === 0 ? 'none' : 'auto';
            nextBtn.style.opacity = this.currentIndex === this.images.length - 1 ? '0.3' : '1';
            nextBtn.style.pointerEvents = this.currentIndex === this.images.length - 1 ? 'none' : 'auto';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.pointerEvents = 'auto';
            nextBtn.style.opacity = '1';
            nextBtn.style.pointerEvents = 'auto';
        }

        this.options.onChange?.call(this, this.currentIndex, img);
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    getCount() {
        return this.images.length;
    }

    getCurrentImage() {
        return this.images[this.currentIndex];
    }

    setOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        return this;
    }

    destroy() {
        this.images.forEach(img => {
            img.style.cursor = '';
            const clone = img.cloneNode(true);
            img.parentNode.replaceChild(clone, img);
        });

        if (ImageModalGallery.activeInstance === this) {
            this.close();
        }

        this.images = [];
        this.container = null;
    }
}
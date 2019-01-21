class Slidedown {
    constructor(parent) {
        this.element = document.createElement('div');
        this.element.id = 'slidedown';
        this.visible = false;

        this.parent = parent;
        this.parent.insertBefore(this.element, this.parent.firstChild);
    }
    down(parent) {
        this.visible = true;

        this.element.classList.add('slidedown-visible');
    }

    up() {
        this.visible = false;
        
        this.element.classList.remove('slidedown-visible');
    }
}






export default Slidedown;
/**
 *  Blocker is a transparent overlay that allows for click and drag.
 *  Blocker will disable click reaction when holding e.g. 'B'
 * */
class Blocker {
    constructor() {
        /* Lower element shows color */
        this.lowerElement = document.createElement('div');
        this.lowerElement.id = 'blocker-lower';
        this.lowerElement.classList.add('blocker');

        /* Upper element captures clicks */
        this.upperElement = document.createElement('div');
        this.upperElement.id = 'blocker-upper';
        this.upperElement.classList.add('blocker');

        this.created = false;
    }
    /** Turn Blocker instance on or off.
     *  Is being inserted after the first child of parent so that the slidedown element is always above blocker.
     * @param {string} parent - The parent to become the first child of.
     * @param {number} state - 0 (off); 1 (on);
     */
    setState(parent, state) {
        if (state) {
            parent.insertBefore(this.lowerElement, parent.childNodes[1]);
            parent.insertBefore(this.upperElement, this.lowerElement);
        } else {
            parent.removeChild(this.lowerElement);
            parent.removeChild(this.upperElement);
        }

        this.created = state;
    }
}

export default Blocker;

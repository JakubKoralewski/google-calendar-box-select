/**
 *  Blocker is a transparent overlay that allows for click and drag.
 *  Blocker will disable click reaction when holding e.g. 'B'
 * */
class Blocker {
    constructor() {
        this.element = document.createElement('div');
        this.element.id = 'blocker';
        this.created = false;
    }
    /** Turn Blocker instance on or off.
     *  Is being inserted after the first child of parent so that the slidedown element is always above blocker.
     * @param {string} parent - The parent to become the first child of.
     * @param {number} state - 0 (off); 1 (on);
     */
    setState(parent, state) {
        //console.log(`toggle blocker ${state ? 'on' : 'off'}`);
        state
            ? parent.insertBefore(this.element, parent.childNodes[1])
            : parent.removeChild(this.element);
        this.created = state;
    }
}

export default Blocker;

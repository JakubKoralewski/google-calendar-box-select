/* eslint-disable no-console */
/* global chrome:true */
/**
 * Provides user feedback for when the select button is being held.
 */

class Slidedown {
    constructor(parent) {
        this.element = document.createElement('div');

        this.insertHTML();

        this.element.id = 'slidedown';
        Slidedown.created = false;

        this.parent = parent;
    }

    /** Opens, slides down  */
    down() {
        this.element.classList.add('visible');
    }

    /** Closes, slides up  */
    up() {
        this.element.classList.remove('visible');
    }

    /** Appends slidedown as a parent of body and older (higher in tree) sibling of blocker.
     * @param {Element} parent Parent element
     */
    appendToDOM(parent) {
        console.log('appending slidedown to dom');
        parent.insertBefore(this.element, parent.firstChild);
    }

    /** Insert html from **slidedown.html** into the innerHTML property of the slidedown.element instance*/
    insertHTML() {
        // Element assigned to this.element and then reassigned because of function scope (this. doesn't work!)
        const element = this.element;
        let filePath = chrome.runtime.getURL('slidedown.html');

        let xhr = new XMLHttpRequest();
        xhr.open('GET', filePath, true);
        xhr.onreadystatechange = function() {
            if (this.readyState !== 4) return;
            if (this.status !== 200) return; // or whatever error handling you want
            element.innerHTML = this.responseText;
        };
        xhr.send();

        this.element = element;
    }
}

export default Slidedown;

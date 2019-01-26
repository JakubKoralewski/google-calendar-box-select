/**
 * Provides user feedback for when the select button is being held.
 */

class Slidedown {
	constructor(parent) {
		this.element = document.createElement('div');

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
		parent.insertBefore(this.element, parent.firstChild);
		this.insertHTML();
	}

	/** Insert html from **slidedown.html** into the innerHTML property of the slidedown.element instance*/
	insertHTML() {
		let selectModeActiveText = chrome.i18n.getMessage('selectModeActive');
		this.element.innerHTML = `<p>${selectModeActiveText}</p>`;
		console.log(`this.element.offsetWidth: ${this.element.offsetWidth}`);
		this.element.style.marginLeft = (-this.element.offsetWidth / 2).toString() + 'px';
	}
}

export default Slidedown;

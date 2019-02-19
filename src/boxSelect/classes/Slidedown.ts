/* Google Calendar Box Select | MIT License | Copyright (c) 2019 Jakub Koralewski */
/**
 * Provides user feedback for when the select button is being held.
 */
export class Slidedown {
	public static created: boolean;
	public element: HTMLElement;

	constructor() {
		this.element = document.createElement('div');
		this.element.id = 'slidedown';
		Slidedown.created = false;
	}

	/** Opens, slides down  */
	public down() {
		this.element.classList.add('visible');
	}

	/** Closes, slides up  */
	public up() {
		this.element.classList.remove('visible');
	}

	/** Appends slidedown as a parent of body and older (higher in tree) sibling of blocker.
	 * @param {HTMLElement} parent Parent element
	 */
	public appendToDOM(parent: HTMLElement) {
		parent.insertBefore(this.element, parent.firstChild);
		this.insertHTML();
	 }

	/** Insert html from **slidedown.html** into the innerHTML property of the slidedown.element instance */
	public insertHTML() {
		const selectModeActiveText = chrome.i18n.getMessage('selectModeActive');
		this.element.innerHTML = `<p>${selectModeActiveText}</p>`;
		console.log(`this.element.offsetWidth: ${this.element.offsetWidth}`);
		this.element.style.marginLeft = (-this.element.offsetWidth / 2).toString() + 'px';
	}
}

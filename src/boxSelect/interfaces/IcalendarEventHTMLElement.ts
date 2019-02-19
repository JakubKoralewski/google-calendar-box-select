/* Google Calendar Box Select | MIT License | Copyright (c) 2019 Jakub Koralewski */
export interface IcalendarEventHTMLElement extends HTMLElement {
	dataset: {
		eventid: string;
	};
	oldColor?: string;
}

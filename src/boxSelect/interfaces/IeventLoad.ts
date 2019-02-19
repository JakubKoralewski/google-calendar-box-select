/* Google Calendar Box Select | MIT License | Copyright (c) 2019 Jakub Koralewski */
export interface IeventLoadCustomEvent extends CustomEvent {
	detail: string;
}

export interface IsingleEventLoad extends Array<number | string> {
	[index: number]: string;
}

export interface IrawEventData {
	[index: number]: any;

	/** event id  */
	[0]: string;

	/** title  */
	[1]: string;

	/** start date timestamp  */
	[2]: string;

	/** end date timestamp  */
	[3]: string;
}

export interface IeventData {
	eid: string;
	startDate: string;
	endDate: string;
	title: string;
}

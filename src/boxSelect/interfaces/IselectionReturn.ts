import { IcalendarEventHTMLElement } from '..';

export interface IselectionReturn {
	newSelectedEvents: Set<IcalendarEventHTMLElement>;
	selectedEventsIds: string[];
}

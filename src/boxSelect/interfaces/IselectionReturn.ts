/* Google Calendar Box Select | MIT License | Copyright (c) 2019 Jakub Koralewski */
import { IcalendarEventHTMLElement } from '..';

export interface IselectionReturn {
	newSelectedEvents: Set<IcalendarEventHTMLElement>;
	selectedEventsIds: string[];
}

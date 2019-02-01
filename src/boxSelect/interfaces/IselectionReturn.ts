import { IcalendarEventHTMLElement } from '..';

interface IselectionReturn {
	newSelectedEvents: Set<IcalendarEventHTMLElement>;
	selectedEventsIds: string[];
}

export default IselectionReturn;

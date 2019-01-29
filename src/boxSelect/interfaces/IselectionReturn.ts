import IcalendarEventHTMLElement from './IcalendarEventHTMLElement';

interface IselectionReturn {
	newSelectedEvents: Set<IcalendarEventHTMLElement>;
	selectedEventsIds: string[];
}

export default IselectionReturn;

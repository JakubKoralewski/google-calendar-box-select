import Idetail from '../boxSelect/interfaces/Idetail';

let events = JSON.parse((window as any).INITIAL_DATA[2][2][0]);
events = events.map((event: string[]) => {
	const data = JSON.parse(event[1]);

	return {
		eid: data[0],
		title: data[1],
		startDate: data[2],
		endDate: data[3]
	} as Idetail;
});

window.dispatchEvent(
	new CustomEvent('injectedScriptInitialData', { detail: events })
);

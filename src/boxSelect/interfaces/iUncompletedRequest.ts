// import CalendarEvent from '../classes/CalendarEvent';

export interface IuncompletedRequest {
	onBeforeRequest: {
		requestBody: {
			formData: {
				action: [string];
				cwuik: [string];
				dates: [string];
				eid: [string];
				eref: [string];
				hl: [string];
				nopts: string[];
				output: [string];
				scp: [string];
				secid: [string];
				sf: [string];
				useproto: [string];

			};
		};
		url: string;
	};
	onSendHeaders: {
		method: string;
		requestHeaders: [
			{
				name: string;
				value: string;
			}
		];
	};
	requestId: string;
}

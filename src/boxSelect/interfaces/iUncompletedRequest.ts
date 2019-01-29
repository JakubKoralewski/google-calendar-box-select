// import CalendarEvent from '../classes/CalendarEvent';

export interface IUncompletedRequest {
	onBeforeRequest: {
		requestBody: {
			formData: {
				eid: [string];
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

export default IUncompletedRequest;
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

export interface IloadFormData {
	/** "Europe/Warsaw"  */
	ctz: [string];
	/** "2" */
	cwuik: [string];
	/** "I2NvbnRhY3RzQGdyb3VwLnYuY2FsZW5kYXIuZ29vZ2xlLmNvbQ 20190120/20190321 63685150699
	 * amFrdWJrb3JhbGV3c2tpMDBAZ21haWwuY29t 20190120/20190321 63685150699
	 * cGwucG9saXNoI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t 20190120/20190321 63685150699"
	 */
	emf: [string];
	/** "en"  */
	hl: [string];
	/** 27 character? long string  */
	secid: [string];
	/** "true"  */
	useproto: [string];
}

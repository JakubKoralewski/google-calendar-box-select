import {
	calculateTimeOffset,
	CalendarEvent,
	ItimeOffset,
	IuncompletedRequest,
	SelectedEvents,
	timeTemplates
} from '..';

/** Turn object into serialized data.
 *  The object's value need to be an array.
 *  Specified eventId will replace the old one.
 * @param {{eventId: string, requestBody: Object}} data
 * @returns {string} serialized object
 */
function serialize(data: { eventId: string; requestBody: object }): string {
	const eventId = data.eventId;
	const obj = data.requestBody;

	return Object.keys(obj)
		.map(k => {
			return obj[k].map(value => {
				/* k = action */
				/* value = EDIT */
				if (k === 'eid') {
					value = eventId;
				}
				return encodeURIComponent(k) + '=' + value;
			});
		})
		.join('&');
}

/** Repeats a web request for selectedEvents. */
export function repeatWebRequest(
	selectedEvents: SelectedEvents,
	uncompletedRequest: IuncompletedRequest
) {
	console.log('repeatWebRequest');
	/* console.log(selectedEvents, uncompletedRequest); */

	/** Event that got sent originally */
	const originalEventId =
		uncompletedRequest.onBeforeRequest.requestBody.formData.eid[0];
	const requestBody = uncompletedRequest.onBeforeRequest.requestBody.formData;

	let deltaOffset: boolean | ItimeOffset = false;

	const originalEvent = selectedEvents.calendarEvents.find(
		(calendarEvent: CalendarEvent) => calendarEvent.eid === originalEventId
	);

	console.assert(originalEvent instanceof CalendarEvent);

	/* First find the original event to have the delta calculated for all events. */
	if (requestBody.hasOwnProperty('dates'))
		if (originalEvent.timestamp !== requestBody.dates[0]) {
			const newTime = requestBody.dates[0];

			deltaOffset = calculateTimeOffset(
				newTime,
				originalEvent.timestamp as string
			);
		}

	selectedEvents.calendarEvents.forEach((calendarEvent: CalendarEvent) => {
		const event = calendarEvent.element;
		const eventId = event.dataset.eventid;

		if (eventId === originalEventId) {
			/* No need to repeat action for event that actually triggered the action. */
			return;
		}
		console.group(`event${event.dataset.eventid}`);

		const newHeaders = {};
		const possibleHeaderValues = [
			'accept',
			'accept-language',
			'cache-control',
			'content-type',
			'pragma',
			'x-client-data',
			'x-if-no-redirect',
			'x-is-xhr-request'
		];

		const headers = uncompletedRequest.onSendHeaders.requestHeaders;
		for (const item of headers) {
			// debugger;
			if (possibleHeaderValues.includes(item.name.toLowerCase())) {
				newHeaders[item.name] = item.value;
			}
		}

		console.log('newHeaders:');
		console.log(newHeaders);

		if (deltaOffset) {
			// TODO: DRAGGING / change duration
			/* If new time applied */
			/* Get current time */
			/* Calculate delta offset */
			/* Offset rest like this too */

			// FIXME: old values are actually new values!????
			const oldValues = [calendarEvent.startDate, calendarEvent.endDate];

			for (const timeTemplate of timeTemplates) {
				for (const [index, startOrEnd] of ['start', 'end'].entries()) {
					const offset: number =
						deltaOffset[startOrEnd][timeTemplate.name];

					/* When particular offset of time is false no need to take action. */
					if (!offset) {
						continue;
					}

					// FIXME: oldValues undefined because event was created during the extension's life and it didnt catch the startDate and endDate
					const oldValue = parseInt(
						oldValues[index].substring(
							timeTemplate.start,
							timeTemplate.end
						),
						10
					);

					const newValue =
						oldValues[index].substring(0, timeTemplate.start) +
						padNumber(oldValue + offset) +
						oldValues[index].substring(timeTemplate.end);

					oldValues[index] = newValue;

					// debugger;
				}
			}

			requestBody.dates[0] = oldValues.join('/');
		}

		const newBody = serialize({ requestBody, eventId });

		const method = uncompletedRequest.onSendHeaders.method;
		/* Create copied web request settings*/
		const OPTIONS = {
			credentials: 'include',
			headers: {
				...newHeaders
			},
			method,
			referrer: location.href,
			body: newBody
		};

		console.log('OPTIONS:');
		console.log(OPTIONS);

		const requestURL = uncompletedRequest.onBeforeRequest.url;
		/* Send request */
		fetch(requestURL, OPTIONS as RequestInit).then(
			response => {
				console.log('fetch response:');
				console.log(response);
				/* debugger; */
			},
			reject => {
				console.warn('fetch reject:');
				console.log(reject);
			}
		);

		console.groupEnd();
	});
}

function padNumber(number: number, n?: number) {
	if (n == undefined) n = 2;
	return (new Array(n).join('0') + number).slice(-n);
}

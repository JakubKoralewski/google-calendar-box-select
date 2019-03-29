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
	console.group('repeatWebRequest');
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

		const requestURL = uncompletedRequest.onBeforeRequest.url;
		/* When deleting `requestURL = "https://calendar.google.com/calendar/deleteevent"` */
		if (requestURL.includes('deleteevent')) {
			/* Event is being deleted. Delete from events. */

			/* //FIXME: the original event actually stays in the DOM for some reason? */
			// TODO: delete events

			/* Remove from DOM. */
			if (event.parentNode) event.parentNode.removeChild(event);

			selectedEvents.remove(calendarEvent);
		}

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
			/* If new time applied */
			/* Get current time */
			/* Calculate delta offset */
			/* Offset rest like this too */

			const oldValues = [calendarEvent.startDate, calendarEvent.endDate];

			for (const timeTemplate of timeTemplates) {
				for (const [index, startOrEnd] of ['start', 'end'].entries()) {
					const offset: number =
						deltaOffset[startOrEnd][timeTemplate.name];

					/* When particular offset of time is false no need to take action. */
					if (!offset) {
						continue;
					}

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

		// const DEBUG = {OPTIONS, uncompletedRequest, newBody, requestBody, newHeaders};
		/* Send request */
		/* //FIXME: 503
		 happens when multiple events get sent at the same time */
		fetchRetry(requestURL, OPTIONS as RequestInit).then(
			response => {
				if (response.ok) {
					// fetchResponse(response);
				} else {
					/* Response failed! */
				}
			},
			reject => {
				console.error('fetch reject:');
				console.log(reject);
			}
		).catch(() => {
			console.error(
				`fetchRetry(url: ${requestURL}, OPTIONS: ${OPTIONS}, n ?= 5) failed
				trying multiple times to resend an event.`
				);
		});
		console.groupEnd();
		console.groupEnd();
	});
}

/** This aims to stop the 503/500 POST errors when multiple events are modified at the same time.
 *  The chosen solution is to try multiple times, and on each fail wait a bit longer and try again.
 */
async function fetchRetry(url: string, options: RequestInit, n: number = 5): Promise<Response> {
	try {
		return await fetch(url, options);
	} catch (err) {
		if (n === 1) throw err;
		/* The smaller the number the longer you should wait before retrying. */
		await sleep(1000 / n);
		console.log(`Fetch failed. Retrying for the ${n}-th time.`);
		return await fetchRetry(url, options, n - 1);
	}
}

function padNumber(number: number, n?: number) {
	if (n == undefined) n = 2;
	return (new Array(n).join('0') + number).slice(-n);
}

/* Stack Overflow ♡ */
function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

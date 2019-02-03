import { IuncompletedRequest, SelectedEvents } from '..';

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

	/* Event that got sent originally */
	const originalEventId =
		uncompletedRequest.onBeforeRequest.requestBody.formData.eid[0];
	selectedEvents.elements.forEach(event => {
		const eventId = event.dataset.eventid;
		/* No need to repeat action for event that actually triggered the action. */
		if (eventId === originalEventId) {
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

		const requestBody =
			uncompletedRequest.onBeforeRequest.requestBody.formData;
		// TODO: DRAGGING / change duration
		/* If new time applied */
		/* Get current time */
		/* Calculate delta offset */
		/* Offset rest like this too */
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
		fetch(requestURL, OPTIONS as RequestInit).then(response => {
			console.log(response);
		});

		console.groupEnd();
	});
}

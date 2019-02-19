/* Google Calendar Box Select | MIT License | Copyright (c) 2019 Jakub Koralewski */
import './img/icon-128.png';
import './img/icon-16.png';
import './img/icon-48.png';

chrome.webRequest.onBeforeRequest.addListener(
	details => {
		try {
			/* details.requestBody.formData.emf[0] || details.requestBody.formData.load[0]; */
			// tslint:disable-next-line: no-unused-expression
			details.requestBody.formData.eid;
		} catch (err) {
			console.log(err);
			console.log(details);
			return;
		}

		console.group('Before:', new Date(details.timeStamp));

		if (details.url.includes('calendar.google.com/calendar/ping')) {
			console.log(
				'%ccontains ping not sending to boxSelect!!!',
				'color: red'
			);
			console.log(details);
			console.groupEnd();
			return;
		}

		if (details.url.includes('load')) {
			chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
				chrome.tabs.sendMessage(tabs[0].id, {
					action: 'eventLoaded',
					details
				});
			});
			console.groupCollapsed('eventLoaded');
			console.log(details);
			console.groupEnd();
			console.groupEnd();
			return;
		}
		console.log(details);
		console.groupEnd();

		chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: 'onBeforeRequest',
				details
			});
		});
	},
	{ urls: ['*://calendar.google.com/*'] },
	['requestBody']
);

chrome.webRequest.onSendHeaders.addListener(
	details => {
		console.group('Send headers', new Date(details.timeStamp));

		/* if (details.url.includes('load')) {
			chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
				chrome.tabs.sendMessage(tabs[0].id, {
					action: 'containsLoadOnSendHeaders',
					details
				});
			});
			console.groupCollapsed('containsLoadOnSendHeaders');
			console.log(details);
			console.groupEnd();
			console.groupEnd();
			return;
		} */

		console.log(details);
		console.groupEnd();

		chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: 'onSendHeaders',
				details
			});
		});
	},
	{ urls: ['*://calendar.google.com/*'] },
	['requestHeaders']
);

chrome.webRequest.onCompleted.addListener(
	details => {
		console.group('Completed:', new Date(details.timeStamp));

		if (details.url.includes('load')) {
			chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
				chrome.tabs.sendMessage(tabs[0].id, {
					action: 'containsLoadOnCompleted',
					details
				});
			});
			console.groupCollapsed('containsLoadOnCompleted');
			console.log(details);
			console.groupEnd();
			console.groupEnd();
			return;
		}

		console.log(details);
		console.groupEnd();

		chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: 'onCompleted',
				details
			});
		});
	},
	{ urls: ['*://calendar.google.com/*'] },
	['responseHeaders']
);

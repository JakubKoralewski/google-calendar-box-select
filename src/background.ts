import './img/icon-128.png';
import './img/icon-16.png';
import './img/icon-48.png';

chrome.webRequest.onBeforeRequest.addListener(
	details => {
		console.log('Before:');
		console.log(new Date(details.timeStamp));
		console.log(details);

		details.requestBody.formData.eid[0] && chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
			chrome.tabs.sendMessage(tabs[0].id, { action: 'onBeforeRequest', details });
		});
	},
	{ urls: ['*://calendar.google.com/*'] },
	['requestBody']
);

chrome.webRequest.onSendHeaders.addListener(
	details => {
		console.log('Send headers:');
		console.log(new Date(details.timeStamp));
		console.log(details);

		chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
			chrome.tabs.sendMessage(tabs[0].id, { action: 'onSendHeaders', details });
		});
	},
	{ urls: ['*://calendar.google.com/*'] },
	['requestHeaders']
);

chrome.webRequest.onCompleted.addListener(
	function(details) {
		console.log('Completed:');
		console.log(new Date(details.timeStamp));
		console.log(details);

		chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
			chrome.tabs.sendMessage(tabs[0].id, { action: 'onCompleted', details });
		});

		if (details.url.includes('load')) {
			chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
				chrome.tabs.sendMessage(tabs[0].id, { action: 'containsLoadOnCompleted', details });
			});
		}
	},
	{ urls: ['*://calendar.google.com/*'] },
	['responseHeaders']
);

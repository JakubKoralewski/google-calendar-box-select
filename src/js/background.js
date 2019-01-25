import '../img/icon-16.png';
import '../img/icon-48.png';
import '../img/icon-128.png';

chrome.webRequest.onBeforeRequest.addListener(
	function(details) {
		console.log('Before:');
		console.log(new Date(details.timeStamp));
		console.log(details);

		try {
			// Check if that web request has an event id
			details.requestBody.formData.eid[0];
		} catch (err) {
			return;
		}

		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { action: 'onBeforeRequest', details });
		});
	},
	{ urls: ['*://calendar.google.com/*'] },
	['requestBody']
);

chrome.webRequest.onSendHeaders.addListener(
	function(details) {
		console.log('Send headers:');
		console.log(new Date(details.timeStamp));
		console.log(details);

		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
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

		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { action: 'onCompleted', details });
		});

		if (details.url.includes('load')) {
			chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { action: 'containsLoadonCompleted', details });
			});
		}
	},
	{ urls: ['*://calendar.google.com/*'] },
	['responseHeaders']
);

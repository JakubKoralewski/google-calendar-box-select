type RequestIdleCallbackHandle = any;
interface RequestIdleCallbackOptions {
	timeout: number;
}
interface RequestIdleCallbackDeadline {
	readonly didTimeout: boolean;
	timeRemaining: () => number;
}

interface Window {
	requestIdleCallback: (
		callback: (deadline: RequestIdleCallbackDeadline) => void,
		opts?: RequestIdleCallbackOptions
	) => RequestIdleCallbackHandle;
	cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void;
}

/*
intercept ping/load data
https://medium.com/@tarundugar1992/chrome-extension-intercepting-and-reading-the-body-of-http-requests-dd9ebdf2348b
*/

function interceptData() {
	const xhrOverrideScript = document.createElement('script');
	xhrOverrideScript.type = 'text/javascript';
	xhrOverrideScript.innerHTML = `
	(function() {
		const XHR = XMLHttpRequest.prototype;
		const send = XHR.send;
		const open = XHR.open;

		XHR.open = function(method, url) {
			this.url = url; // the request url
			return open.apply(this, arguments);
		};

		XHR.send = function() {
			this.addEventListener('load', function() {

				/* Events that are interesting for us are:
				- https://calendar.google.com/calendar/ping
				- https://calendar.google.com/calendar/load
				*/

				if (this.url.includes('load') || this.url.includes('ping')) {
					/* var dataDOMElement = document.createElement('div');
					dataDOMElement.id = '__interceptedData';
					dataDOMElement.innerText = this.response;
					dataDOMElement.style.height = 0;
					dataDOMElement.style.overflow = 'hidden';
					document.body.appendChild(dataDOMElement); */

					window.dispatchEvent(
						new CustomEvent('injectedScriptEventLoad', { detail: this.response })
					);
				}
			});
			return send.apply(this, arguments);
		};
	})();
	`;
	document.head.prepend(xhrOverrideScript);
}
function checkForDOM() {
	if (document.body && document.head) {
		interceptData();
	} else {
		window.requestIdleCallback(checkForDOM);
	}
}
window.requestIdleCallback(checkForDOM);

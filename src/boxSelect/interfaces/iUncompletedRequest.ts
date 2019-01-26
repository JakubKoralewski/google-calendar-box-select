interface iUncompletedRequest {
	selectedEvents: { dataset: { eventid: string; }; }[], uncompletedRequest: { onBeforeRequest: { requestBody: { formData: object; }; }; onSendHeaders: { method: string; }; }
}
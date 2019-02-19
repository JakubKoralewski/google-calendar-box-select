/* Google Calendar Box Select | MIT License | Copyright (c) 2019 Jakub Koralewski */
/* Query selector paths to elements associated with deleting an event. */
export const OK_PATH =
	'div.I7OXgf.dT3uCc.gF3fI.fNxzgd.Inn9w.iWO5td > div.OE6hId.J9fJmf > div > div.uArJ5e.UQuaGc.kCyAyd.l3F1ye.ARrCac.HvOprf.evJWRb.M9Bg4d';
export const TRASH_PATH =
	'#xDetDlg > div > div.Tnsqdc > div > div > div.pPTZAe > div:nth-child(2) > div';
/** CSS class that makes event element transparent. Used to indicate the original position of event before dragging it.  */
export const TRANSPARENT_CLASS = 'Sb44q';

/** The amount added to evtColor forming brColor.
 *  This is used for creating the gradient that's animating when select mode is on.
 */
export const BRIGHTEN_BY = 20;

/** To be replaced using string.replace() and regular expressions
 *  Could be done with ``eval('`' + GRADIENT + '`');`` as well
 * @param {string} evtColor old color
 * @param {string} brColor brightened, new color
 */
export const GRADIENT =
	'-webkit-linear-gradient(left, EVT_COLOR 0%, BRIGHTENED_COLOR 50%, EVT_COLOR 100%), linear-gradient(to right, EVT_COLOR 0%, BRIGHTENED_COLOR 50%, EVT_COLOR 100%)';

/** The specification for parsing ISO Datetime strings: e.g.: `20190204T141500`  */
export const timeTemplates = [
	{ name: 'year', start: 0, end: 4 },
	{ name: 'month', start: 4, end: 6 },
	{ name: 'day', start: 6, end: 8 },
	{ name: 'hour', start: 9, end: 11 },
	{ name: 'minutes', start: 11, end: 13 },
	{ name: 'seconds', start: 13, end: 15 }
];

/** `b` */
export let DEFAULT_SELECT_KEY = 'b';
/** `q` */
export let DEFAULT_DELETE_KEY = 'q';

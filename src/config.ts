/* Query selector paths to elements associated with deleting an event. */
export const OK_PATH =
	'div.I7OXgf.dT3uCc.gF3fI.fNxzgd.Inn9w.iWO5td > div.OE6hId.J9fJmf > div > div.uArJ5e.UQuaGc.kCyAyd.l3F1ye.ARrCac.HvOprf.evJWRb.M9Bg4d';
export const TRASH_PATH =
	'#xDetDlg > div > div.Tnsqdc > div > div > div.pPTZAe > div:nth-child(2) > div';

/** The amount added to evtColor forming brColor.  */
export const BRIGHTEN_BY = 20;

/** To be replaced using string.replace() and regular expressions
 *  Could be done with ``eval('`' + GRADIENT + '`');`` as well
 * @param {string} evtColor old color
 * @param {string} brColor brightened, new color
 */
export const GRADIENT =
	'-webkit-linear-gradient(left, EVT_COLOR 0%, BRIGHTENED_COLOR 50%, EVT_COLOR 100%), linear-gradient(to right, EVT_COLOR 0%, BRIGHTENED_COLOR 50%, EVT_COLOR 100%)';
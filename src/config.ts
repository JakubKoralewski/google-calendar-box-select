/* Query selector paths to elements associated with deleting an event. */
export const OK_PATH =
	'div.I7OXgf.dT3uCc.gF3fI.fNxzgd.Inn9w.iWO5td > div.OE6hId.J9fJmf > div > div.uArJ5e.UQuaGc.kCyAyd.l3F1ye.ARrCac.HvOprf.evJWRb.M9Bg4d';
export const TRASH_PATH =
	'#xDetDlg > div > div.Tnsqdc > div > div > div.pPTZAe > div:nth-child(2) > div';

/** The amount the evtColor gets increased by to form brColor.  */
export const BRIGHTEN_BY = 20;

/** To be replaced using string.replace()...
 * @param {string} evtColor old color
 * @param {string} brColor brightened, new color
 */
export const GRADIENT =
	'-webkit-linear-gradient(left, ${evtColor} 0%, ${brColor} 50%, ${evtColor} 100%), linear-gradient(to right, ${evtColor} 0%, ${brColor} 50%, ${evtColor} 100%)';

import { timeTemplates } from '..';

interface ItimeOffsetSingle {
	year: number;
	month: number;
	day: number;
	hour: number;
	minutes: number;
	seconds: number;
}

export interface ItimeOffset {
	start: ItimeOffsetSingle;
	end: ItimeOffsetSingle;
}

/**
 * @param timestamp1 e.g. 20190204T141501/20190204T141501
 * @param timestamp2 e.g. 20190204T141502/20190204T141502
 */
export function calculateTimeOffset(
	timestamp1: string,
	timestamp2: string
): ItimeOffset {
	/** generic return value object  */
	const rv = { start: {}, end: {} };

	const timestamp1dates = timestamp1.split('/');
	const newTime: any = {};
	/** The part of the timestamp before the slash of the new event.  */
	newTime.start = timestamp1dates[0];
	/** The part of the timestamp after the slash of the new event. */
	newTime.end = timestamp1dates[1];

	const timestamp2dates = timestamp2.split('/');
	const oldTime: any = {};
	/** The part of the timestamp before the slash of the old event.  */
	oldTime.start = timestamp2dates[0];
	/** The part of the timestamp after the slash of the old event. */
	oldTime.end = timestamp2dates[1];

	for (const timeTemplate of timeTemplates) {
		for (const startOrEnd of ['start', 'end']) {
			const time1 = newTime[startOrEnd].substring(
				timeTemplate.start,
				timeTemplate.end
			);

			const time2 = oldTime[startOrEnd].substring(
				timeTemplate.start,
				timeTemplate.end
			);

			const offset = parseInt(time1, 10) - parseInt(time2, 10);
			rv[startOrEnd][timeTemplate.name] = offset || !!offset;
		}
	}
	/* If 0 will return false. */
	return rv as ItimeOffset;
}

/* function padNumber(number: number, n?: number) {
	if (n == undefined) n = 2;
	return (new Array(n).join('0') + number).slice(-n);
} */
